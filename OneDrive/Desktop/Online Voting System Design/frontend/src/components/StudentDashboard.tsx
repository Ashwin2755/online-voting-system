import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { LogOut, Vote, History, TrendingUp, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ElectionCard } from "./ElectionCard";
import { VoterCard } from "./VoterCard";
import { CandidateCard } from "./CandidateCard";
import { apiService, Election, Candidate } from "../services/api";

interface StudentDashboardProps {
  student: any;
  onLogout: () => void;
  votes: any[];
  onVote: (electionId: string, election?: any) => void;
  onViewResults: (electionId: string) => void;
}

export function StudentDashboard({
  student,
  onLogout,
  votes,
  onVote,
  onViewResults,
}: StudentDashboardProps) {
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load elections and candidates from backend
  useEffect(() => {
    loadElections();
    loadCandidates();
    
    // Set up periodic refresh to catch new candidates added by admin
    const intervalId = setInterval(() => {
      loadElections();
      loadCandidates();
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  const loadElections = async () => {
    try {
      setIsLoading(true);
      const electionsData = await apiService.getAllElections();
      setElections(electionsData);
      setError(null);
    } catch (err) {
      setError('Failed to load elections');
      console.error('Error loading elections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCandidates = async () => {
    try {
      const candidatesData = await apiService.getAllCandidates();
      setCandidates(candidatesData);
    } catch (err) {
      console.error('Error loading candidates:', err);
    }
  };

  // Function to calculate real-time election status
  const getElectionStatus = (startDate: string, endDate: string): 'Upcoming' | 'Ongoing' | 'Ended' => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'Upcoming';
    if (now > end) return 'Ended';
    return 'Ongoing';
  };

  // Function to get elections with real-time status
  const getElectionsWithRealTimeStatus = () => {
    return elections.map(election => ({
      ...election,
      status: getElectionStatus(election.startDate, election.endDate)
    }));
  };

  const electionsWithStatus = getElectionsWithRealTimeStatus();
  const ongoingElections = electionsWithStatus.filter((e) => e.status === "Ongoing");
  const upcomingElections = electionsWithStatus.filter((e) => e.status === "Upcoming");
  const endedElections = electionsWithStatus.filter((e) => e.status === "Ended");

  const hasVoted = (electionId: string) => {
    return votes.some((v) => v.electionId === electionId && v.studentId === student.studentId);
  };

  const getVoteHistory = () => {
    return votes.filter((v) => v.studentId === student.studentId);
  };

  // Function to get candidate count for an election
  const getCandidateCount = (electionId: string) => {
    const candidateElectionId = candidates.filter((c) => {
      const cElectionId = c.electionId?.toString() || c.electionId;
      return cElectionId === electionId;
    }).length;
    return candidateElectionId;
  };

  // Function to handle tab changes and refresh data
  const handleTabChange = (value: string) => {
    // Refresh data when switching tabs to ensure latest candidates
    loadElections();
    loadCandidates();
    console.log('Tab changed to:', value, 'Refreshing data...');
  };

  // Function to delete a single vote record
  const handleDeleteSingleVote = async (voteId: string) => {
    try {
      await apiService.deleteVote(voteId);
      // Reload votes after deletion
      loadElections();
      loadCandidates();
      console.log('Vote deleted successfully');
    } catch (err) {
      console.error('Error deleting vote:', err);
      setError('Failed to delete vote');
    }
  };

  // Function to delete all vote history for the student
  const handleDeleteVoteHistory = async () => {
    try {
      const voteIds = getVoteHistory().map((v) => v._id);
      await Promise.all(voteIds.map((id) => apiService.deleteVote(id)));
      // Reload votes after deletion
      loadElections();
      loadCandidates();
      console.log('All votes deleted successfully');
    } catch (err) {
      console.error('Error deleting votes:', err);
      setError('Failed to delete vote history');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d4af37]/10 via-white to-[#1e3a8a]/10">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1e3a8a] to-[#1e3a8a]/90 shadow-lg border-b-4 border-[#d4af37]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-2xl">Student Portal</h1>
              <p className="text-[#d4af37] font-medium">Welcome, {student.fullName}</p>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#1e3a8a] font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Student Info Card */}
          <div className="mb-8">
            <VoterCard
              name={student.fullName}
              studentId={student.studentId}
              department={student.department}
              hasVoted={votes.some((v) => v.studentId === student.studentId)}
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="ongoing" className="space-y-6" onValueChange={handleTabChange}>
            <TabsList className="bg-gradient-to-r from-white to-[#d4af37]/10 shadow-lg p-1 border border-[#d4af37]/20">
              <TabsTrigger 
                value="ongoing"
                className="data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white font-medium"
              >
                <Vote className="w-4 h-4 mr-2" />
                Ongoing Elections
              </TabsTrigger>
              <TabsTrigger 
                value="upcoming"
                className="data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white font-medium"
              >
                Upcoming
              </TabsTrigger>
              <TabsTrigger 
                value="results"
                className="data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white font-medium"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Results
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                className="data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white font-medium"
              >
                <History className="w-4 h-4 mr-2" />
                Vote History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ongoing">
              <div className="bg-gradient-to-br from-white to-[#1e3a8a]/5 rounded-lg shadow-lg p-6 border border-[#d4af37]/20">
                <h3 className="text-[#1e3a8a] mb-6 font-bold">Cast Your Vote</h3>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading elections...</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ongoingElections.map((election) => (
                      <div
                        key={election._id}
                        className="border border-[#d4af37]/30 rounded-lg p-4 hover:border-[#d4af37] transition-all duration-300 bg-gradient-to-br from-white to-[#1e3a8a]/5 shadow-md hover:shadow-lg"
                      >
                        <div className="mb-4">
                          <h4 className="text-[#1e3a8a] text-lg mb-2">{election.title}</h4>
                          <p className="text-gray-600 text-sm mb-2">{election.description}</p>
                          <p className="text-sm text-gray-600 mb-2">
                            {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
                          </p>
                          <div className="flex items-center justify-between mb-3">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                              {election.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              Candidates: {getCandidateCount(election._id)}
                            </span>
                          </div>
                        </div>
                        {!hasVoted(election._id) && (
                          <Button 
                            onClick={() => onVote(election._id, election)}
                            className="w-full bg-gradient-to-r from-[#d4af37] to-[#1e3a8a] text-white hover:from-[#b8941e] hover:to-[#1e3a8a]/90 transition-all duration-300 font-medium"
                          >
                            <Vote className="w-4 h-4 mr-2" />
                            Vote Now
                          </Button>
                        )}
                        {hasVoted(election._id) && (
                          <div className="w-full p-2 bg-gray-100 rounded text-center text-gray-600 text-sm">
                            ✓ You have already voted
                          </div>
                        )}
                      </div>
                    ))}
                    {ongoingElections.length === 0 && !isLoading && (
                      <p className="text-gray-500 col-span-3 text-center py-8">
                        No ongoing elections at the moment
                      </p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>            <TabsContent value="upcoming">
              <div className="bg-gradient-to-br from-white to-[#1e3a8a]/5 rounded-lg shadow-lg p-6 border border-[#d4af37]/20">
                <h3 className="text-[#1e3a8a] mb-6 font-bold">Upcoming Elections</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingElections.map((election) => (
                    <div
                      key={election._id}
                      className="border border-[#d4af37]/30 rounded-lg p-4 hover:border-[#d4af37] transition-all duration-300 bg-gradient-to-br from-white to-[#1e3a8a]/5 shadow-md hover:shadow-lg"
                    >
                      <div className="mb-4">
                        <h4 className="text-[#1e3a8a] text-lg mb-2">{election.title}</h4>
                        <p className="text-gray-600 text-sm mb-2">{election.description}</p>
                        <p className="text-sm text-gray-600 mb-2">
                          {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                            {election.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            Candidates: {getCandidateCount(election._id)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {upcomingElections.length === 0 && !isLoading && (
                    <p className="text-gray-500 col-span-3 text-center py-8">
                      No upcoming elections scheduled
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="results">
              <div className="bg-gradient-to-br from-white to-[#1e3a8a]/5 rounded-lg shadow-lg p-6 border border-[#d4af37]/20">
                <h3 className="text-[#1e3a8a] mb-6 font-bold">Election Results</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {endedElections.map((election) => (
                    <div
                      key={election._id}
                      className="border border-[#d4af37]/30 rounded-lg p-4 hover:border-[#d4af37] transition-all duration-300 bg-gradient-to-br from-white to-[#1e3a8a]/5 shadow-md hover:shadow-lg"
                    >
                      <div className="mb-4">
                        <h4 className="text-[#1e3a8a] text-lg mb-2">{election.title}</h4>
                        <p className="text-gray-600 text-sm mb-2">{election.description}</p>
                        <p className="text-sm text-gray-600 mb-2">
                          {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                            {election.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            Candidates: {getCandidateCount(election._id)}
                          </span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => onViewResults(election._id)}
                        variant="outline" 
                        className="w-full border-[#d4af37] text-[#1e3a8a] bg-gradient-to-r from-white to-[#d4af37]/5 hover:bg-gradient-to-r hover:from-[#d4af37] hover:to-[#1e3a8a] hover:text-white transition-all duration-300 font-medium"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        View Results
                      </Button>
                    </div>
                  ))}
                  {endedElections.length === 0 && !isLoading && (
                    <p className="text-gray-500 col-span-3 text-center py-8">
                      No results available yet
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="bg-gradient-to-br from-white to-[#1e3a8a]/5 rounded-lg shadow-lg p-6 border border-[#d4af37]/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[#1e3a8a] font-bold">Your Voting History</h3>
                  {getVoteHistory().length > 0 && (
                    <Button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete all your voting history? This action cannot be undone.')) {
                          handleDeleteVoteHistory();
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear History
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  {getVoteHistory().map((vote) => {
                    const election = elections.find((e) => e._id === vote.electionId);
                    const candidate = candidates.find((c) => c._id === vote.candidateId);
                    return (
                      <div
                        key={vote._id}
                        className="border border-[#d4af37]/30 rounded-lg p-4 hover:border-[#d4af37] transition-all duration-300 bg-gradient-to-br from-white to-[#1e3a8a]/5 shadow-md hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-[#1e3a8a] mb-1 font-semibold">{election?.title}</h4>
                            <p className="text-gray-600 mb-1">
                              Voted for: <span className="text-[#d4af37] font-semibold">{candidate?.name}</span>
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              Position: <span className="font-semibold">{candidate?.position}</span>
                            </p>
                            <p className="text-sm text-gray-500">
                              Voted on: {new Date(vote.votedAt).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Election: {new Date(election?.startDate || '').toLocaleDateString()} - {new Date(election?.endDate || '').toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <Vote className="w-5 h-5 text-green-600" />
                            </div>
                            <Button
                              onClick={() => {
                                if (confirm('Delete this vote record?')) {
                                  handleDeleteSingleVote(vote._id);
                                }
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-50"
                              title="Delete this vote record"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {getVoteHistory().length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      You haven't voted in any elections yet
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
