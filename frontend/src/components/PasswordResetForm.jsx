import React, { useState, useRef, useEffect } from 'react';
import { X, Eye, EyeOff, Lock, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function PasswordResetForm({ email, onClose }) {
  const [step, setStep] = useState(1); // 1: OTP, 2: Password
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(50);
  const [errors, setErrors] = useState({});
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft > 0 && step === 1) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, step]);

  // Resend cooldown effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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
      handleVerifyOTP();
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

  const handleVerifyOTP = () => {
    const otpValue = otp.join('');
    if (otpValue.length === 6) {
      setStep(2);
      setErrors({});
    } else {
      setErrors({ otp: 'Please enter all 6 digits' });
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    
    alert('New OTP sent!');
    setOtp(['', '', '', '', '', '']);
    setTimeLeft(300);
    setResendCooldown(50);
    setErrors({});
    inputRefs.current[0]?.focus();
  };

  const validatePassword = () => {
    const newErrors = {};
    
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async () => {
    const otpValue = otp.join('');
    
    // Validate OTP first
    if (otpValue.length !== 6) {
      setErrors({ otp: 'Please enter valid OTP' });
      setStep(1);
      return;
    }
    
    // Validate password
    if (!validatePassword()) {
      return;
    }

    try {
      // Prepare data for backend
      const requestData = {
        otp: otpValue,
        newPassword: password,
        email: email
      };

      console.log('Sending to backend:', requestData);
      
      // Replace this with your actual API endpoint
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        navigate('/userlogin');
        toast.success(result.message || 'Password reset successfully!');
        onClose(); // Close the form
      } else {
        const error = await response.json();
        setErrors({ submit: error.message || 'Failed to reset password' });
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors({ submit: 'Network error. Please try again.' });
    }
  };

  const handleClose = () => {
    setStep(1);
    setOtp(['', '', '', '', '', '']);
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    onClose(); // Actually closes the modal
  };

  const getPasswordStrength = () => {
    const length = password.length;
    if (length === 0) return { strength: '', color: '' };
    if (length < 6) return { strength: 'Too Short', color: 'text-red-500' };
    if (length < 8) return { strength: 'Weak', color: 'text-orange-500' };
    if (length < 12) return { strength: 'Good', color: 'text-yellow-500' };
    return { strength: 'Strong', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all duration-500 backdrop-blur-sm">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {step === 1 ? (
              <div className="bg-blue-100 p-2 rounded-full">
                <Shield className="text-blue-600" size={24} />
              </div>
            ) : (
              <div className="bg-green-100 p-2 rounded-full">
                <Lock className="text-green-600" size={24} />
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-800">
              {step === 1 ? 'Verify OTP' : 'Reset Password'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
              {step > 1 ? <CheckCircle size={16} /> : '1'}
            </div>
            <div className={`w-12 h-1 mx-2 ${step > 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
              2
            </div>
          </div>
        </div>

        {step === 1 ? (
          // OTP Step
          <>
            <div className="text-center mb-8">
              <p className="text-gray-600 mb-2">
                We've sent a 6-digit verification code to
              </p>
              <p className="font-semibold text-gray-800">{email}</p>
            </div>

            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-3 mb-6">
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
                  className={`w-12 h-12 border-2 rounded-xl text-center text-xl font-bold focus:outline-none transition-all duration-200 ${
                    errors.otp 
                      ? 'border-red-300 bg-red-50 focus:border-red-500' 
                      : 'border-gray-300 bg-gray-50 focus:border-blue-500 focus:bg-white focus:shadow-lg'
                  }`}
                  autoComplete="off"
                />
              ))}
            </div>

            {errors.otp && (
              <p className="text-red-500 text-sm text-center mb-4">{errors.otp}</p>
            )}

            <button
              onClick={handleVerifyOTP}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
            >
              Continue
            </button>
            
            <div className="text-center mt-6">
              <span className="text-gray-600">Didn't receive the code? </span>
              {resendCooldown > 0 ? (
                <span className="text-gray-400">
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  Resend
                </button>
              )}
            </div>

            <div className="mt-4 text-center text-sm">
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
          </>
        ) : (
          // Password Step
          <>
            <div className="text-center mb-8">
              <p className="text-gray-600">
                Create a new password for your account
              </p>
            </div>

            <div className="space-y-6">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={validatePassword}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 pr-12 ${
                      errors.password 
                        ? 'border-red-300 bg-red-50 focus:border-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:shadow-lg'
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {password && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-gray-500">Strength:</span>
                    <span className={`text-sm font-medium ${passwordStrength.color}`}>
                      {passwordStrength.strength}
                    </span>
                  </div>
                )}
                
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={validatePassword}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 pr-12 ${
                      errors.confirmPassword 
                        ? 'border-red-300 bg-red-50 focus:border-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:shadow-lg'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-2 font-medium">Password must contain:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className={`flex items-center gap-2 ${password.length >= 6 ? 'text-green-600' : ''}`}>
                    <CheckCircle size={16} className={password.length >= 6 ? 'text-green-600' : 'text-gray-400'} />
                    At least 6 characters
                  </li>
                </ul>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {errors.submit}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}