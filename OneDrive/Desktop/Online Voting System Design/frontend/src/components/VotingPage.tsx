import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { CandidateCard } from "./CandidateCard";
import { apiService, Candidate, VoteStatus } from "../services/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface VotingPageProps {
  election: any;
  onSubmitVote: (candidateId: string) => void;
  onBack: () => void;
}

export function VotingPage({ election, onSubmitVote, onBack }: VotingPageProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteStatus, setVoteStatus] = useState<VoteStatus | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load candidates for this specific election and check vote status
  useEffect(() => {
    if (election) {
      console.log('VotingPage - Loading candidates for election:', election);
      const user = apiService.getCurrentUser();
      setCurrentUser(user);
      loadCandidatesForElection();
      if (user && user.studentId) {
        checkVoteStatus(user.studentId);
      }
    }
  }, [election]);

  const loadCandidatesForElection = async () => {
    try {
      setIsLoading(true);
      // Use the election ID to fetch candidates for this specific election
      const electionId = election._id || election.id;
      console.log('Fetching candidates for election ID:', electionId);
      const candidatesData = await apiService.getCandidatesByElection(electionId);
      setCandidates(candidatesData);
      console.log('Loaded candidates for election:', electionId, candidatesData);
    } catch (err) {
      console.error('Error loading candidates for election:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkVoteStatus = async (studentId: string) => {
    try {
      const electionId = election._id || election.id;
      const status = await apiService.getVoteStatus(electionId, studentId);
      setVoteStatus(status);
      console.log('Vote status for student:', studentId, status);
    } catch (err) {
      console.error('Error checking vote status:', err);
    }
  };

  const handleVoteClick = (candidateId: string) => {
    setSelectedCandidate(candidateId);
  };

  const handleSubmit = () => {
    if (selectedCandidate) {
      setShowConfirm(true);
    }
  };

  const handleConfirm = async () => {
    if (selectedCandidate && currentUser && currentUser.studentId) {
      try {
        setIsSubmitting(true);
        const electionId = election._id || election.id;
        
        await apiService.submitVote({
          electionId,
          candidateId: selectedCandidate,
          studentId: currentUser.studentId
        });

        // Update vote status
        await checkVoteStatus(currentUser.studentId);
        
        // Call the original onSubmitVote for any additional UI updates
        onSubmitVote(selectedCandidate);
        
        // Close the confirmation dialog
        setShowConfirm(false);
        setSelectedCandidate(null);
        
        console.log('Vote submitted successfully');
      } catch (err) {
        console.error('Error submitting vote:', err);
        alert(`Error submitting vote: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!election) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold text-gray-700 mb-4">No Election Data</h2>
          <p className="text-gray-600 mb-4">Election information is missing.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-[#d4af37]">
        <div className="container mx-auto px-6 py-4">
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-[#1e3a8a]">{election.title}</h1>
          <p className="text-gray-600">{election.description}</p>
        </div>
      </header>

      {/* Vote Status Alert */}
      {voteStatus && voteStatus.hasVoted && (
        <div className="container mx-auto px-6 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800">Vote Already Submitted</h4>
                <p className="text-green-700">
                  You voted for <strong>{voteStatus.votedFor}</strong> on{' '}
                  {voteStatus.votedAt ? new Date(voteStatus.votedAt).toLocaleString() : 'Unknown time'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#1e3a8a]">Select Your Candidate</h3>
              {selectedCandidate && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 text-green-600"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Candidate Selected</span>
                </motion.div>
              )}
            </div>
            <p className="text-gray-600 mb-6">
              Choose one candidate to cast your vote. Your vote is confidential and cannot be changed once submitted.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {isLoading ? (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500">Loading candidates...</p>
                </div>
              ) : candidates.length > 0 ? (
                candidates.map((candidate) => (
                  <CandidateCard
                    key={candidate._id}
                    name={candidate.name}
                    position={candidate.position}
                    department={candidate.department}
                    photo={candidate.photoUrl}
                    showVoteButton={!voteStatus?.hasVoted}
                    isSelected={selectedCandidate === candidate._id}
                    onVote={() => !voteStatus?.hasVoted && handleVoteClick(candidate._id)}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500">No candidates available for this election yet.</p>
                </div>
              )}
            </div>

            {candidates.length > 0 && !voteStatus?.hasVoted && (
              <div className="flex justify-center">
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedCandidate}
                  className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 px-8"
                  size="lg"
                >
                  Submit Vote
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Vote</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to vote for{" "}
              <span className="font-semibold text-[#1e3a8a]">
                {candidates.find((c) => c._id === selectedCandidate)?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90"
            >
              {isSubmitting ? 'Submitting...' : 'Confirm Vote'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
