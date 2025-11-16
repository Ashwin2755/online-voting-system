import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { LogOut, Vote, TrendingUp } from "lucide-react";
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
  studentVotes?: any[];
  setStudentVotes?: (v: any[]) => void;
}

export function StudentDashboard({
  student,
  onLogout,
  votes,
  onVote,
  onViewResults,
  studentVotes: studentVotesProp,
  setStudentVotes: setStudentVotesProp,
}: StudentDashboardProps) {
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [studentVotes, setStudentVotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load elections, candidates, and student votes from backend
  useEffect(() => {
    loadElections();
    loadCandidates();
    // If parent passed down studentVotes, use those immediately; otherwise fetch
    if (studentVotesProp && Array.isArray(studentVotesProp)) {
      console.log('Using studentVotes from parent prop:', studentVotesProp);
      setStudentVotes(studentVotesProp);
    } else {
      loadStudentVotes();
    }
    
    // Set up periodic refresh to catch new candidates and votes added by admin
    const intervalId = setInterval(() => {
      loadElections();
      loadCandidates();
      // Don't re-fetch votes on interval if parent is managing them
      if (!studentVotesProp) loadStudentVotes();
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [student.studentId, studentVotesProp]);

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

  // Load student's votes from backend
  const loadStudentVotes = async () => {
    try {
      if (student && student.studentId) {
        // Fetch all votes for this student from the backend
        console.log('=== LOADING STUDENT VOTES ===');
        console.log('Student ID:', student.studentId);
        const studentVotesData = await apiService.getStudentVotes(student.studentId);
        console.log('Raw votes from backend:', studentVotesData);
        
        if (studentVotesData && studentVotesData.length > 0) {
          console.log('First vote structure:', {
            electionId: studentVotesData[0].electionId,
            candidateId: studentVotesData[0].candidateId,
            studentId: studentVotesData[0].studentId,
            votedAt: studentVotesData[0].votedAt
          });
        }
        
        setStudentVotes(studentVotesData);
        // If parent provided a setter, update it so other parts of the app
        // (e.g. App) can stay in sync.
        if (setStudentVotesProp) setStudentVotesProp(studentVotesData);
      }
    } catch (err) {
      console.error('Error loading student votes:', err);
      setStudentVotes([]);
      if (setStudentVotesProp) setStudentVotesProp([]);
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
    const voted = studentVotes.some((v) => {
      const vElectionId = String(v.electionId || '');
      const electionIdStr = String(electionId);
      return vElectionId === electionIdStr;
    });
    
    return voted;
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
              hasVoted={studentVotes.length > 0}
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
                    {ongoingElections.map((election) => {
                      const voted = hasVoted(election._id);
                      console.log(`Election ${election._id}: hasVoted = ${voted}`);
                      return (
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
                          {!voted && (
                            <Button
                              onClick={() => onVote(election._id, election)}
                              className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#1e3a8a]/80 hover:from-[#1e3a8a]/90 hover:to-[#1e3a8a] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <Vote className="w-4 h-4 mr-2" />
                              Vote Now
                            </Button>
                          )}
                          {voted && (
                            <div className="w-full">
                              <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
                                <Vote className="w-4 h-4 text-green-600" />
                                <span className="text-green-700 font-medium">Voted</span>
                              </div>
                              <Button
                                disabled
                                className="w-full mt-2 bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                              >
                                <Vote className="w-4 h-4 mr-2" />
                                Vote Now
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
