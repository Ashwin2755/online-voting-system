import { useState } from "react";
import { motion } from "motion/react";
import { TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface PublishResultProps {
  elections: any[];
  onPublish: (electionId: string) => void;
}

export function PublishResult({ elections, onPublish }: PublishResultProps) {
  const [selectedElection, setSelectedElection] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedElection) {
      onPublish(selectedElection);
      setSelectedElection("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-[#d4af37]/10 rounded-full flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-[#d4af37]" />
        </div>
        <div>
          <h3 className="text-[#1e3a8a]">Publish Election Results</h3>
          <p className="text-gray-600">Make results visible to students</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="election">Select Election</Label>
          <Select value={selectedElection} onValueChange={setSelectedElection}>
            <SelectTrigger className="mt-2 bg-input-background">
              <SelectValue placeholder="Choose an ended election" />
            </SelectTrigger>
            <SelectContent>
              {elections.map((election) => (
                <SelectItem key={election.id} value={election.id}>
                  {election.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {elections.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              No ended elections available to publish results
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={!selectedElection}
          className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90"
        >
          Publish Results
        </Button>
      </form>
    </motion.div>
  );
}
