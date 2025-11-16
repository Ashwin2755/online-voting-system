import { motion } from "motion/react";
import { Calendar, Users, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";

interface ElectionCardProps {
  title: string;
  startDate: string;
  endDate: string;
  candidateCount: number;
  status: "Ongoing" | "Upcoming" | "Ended";
  onVote?: () => void;
  onViewResults?: () => void;
  showVoteButton?: boolean;
  showResultButton?: boolean;
}

export function ElectionCard({
  title,
  startDate,
  endDate,
  candidateCount,
  status,
  onVote,
  onViewResults,
  showVoteButton = false,
  showResultButton = false,
}: ElectionCardProps) {
  const statusColors = {
    Ongoing: "bg-green-500",
    Upcoming: "bg-blue-500",
    Ended: "bg-gray-500",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-100 hover:border-[#d4af37] transition-colors w-full max-w-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-[#1e3a8a] mb-2">{title}</h3>
          <span className={`${statusColors[status]} text-white px-3 py-1 rounded-full text-sm inline-block`}>
            {status}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="text-sm">
            {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center text-gray-600">
          <Users className="w-4 h-4 mr-2" />
          <span className="text-sm">{candidateCount} Candidates</span>
        </div>
      </div>

      <div className="flex gap-2">
        {showVoteButton && status === "Ongoing" && (
          <Button onClick={onVote} className="flex-1 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90">
            Vote Now
          </Button>
        )}
        {showResultButton && status === "Ended" && (
          <Button onClick={onViewResults} variant="outline" className="flex-1 border-[#d4af37] text-[#1e3a8a]">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Results
          </Button>
        )}
      </div>
    </motion.div>
  );
}
