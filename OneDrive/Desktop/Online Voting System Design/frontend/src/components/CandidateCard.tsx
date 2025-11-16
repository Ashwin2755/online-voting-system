import { motion } from "motion/react";
import { User, GraduationCap, Award } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CandidateCardProps {
  name: string;
  position: string;
  department: string;
  photo?: string;
  onVote?: () => void;
  showVoteButton?: boolean;
  isSelected?: boolean;
  voteCount?: number;
  showVoteCount?: boolean;
}

export function CandidateCard({
  name,
  position,
  department,
  photo,
  onVote,
  showVoteButton = false,
  isSelected = false,
  voteCount,
  showVoteCount = false,
}: CandidateCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg shadow-lg p-6 border-2 transition-all w-full max-w-sm ${
        isSelected ? "border-[#d4af37] ring-4 ring-[#d4af37]/20" : "border-gray-100 hover:border-[#1e3a8a]"
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-[#d4af37]">
          {photo ? (
            <ImageWithFallback src={photo} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#1e3a8a] flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
          )}
        </div>

        <h3 className="text-[#1e3a8a] mb-2">{name}</h3>

        <div className="space-y-2 mb-4 w-full">
          <div className="flex items-center justify-center text-gray-600">
            <Award className="w-4 h-4 mr-2 text-[#d4af37]" />
            <span className="text-sm">{position}</span>
          </div>
          <div className="flex items-center justify-center text-gray-600">
            <GraduationCap className="w-4 h-4 mr-2 text-[#1e3a8a]" />
            <span className="text-sm">{department}</span>
          </div>
        </div>

        {showVoteCount && voteCount !== undefined && (
          <div className="bg-[#1e3a8a] text-white px-4 py-2 rounded-full mb-3">
            {voteCount} Votes
          </div>
        )}

        {showVoteButton && (
          <Button
            onClick={onVote}
            className="w-full bg-[#d4af37] hover:bg-[#d4af37]/90 text-[#1e3a8a]"
          >
            {isSelected ? "Selected" : "Vote"}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
