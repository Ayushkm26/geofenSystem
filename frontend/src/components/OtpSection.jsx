import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function OtpSection({ email, onClose, onVerified }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(0); // ✅ FIX: define cooldown state
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Initialize refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Resend cooldown effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index, value) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasteData[i] || '';
    }
    setOtp(newOtp);
    const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
       const otp = otpValue;
       console.log(otp,email);
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/users/after-verify`,
          { email, otp }
        );

        if (response.status === 200) {
            const { user, access } = response.data;
            onVerified({ user, access }); // ✅ pass user data back to parent
          toast.success("OTP verified successfully!", { position: "top-center" });
          // ✅ hand control back to parent
        }
      } catch (error) {
        toast.error("OTP verification failed. Please try again.", { position: "top-center" });
      }
    } else {
      toast.error("Please enter all 6 digits", { position: "top-center" });
    }
  };

  const handleClose = () => {
    setOtp(["", "", "", "", "", ""]);
    onClose(); // ✅ actually closes the modal
  };


  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/api/users/resend-otp`,
      { email }
    );
    if(response.status === 200) {
    toast.success('New OTP sent!', { position: 'top-center' });
    setTimeLeft(300);
    setResendCooldown(50); // ✅ start cooldown
    inputRefs.current[0]?.focus();
    }

    setOtp(['', '', '', '', '', '']);
    
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Enter OTP</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-8 text-center">
          We've sent a 6-digit verification code to your email
        </p>

        {/* OTP Input Boxes */}
        <div className="flex justify-center gap-3 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 border-2 border-gray-300 rounded-lg text-center text-xl font-bold focus:border-blue-500 focus:outline-none bg-gray-50 focus:bg-white"
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleVerify}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Verify OTP
          </button>
          
          <div className="text-center">
            <span className="text-gray-600">Didn't receive the code? </span>
            {resendCooldown > 0 ? (
              <span className="text-gray-400">
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                onClick={handleResend}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Resend
              </button>
            )}
          </div>
        </div>

        {/* Timer */}
        <div className="mt-6 text-center text-sm">
          {timeLeft > 0 ? (
            <span className="text-gray-500">
              Code expires in {formatTime(timeLeft)}
            </span>
          ) : (
            <span className="text-red-500 font-medium">
              Code has expired. Please request a new one.
            </span>
          )}
        </div>
      </div>
    </div>

  );
}
