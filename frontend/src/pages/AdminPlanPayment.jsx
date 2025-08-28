import React, { useEffect, useState } from 'react';
import axios from 'axios';  
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { toast } from 'react-toastify';
import Footer from '../components/Footers';
function AdminPlanPayment() {
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [plans , setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [message, setMessage] = useState("");

  
 useEffect(() => {
  const fetchPlans = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/admins/get-plans`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // data = { plans: [...] }
      if (data?.plans) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error("❌ Error fetching plans:", error);
    }
  };

  fetchPlans();
}, []);

  const getFeatures = (planName) => {
    const features = {
      Basic: ['Essential features', 'Email support', '1 user account', 'Basic analytics'],
      Pro: ['All Basic features', 'Priority support', 'Up to 5 users', 'Advanced analytics', 'API access'],
      Enterprise: ['All Pro features', '24/7 dedicated support', 'Unlimited users', 'Custom integrations', 'White-label solution', 'SLA guarantee']
    };
    return features[planName] || [];
  };

  const getPlanColor = (planName) => {
    const colors = {
      Basic: 'from-blue-400 to-blue-600',
      Pro: 'from-purple-500 to-pink-600',
      Enterprise: 'from-orange-400 to-red-500'
    };
    return colors[planName] || 'from-gray-400 to-gray-600';
  };

  const getDurationText = (days) => {
    if (days === 30) return 'Monthly';
    if (days === 90) return 'Quarterly';
    if (days === 365) return 'Yearly';
    return `${days} days`;
  };
    const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
    useEffect(() => {
    loadScript("https://checkout.razorpay.com/v1/checkout.js").then((loaded) => {
      if (!loaded) {
        console.error("Script failed to load");
      } else {
        console.log("Razorpay script loaded successfully");
      }
    });
  }, []);


const navigate = useNavigate();

const handlePlanSelect = async (planId, planName) => {
  console.log(`Selected plan: ${planName} (${planId})`);
  setLoading(true);
  setPaymentStatus(null);
  setMessage("");

  try {
    // 1. Create order
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/api/admins/create-order/${planId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const order = response.data?.details;
    if (!order?.id) {
      throw new Error("Server error. No order id returned");
    }

    console.log("✅ Razorpay order created:", order);

    // 2. Setup Razorpay options
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "GeoFence System",
      description: "Subscription Purchase",
      order_id: order.id,
      handler: async function (res) {
        try {
          // 3. Verify payment with backend
          const verifyRes = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/admins/verify-payment`,
            {
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature,
              planId,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (verifyRes.data.success) {
            setMessage("✅ Payment successful! Your subscription has been purchased.");
            setPaymentStatus("success");
            toast.success("Payment successful! Subscription activated.", { position: "top-center" });
            // Save new token only if backend sends one
            if (verifyRes.data.accessToken) {
              localStorage.setItem("token", verifyRes.data.accessToken);
               navigate("/admindashboard");
            }

           
          } else {
            setMessage(verifyRes.data.message || "Payment verification failed");
            setPaymentStatus("error");
          }
        } catch (err) {
          console.error("❌ Payment verification error:", err);
          setMessage("Payment verification failed");
          toast.error("Payment verification failed", { position: "top-center" });
          setPaymentStatus("error");
        } finally {
          setLoading(false);
        }
      },
    };

    // 4. Open Razorpay modal
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  } catch (err) {
    console.error("❌ Payment initiation error:", err);
    setMessage("Payment initiation failed");
    setPaymentStatus("error");
    setLoading(false);
  }
};



  return (
    <>
    <AdminHeader />
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold  mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Select the perfect subscription plan that fits your needs and budget
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative group cursor-pointer transition-all duration-300 ${
                hoveredPlan === plan.id ? 'scale-105' : ''
              } ${plan.name === 'Pro' ? 'md:-mt-8' : ''}`}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
              onClick={() => handlePlanSelect(plan.id, plan.name)}
            >
              {/* Popular Badge */}
              {plan.name === 'Pro' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Card */}
              <div className={`relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl overflow-hidden transition-all duration-300 ${
                hoveredPlan === plan.id ? 'shadow-purple-500/25' : ''
              }`}>
                {/* Animated Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getPlanColor(plan.name)} opacity-5 transition-opacity duration-300 ${
                  hoveredPlan === plan.id ? 'opacity-10' : ''
                }`}></div>
                
                {/* Glow Effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${getPlanColor(plan.name)} rounded-3xl blur opacity-0 transition-opacity duration-300 ${
                  hoveredPlan === plan.id ? 'opacity-20' : ''
                }`}></div>

                <div className="relative z-10">
                  {/* Plan Name */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className={`w-16 h-1 bg-gradient-to-r ${getPlanColor(plan.name)} rounded-full mx-auto`}></div>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center">
                      <span className="text-gray-400 text-lg">₹</span>
                      <span className="text-5xl font-bold text-white ml-1">{plan.price}</span>
                    </div>
                    <p className="text-gray-400 mt-2">{getDurationText(plan.durationDays)}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      ₹{(plan.price / plan.durationDays * 30).toFixed(2)} per month
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {getFeatures(plan.name).map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-gray-300">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${getPlanColor(plan.name)} flex items-center justify-center mr-3 flex-shrink-0`}>
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                    plan.name === 'Pro' 
                      ? `bg-gradient-to-r ${getPlanColor(plan.name)} shadow-lg hover:shadow-xl hover:scale-105` 
                      : `border-2 border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10`
                  }`}>
                    {plan.name === 'Pro' ? 'Start Free Trial' : 'Get Started'}
                  </button>

                  {/* Plan ID (for admin reference) */}
                  <div className="mt-4 text-center">
                    <span className="text-xs text-gray-500 font-mono">
                      ID: {plan.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-4">All plans include 14-day money-back guarantee</p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              Secure Payment
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              Cancel Anytime
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              24/7 Support
            </span>
          </div>
        </div>
      </div>
      
    </div>
     <footer className="py-4 bg-gray-800 text-gray-300 text-center">
        © {new Date().getFullYear()} GeoFence Tracker. All rights reserved.
      </footer>
    </>
  );
}

export default AdminPlanPayment;