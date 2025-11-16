import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Key, Shield, ArrowLeft, Eye, EyeOff, UserCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { apiService } from "../services/api";

interface ForgotPasswordProps {
  onBack: () => void;
  onSuccess: () => void;
}

type Step = 'email' | 'otp' | 'password';

export function ForgotPassword({ onBack, onSuccess }: ForgotPasswordProps) {
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.forgotPassword(email.trim());
      setMaskedEmail(response.email || email);
      setCurrentStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    try {
      setIsLoading(true);
      await apiService.verifyOTP(email, otp.trim());
      setCurrentStep('password');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await apiService.resetPassword(email, otp, newPassword);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      setError('');
      await apiService.forgotPassword(email);
      alert('OTP sent successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background - Same as StudentLogin */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37] via-[#d4af37]/90 to-[#1e3a8a]" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          {/* Header - Same style as StudentLogin */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#d4af37]/70 rounded-full flex items-center justify-center">
              {currentStep === 'email' && <Mail className="w-8 h-8 text-white" />}
              {currentStep === 'otp' && <Shield className="w-8 h-8 text-white" />}
              {currentStep === 'password' && <Key className="w-8 h-8 text-white" />}
            </div>
          </div>

          <h2 className="text-center text-[#1e3a8a] mb-2">
            {currentStep === 'email' && 'Reset Password'}
            {currentStep === 'otp' && 'Verify OTP'}
            {currentStep === 'password' && 'Create New Password'}
          </h2>
          <p className="text-center text-gray-600 mb-6">
            {currentStep === 'email' && 'Enter your email to receive an OTP'}
            {currentStep === 'otp' && `Enter the 6-digit code sent to ${maskedEmail}`}
            {currentStep === 'password' && 'Enter your new password'}
          </p>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${currentStep === 'email' ? 'bg-[#1e3a8a]' : 'bg-[#d4af37]'}`} />
              <div className={`w-8 h-0.5 ${currentStep === 'otp' || currentStep === 'password' ? 'bg-[#d4af37]' : 'bg-gray-300'}`} />
              <div className={`w-3 h-3 rounded-full ${currentStep === 'otp' ? 'bg-[#1e3a8a]' : currentStep === 'password' ? 'bg-[#d4af37]' : 'bg-gray-300'}`} />
              <div className={`w-8 h-0.5 ${currentStep === 'password' ? 'bg-[#d4af37]' : 'bg-gray-300'}`} />
              <div className={`w-3 h-3 rounded-full ${currentStep === 'password' ? 'bg-[#1e3a8a]' : 'bg-gray-300'}`} />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Email */}
          {currentStep === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="pl-10 bg-input-background"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          )}

          {/* Step 2: OTP */}
          {currentStep === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <Label htmlFor="otp">Verification Code</Label>
                <div className="relative mt-2">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="pl-10 bg-input-background text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  OTP expires in 10 minutes
                </p>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-[#1e3a8a] hover:text-[#1e3a8a]/80 text-sm"
                >
                  Resend OTP
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {currentStep === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative mt-2">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pl-10 pr-12 bg-input-background"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative mt-2">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="pl-10 pr-12 bg-input-background"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}

          {/* Back Button */}
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full text-gray-600 mt-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </motion.div>
      </div>
    </div>
  );
}