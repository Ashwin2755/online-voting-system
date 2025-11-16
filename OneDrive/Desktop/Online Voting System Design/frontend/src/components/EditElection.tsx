import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, FileText, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { CreateElectionData, Election } from "../services/api";

interface EditElectionProps {
  election: Election | null;
  onSubmit: (electionData: CreateElectionData) => Promise<void>;
  onCancel: () => void;
}

export function EditElection({ election, onSubmit, onCancel }: EditElectionProps) {
  const [formData, setFormData] = useState<CreateElectionData>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOngoing, setIsOngoing] = useState(false);

  useEffect(() => {
    if (election) {
      // Format dates for datetime-local input
      const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      // Check if election is ongoing
      const now = new Date();
      const startDate = new Date(election.startDate);
      const endDate = new Date(election.endDate);
      const ongoing = now >= startDate && now <= endDate;
      setIsOngoing(ongoing);

      setFormData({
        title: election.title,
        description: election.description,
        startDate: formatDateTime(election.startDate),
        endDate: formatDateTime(election.endDate),
      });
    }
  }, [election]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For ongoing elections, only endDate is required
    if (isOngoing) {
      if (!formData.endDate) {
        alert("Please provide an end date for the election");
        return;
      }

      const endDate = new Date(formData.endDate);
      const now = new Date();

      if (endDate <= now) {
        alert("End date must be in the future");
        return;
      }

      try {
        setIsSubmitting(true);
        // For ongoing elections, send only endDate in the request
        await onSubmit({
          title: election?.title || formData.title,
          description: election?.description || formData.description,
          startDate: election?.startDate || formData.startDate,
          endDate: formData.endDate
        });
      } catch (error) {
        console.error("Error updating election:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // For non-ongoing elections, all fields required
      if (!formData.title.trim() || !formData.description.trim() || !formData.startDate || !formData.endDate) {
        alert("Please fill in all fields");
        return;
      }

      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (startDate >= endDate) {
        alert("End date must be after start date");
        return;
      }

      try {
        setIsSubmitting(true);
        await onSubmit(formData);
      } catch (error) {
        console.error("Error updating election:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!election) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-[#1e3a8a] mb-2">Edit Election</h3>
        <p className="text-gray-600">
          {isOngoing 
            ? "This election is ongoing. You can only update the end date and time."
            : "Update the election details below."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Election Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            disabled={isOngoing}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] ${
              isOngoing ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''
            }`}
            placeholder="Enter election title"
            required={!isOngoing}
          />
          {isOngoing && <p className="text-sm text-gray-500 mt-1">Cannot modify during ongoing election</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={isOngoing}
            rows={4}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] ${
              isOngoing ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''
            }`}
            placeholder="Enter election description"
            required={!isOngoing}
          />
          {isOngoing && <p className="text-sm text-gray-500 mt-1">Cannot modify during ongoing election</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              disabled={isOngoing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] ${
                isOngoing ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''
              }`}
              required={!isOngoing}
            />
            {isOngoing && <p className="text-sm text-gray-500 mt-1">Cannot modify during ongoing election</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              End Date & Time
              {isOngoing && <span className="text-red-500 ml-1">*Required</span>}
            </label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] ${
                isOngoing ? 'border-blue-500 bg-blue-50' : ''
              }`}
              required
            />
            {isOngoing && <p className="text-sm text-blue-600 mt-1">✓ You can update this field</p>}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90"
          >
            {isSubmitting ? "Updating..." : isOngoing ? "Update End Date" : "Update Election"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
        </div>
      </form>
    </motion.div>
  );
}