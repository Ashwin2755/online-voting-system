import { useState } from "react";
import { motion } from "motion/react";
import { Calendar, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface CreateElectionProps {
  onSubmit: (election: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
  }) => void;
}

export function CreateElection({ onSubmit }: CreateElectionProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ title: "", description: "", startDate: "", endDate: "" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-8"
    >
      <h3 className="text-[#1e3a8a] mb-6">Create New Election</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">Election Title</Label>
          <div className="relative mt-2">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Student Council Election 2025"
              className="pl-10 bg-input-background"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the election purpose and rules..."
            className="mt-2 bg-input-background min-h-[100px]"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="startDate">Start Date & Time</Label>
            <div className="relative mt-2">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="pl-10 bg-input-background"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="endDate">End Date & Time</Label>
            <div className="relative mt-2">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="pl-10 bg-input-background"
                required
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90"
        >
          Create Election
        </Button>
      </form>
    </motion.div>
  );
}
