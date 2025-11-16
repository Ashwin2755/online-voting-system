import { motion } from "motion/react";
import { User, Hash, GraduationCap, CheckCircle, XCircle } from "lucide-react";

interface VoterCardProps {
  name: string;
  studentId: string;
  department: string;
  hasVoted: boolean;
}

export function VoterCard({ name, studentId, department, hasVoted }: VoterCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-100 hover:border-[#d4af37] transition-colors w-full max-w-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-[#1e3a8a] flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-[#1e3a8a]">{name}</h4>
            </div>
          </div>
        </div>
        {hasVoted ? (
          <CheckCircle className="w-6 h-6 text-green-500" />
        ) : (
          <XCircle className="w-6 h-6 text-gray-400" />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-gray-600">
          <Hash className="w-4 h-4 mr-2" />
          <span className="text-sm">{studentId}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <GraduationCap className="w-4 h-4 mr-2" />
          <span className="text-sm">{department}</span>
        </div>
        <div className="pt-2">
          <span className={`px-3 py-1 rounded-full text-sm ${
            hasVoted ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
          }`}>
            {hasVoted ? "Voted" : "Not Voted"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
