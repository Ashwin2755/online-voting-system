import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Mail, Lock, Hash, UserCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { apiService } from "../services/api";
import { toast } from "sonner";

interface StudentLoginProps {
  onLogin: (userData: any) => void;
  onRegister: () => void;
  onBack: () => void;
  onForgotPassword: () => void;
}

export function StudentLogin({ onLogin, onRegister, onBack, onForgotPassword }: StudentLoginProps) {
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.studentLogin(email, studentId, password);
      toast.success(`Welcome back, ${response.user.fullName}!`);
      onLogin(response.user);
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37] via-[#d4af37]/90 to-[#1e3a8a]" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          {/* Header */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#d4af37]/70 rounded-full flex items-center justify-center">
              <UserCircle className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="text-center text-[#1e3a8a] mb-2">Student Portal</h2>
          <p className="text-center text-gray-600 mb-6">Sign in to cast your vote</p>

          {/* Registration Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-amber-800 mb-1">New Student?</h3>
            <p className="text-xs text-amber-700">
              You must register your account first before you can login and vote.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="pl-10 bg-input-background"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="studentId">Student ID</Label>
              <div className="relative mt-2">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="studentId"
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter your student ID (e.g., NEC2025001)"
                  className="pl-10 bg-input-background"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 bg-input-background"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Login"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={onForgotPassword}
                className="text-[#1e3a8a] hover:text-[#1e3a8a]/80 text-sm"
              >
                Forgot Password?
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={onRegister}
              className="w-full border-[#d4af37] text-[#1e3a8a]"
            >
              Register New Account
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="w-full text-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portal Selection
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
