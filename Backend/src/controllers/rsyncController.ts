import { prisma } from "../server";
import { Request, Response } from "express";

export const createResyncRequest = async (req: Request, res: Response) => {
  const { fenceId, timing, requestReason, type } = req.body;

  try {
    // 1. Check if a pending resync request already exists
    const existingRequest = await prisma.resync.findFirst({
      where: {
        fenceId,
        userId: req.user?.id,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ error: "A pending resync request already exists for this fence." });
    }

    // 2. Find admin responsible for this geofence
    console.log("Finding geofence with ID:", fenceId);
const fence = await prisma.geoFenceArea.findUnique({
  where: {
    id: fenceId, 
  },
  include: {
    admin: true,
  },
});

if (!fence || !fence.admin) {
  return res.status(404).json({
    error: "No admin found for this geofence",
  });
}

const admin = fence.admin;



    // 3. Create new resync request
    const resyncRequest = await prisma.resync.create({
      data: {
        user: { connect: { id: req.user?.id } },
        admin: { connect: { id: admin.id } }, // optional until approval
        geofence: { connect: { id: fenceId } },
        date: timing || new Date(),
        requestReason,
        type: type || "NETWORK-ERROR",
        status: "PENDING",
        approved: false,
      },
    });

    return res.status(201).json(resyncRequest);
  } catch (error) {
    console.error("Error creating resync request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const getResyncRequests = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.resync.findMany({
      where: {
        adminId: req.admin?.id, // only fetch requests assigned to this admin
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        geofence: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching resync requests:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const approveResyncRequest = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Find the resync request first
    const resyncRequest = await prisma.resync.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!resyncRequest) {
      return res.status(404).json({ error: "Resync request not found" });
    }

    // Apply conditional logic
    if (resyncRequest.type === "Device Switch") {
      await prisma.user.update({
        where: { id: resyncRequest.userId },
        data: { currentStatus: true },
      });
      console.log("User status updated to active");
    } else if (resyncRequest.type === "Location History Update") {
      await prisma.location.updateMany({
        where: { userId: resyncRequest.userId, outTime: null },
        data: { outTime: new Date() },
      });
    }

    // Approve the request
    const updatedRequest = await prisma.resync.update({
      where: { id },
      data: { status: "APPROVED", approved: true },
    });

    return res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Error approving resync request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const rejectResyncRequest = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const resyncRequest = await prisma.resync.update({
      where: { id },
      data: { status: "REJECTED", approved: false },
    });

    return res.status(200).json(resyncRequest);
  } catch (error) {
    console.error("Error rejecting resync request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const getUserResyncHistory = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  try {
    const history = await prisma.resync.findMany({
      where: { userId },
      include: {
        geofence: {
          select: { id: true, name: true },
        },
        admin: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching user resync history:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
