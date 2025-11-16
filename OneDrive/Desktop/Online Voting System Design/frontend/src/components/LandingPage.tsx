import { motion } from "motion/react";
import { ShieldCheck, UserCircle } from "lucide-react";
import campusImage from "../assets/photo.png";

interface LandingPageProps {
  onSelectPortal: (portal: "admin" | "student") => void;
}

export function LandingPage({ onSelectPortal }: LandingPageProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={campusImage}
          alt="Nandha Engineering College Campus"
          className="w-full h-full object-cover filter blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a]/90 via-[#1e3a8a]/80 to-[#0f172a]/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-white mb-4 text-4xl md:text-5xl">
            Nandha Engineering College
          </h1>
          <div className="h-1 w-32 bg-[#d4af37] mx-auto mb-4" />
          <h2 className="text-[#d4af37] text-2xl md:text-3xl">Online Voting System</h2>
          <p className="text-white/80 mt-4 max-w-2xl">
            Secure, Transparent, and Democratic Elections
          </p>
        </motion.div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Admin Portal Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -10 }}
            onClick={() => onSelectPortal("admin")}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 cursor-pointer border-4 border-transparent hover:border-[#d4af37] transition-all"
          >
            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="w-24 h-24 bg-gradient-to-br from-[#1e3a8a] to-[#1e3a8a]/70 rounded-full flex items-center justify-center mb-6 shadow-lg"
              >
                <ShieldCheck className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-[#1e3a8a] mb-3 text-2xl">Admin Portal</h3>
              <p className="text-gray-600">
                Manage elections, candidates, and publish results
              </p>
              <div className="mt-6 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
            </div>
          </motion.div>

          {/* Student Portal Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.05, y: -10 }}
            onClick={() => onSelectPortal("student")}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 cursor-pointer border-4 border-transparent hover:border-[#d4af37] transition-all"
          >
            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="w-24 h-24 bg-gradient-to-br from-[#d4af37] to-[#d4af37]/70 rounded-full flex items-center justify-center mb-6 shadow-lg"
              >
                <UserCircle className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-[#1e3a8a] mb-3 text-2xl">Student Portal</h3>
              <p className="text-gray-600">
                Cast your vote and view election results
              </p>
              <div className="mt-6 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 text-white/60 text-center"
        >
          <p>© 2025 Nandha Engineering College. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
}
