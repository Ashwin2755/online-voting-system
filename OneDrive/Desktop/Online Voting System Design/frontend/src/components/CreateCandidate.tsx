import { useState } from "react";
import { motion } from "motion/react";
import { User, Award, GraduationCap, Upload, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Election, CreateCandidateData } from "../services/api";

interface CreateCandidateProps {
  elections: Election[];
  onSubmit: (candidate: CreateCandidateData) => void;
}

export function CreateCandidate({ elections, onSubmit }: CreateCandidateProps) {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    electionId: "",
    department: "",
    photoUrl: "",
  });
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert("File size should be less than 50MB");
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, photoUrl: base64String });
        setPhotoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData({ ...formData, photoUrl: "" });
    setPhotoPreview("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: "", position: "", electionId: "", department: "", photoUrl: "" });
    setPhotoPreview("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-8"
    >
      <h3 className="text-[#1e3a8a] mb-6">Add New Candidate</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Candidate Name</Label>
            <div className="relative mt-2">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="pl-10 bg-input-background"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="position">Position</Label>
            <div className="relative mt-2">
              <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="position"
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g., President, Vice President"
                className="pl-10 bg-input-background"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="election">Election</Label>
          <Select
            value={formData.electionId}
            onValueChange={(value: string) => setFormData({ ...formData, electionId: value })}
          >
            <SelectTrigger className="mt-2 bg-input-background">
              <SelectValue placeholder="Select Election" />
            </SelectTrigger>
            <SelectContent>
              {elections.map((election) => (
                <SelectItem key={election._id} value={election._id}>
                  {election.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="department">Department</Label>
          <div className="relative mt-2">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <Select
              value={formData.department}
              onValueChange={(value: string) => setFormData({ ...formData, department: value })}
            >
              <SelectTrigger className="pl-10 bg-input-background">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CSE">Computer Science</SelectItem>
                <SelectItem value="ECE">Electronics & Communication</SelectItem>
                <SelectItem value="EEE">Electrical & Electronics</SelectItem>
                <SelectItem value="MECH">Mechanical</SelectItem>
                <SelectItem value="CIVIL">Civil</SelectItem>
                <SelectItem value="IT">Information Technology</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="photo">Candidate Photo</Label>
          <div className="mt-2">
            {photoPreview ? (
              <div className="space-y-3">
                <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-[#d4af37]">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="photo"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="mb-2 text-gray-500">
                    <span className="text-[#1e3a8a]">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">PNG, JPG, or JPEG (max 5MB)</p>
                </div>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">Optional: Upload a photo of the candidate</p>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#d4af37] hover:bg-[#d4af37]/90 text-[#1e3a8a]"
        >
          Add Candidate
        </Button>
      </form>
    </motion.div>
  );
}
