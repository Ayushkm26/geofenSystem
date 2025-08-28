import razorpayInstance from "../config/razorpay.config";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Request, Response } from "express";
import { persistToken, revokeToken, signAccessToken, signRefreshToken } from "../auth/token";
import tokens from "razorpay/dist/types/tokens";

const prisma = new PrismaClient().$extends(withAccelerate());

// ----------------- Create Order -----------------
export const createOrder = async (req: Request<{ planId: string }>, res: Response) => {
  try {
    const { planId } = req.params;

    const subscriptiondata = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!subscriptiondata) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    const options = {
      amount: subscriptiondata.price * 100, // in paise
      currency: subscriptiondata.currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpayInstance.orders.create(options);
    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      details: order,
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

// ----------------- Verify Payment -----------------

interface VerifyPaymentBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  planId: string; // <-- include this in frontend request body
}



export const verifyPayment = async (
  req: Request<{}, {}, VerifyPaymentBody> & { admin?: { id: string } },
  res: Response
) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay key secret is not configured",
      });
    }

    // 🔑 Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // 🔑 Find plan
    const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!subscriptionPlan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    if (!req.admin?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: admin not found in request",
      });
    }

    // 🔑 Update admin subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + subscriptionPlan.durationDays);

    const updatedAdmin = await prisma.admin.update({
      where: { id: req.admin.id },
      data: {
        subscriptionPlan: { connect: { id: subscriptionPlan.id } },
        subscriptionStart: startDate,
        subscriptionEnd: endDate,
        isActive: true,
      },
    });
   
    if (!updatedAdmin) {
      return res.status(500).json({
        success: false,
        message: "Failed to update admin subscription",
      });
    }

    // 🔑 Generate tokens
    const accessToken = signAccessToken({
      sub: updatedAdmin.id,
      role: updatedAdmin.role,
      email: updatedAdmin.email,
      isActive: updatedAdmin.isActive,
      subscriptionEnd: updatedAdmin.subscriptionEnd,
      subscriptionStart: updatedAdmin.subscriptionStart,
    });

    const refreshToken = signRefreshToken({
      sub: updatedAdmin.id,
      role: updatedAdmin.role,
      email: updatedAdmin.email,
      isActive: updatedAdmin.isActive,
      subscriptionEnd: updatedAdmin.subscriptionEnd,
      subscriptionStart: updatedAdmin.subscriptionStart,
    });

    const accessExp = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // 1d
    const refreshExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7d
    await persistToken(accessToken, updatedAdmin.id, "ACCESS", accessExp);
    await persistToken(refreshToken, updatedAdmin.id, "REFRESH", refreshExp);
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
    if (token) {
      await revokeToken(token, "Payment");
    }
    
    // ✅ Success response
    return res.status(200).json({
      success: true,
      message: "Payment verified and subscription activated",
      details: {
        subscription: subscriptionPlan,
        validTill: endDate,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("❌ verifyPayment error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during payment verification",
    });
  }
};
