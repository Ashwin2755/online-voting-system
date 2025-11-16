import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Mail, Lock, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { apiService } from "../services/api";
import { toast } from "sonner";

interface AdminLoginProps {
  onLogin: (userData: any) => void;
  onBack: () => void;
}

export function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.adminLogin(email, password);
      toast.success(response.message);
      onLogin(response.user);
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail("admin@nec.edu");
    setPassword("admin123");
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
            <div className="w-16 h-16 bg-gradient-to-br from-[#1e3a8a] to-[#1e3a8a]/70 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="text-center text-[#1e3a8a] mb-2">Admin Portal</h2>
          <p className="text-center text-gray-600 mb-6">Sign in to manage elections</p>
          
          {/* Demo Account Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Demo Account</h3>
            <p className="text-xs text-blue-600 mb-2">Use these credentials to test the admin portal:</p>
            <div className="text-xs text-blue-700">
              <p><strong>Email:</strong> admin@nec.edu</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDemoLogin}
              className="mt-2 w-full border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              Use Demo Credentials
            </Button>
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
                  placeholder="Enter your admin email address"
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
                  placeholder="Enter your admin password"
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

            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="w-full border-[#d4af37] text-[#1e3a8a]"
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
