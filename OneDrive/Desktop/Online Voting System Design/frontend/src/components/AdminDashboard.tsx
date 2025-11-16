import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { LogOut, Users, Plus, Calendar, BarChart3, Edit, Trash2, X, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CreateElection } from "./CreateElection";
import { EditElection } from "./EditElection";
import { CreateCandidate } from "./CreateCandidate";
import { PublishResult } from "./PublishResult";
import { apiService, Election, CreateElectionData, Candidate, CreateCandidateData } from "../services/api";

interface AdminDashboardProps {
  onLogout: () => void;
  onPublishResult: (electionId: string) => void;
}

export function AdminDashboard({
  onLogout,
  onPublishResult,
}: AdminDashboardProps) {
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("elections");
  const [editingElection, setEditingElection] = useState<Election | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Load elections and candidates from backend
  useEffect(() => {
    loadElections();
    loadCandidates();
    
    // Set up periodic refresh every 30 seconds to catch any data updates
    const intervalId = setInterval(() => {
      loadCandidates();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Update real-time status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update real-time status
      setElections(prev => [...prev]);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
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
      setIsLoadingCandidates(true);
      const candidatesData = await apiService.getAllCandidates();
      setCandidates(candidatesData);
    } catch (err) {
      console.error('Error loading candidates:', err);
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const handleCreateElection = async (electionData: CreateElectionData) => {
    try {
      await apiService.createElection(electionData);
      await loadElections(); // Reload elections after creation
      setError(null);
    } catch (err) {
      setError('Failed to create election');
      console.error('Error creating election:', err);
    }
  };

  const handleCreateCandidate = async (candidateData: CreateCandidateData) => {
    try {
      const result = await apiService.createCandidate(candidateData);
      console.log('Candidate created:', result);
      
      // Force immediate reload of both datasets
      await Promise.all([loadCandidates(), loadElections()]);
      
      // Additional refresh after a short delay to ensure database consistency
      setTimeout(async () => {
        await loadCandidates();
      }, 1000);
      
      setError(null);
      console.log('Candidate created successfully - data refreshed');
    } catch (err) {
      setError('Failed to create candidate');
      console.error('Error creating candidate:', err);
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

  const handleEditElection = (election: Election) => {
    setEditingElection(election);
    setShowEditDialog(true);
  };

  const handleUpdateElection = async (electionData: CreateElectionData) => {
    if (!editingElection) return;

    try {
      await apiService.updateElection(editingElection._id, electionData);
      await loadElections();
      setShowEditDialog(false);
      setEditingElection(null);
      setError(null);
      console.log('Election updated successfully');
    } catch (err) {
      setError('Failed to update election');
      console.error('Error updating election:', err);
    }
  };

  const handleDeleteElection = async (election: Election) => {
    if (!confirm(`Are you sure you want to delete "${election.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiService.deleteElection(election._id);
      await loadElections();
      setError(null);
      console.log('Election deleted successfully');
    } catch (err) {
      setError('Failed to delete election');
      console.error('Error deleting election:', err);
    }
  };

  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditingElection(null);
  };

  // Function to get elections with real-time status
  const getElectionsWithRealTimeStatus = () => {
    return elections.map(election => ({
      ...election,
      status: getElectionStatus(election.startDate, election.endDate)
    }));
  };

  const electionsWithStatus = getElectionsWithRealTimeStatus();

  // Function to get candidate count for an election
  const getCandidateCount = (electionId: string) => {
    // Ensure both IDs are strings for comparison
    const count = candidates.filter((c) => {
      // Handle both string and ObjectId types
      const candidateElectionId = c.electionId?.toString() || c.electionId;
      return candidateElectionId === electionId;
    }).length;
    
    // Debug logging (remove in production)
    if (electionId && candidates.length > 0) {
      console.log('Election ID:', electionId);
      console.log('Candidates count for this election:', count);
      console.log('All candidates:', candidates.map(c => ({
        name: c.name,
        electionId: c.electionId,
        electionIdString: c.electionId?.toString()
      })));
    }
    
    return count;
  };

  // Handle tab changes to refresh data
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Close edit dialog when switching tabs
    setShowEditDialog(false);
    setEditingElection(null);
    
    if (value === 'elections') {
      // Refresh data when viewing elections tab
      loadElections();
      loadCandidates();
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d4af37]/10 via-white to-[#1e3a8a]/10">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1e3a8a] to-[#1e3a8a]/90 shadow-lg border-b-4 border-[#d4af37]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-2xl">Admin Dashboard</h1>
              <p className="text-[#d4af37] font-medium">Nandha Engineering College Voting System</p>
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
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-white to-[#1e3a8a]/5 rounded-lg shadow-lg p-6 border-l-4 border-[#1e3a8a] hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1 font-medium">Total Elections</p>
                  <h3 className="text-2xl font-bold text-[#1e3a8a]">{electionsWithStatus.length}</h3>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#1e3a8a]/20 to-[#1e3a8a]/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#1e3a8a]" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-[#d4af37]/5 rounded-lg shadow-lg p-6 border-l-4 border-[#d4af37] hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1 font-medium">Total Candidates</p>
                  <h3 className="text-2xl font-bold text-[#1e3a8a]">{candidates.length}</h3>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#d4af37]" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-green-500/5 rounded-lg shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1 font-medium">Active Elections</p>
                  <h3 className="text-2xl font-bold text-[#1e3a8a]">
                    {electionsWithStatus.filter((e) => e.status === "Ongoing").length}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-full flex items-center justify-center">
                  <Plus className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-[#1e3a8a]/5 to-[#d4af37]/5 rounded-lg shadow-lg p-6 mb-8 border-l-4 border-[#d4af37] hover:shadow-xl transition-shadow">
            <h2 className="text-xl text-[#1e3a8a] mb-2 font-bold">Welcome to Admin Dashboard</h2>
            <p className="text-gray-700 font-medium">Manage elections, candidates, and view results from this central hub.</p>
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="elections" className="space-y-6" onValueChange={handleTabChange}>
            <TabsList className="bg-gradient-to-r from-white to-[#d4af37]/10 shadow-lg p-1 border border-[#d4af37]/20">
              <TabsTrigger 
                value="elections" 
                className="data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white font-medium"
              >
                Elections
              </TabsTrigger>
              <TabsTrigger 
                value="create-election"
                className="data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white font-medium"
              >
                Create Election
              </TabsTrigger>
              <TabsTrigger 
                value="create-candidate"
                className="data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white font-medium"
              >
                Create Candidate
              </TabsTrigger>
              <TabsTrigger 
                value="publish-result"
                className="data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white font-medium"
              >
                Publish Result
              </TabsTrigger>
            </TabsList>

            <TabsContent value="elections">
              <div className="bg-gradient-to-br from-white to-[#1e3a8a]/5 rounded-lg shadow-lg p-6 border border-[#d4af37]/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[#1e3a8a] font-bold">All Elections</h3>
                  <Button
                    onClick={() => {
                      loadElections();
                      loadCandidates();
                    }}
                    variant="outline"
                    size="sm"
                    className="border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white font-medium"
                  >
                    Refresh Data
                  </Button>
                </div>
                {isLoading || isLoadingCandidates ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading elections and candidates...</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {electionsWithStatus.map((election) => {
                      const realTimeStatus = getElectionStatus(election.startDate, election.endDate);
                      const candidateCount = getCandidateCount(election._id);
                      return (
                        <div
                          key={election._id}
                          className="border border-[#d4af37]/30 rounded-lg p-4 hover:border-[#d4af37] transition-all duration-300 bg-gradient-to-br from-white to-[#1e3a8a]/5 shadow-md hover:shadow-lg"
                        >
                          <div className="mb-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-[#1e3a8a] text-lg">{election.title}</h4>
                              <div className="flex gap-1 ml-2">
                                {realTimeStatus !== "Ended" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditElection(election)}
                                      className="h-8 w-8 p-0 hover:bg-blue-50"
                                      title="Edit Election"
                                    >
                                      <Edit className="w-4 h-4 text-blue-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteElection(election)}
                                      className="h-8 w-8 p-0 hover:bg-red-50"
                                      title="Delete Election"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                  </>
                                )}
                                {realTimeStatus === "Ended" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteElection(election)}
                                    className="h-8 w-8 p-0 hover:bg-red-50"
                                    title="Delete Completed Election"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{election.description}</p>
                            <p className="text-sm text-gray-600 mb-2">
                              {new Date(election.startDate).toLocaleString()} - {new Date(election.endDate).toLocaleString()}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                realTimeStatus === "Ongoing" 
                                  ? "bg-green-100 text-green-700"
                                  : realTimeStatus === "Upcoming"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}>
                                {realTimeStatus}
                              </span>
                              <span className="text-xs text-gray-500">
                                Candidates: {candidateCount}
                              </span>
                            </div>
                          </div>
                          {realTimeStatus === "Ended" && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full border-[#d4af37] text-[#1e3a8a] bg-gradient-to-r from-white to-[#d4af37]/5 hover:bg-gradient-to-r hover:from-[#d4af37] hover:to-[#1e3a8a] hover:text-white transition-all duration-300 font-medium"
                              onClick={() => onPublishResult(election._id)}
                            >
                              Publish Result
                            </Button>
                          )}
                        </div>
                      );
                    })}
                    {electionsWithStatus.length === 0 && !isLoading && (
                      <p className="text-gray-500 col-span-3 text-center py-8">
                        No elections created yet
                      </p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="create-election">
              <div className="bg-gradient-to-br from-white to-[#1e3a8a]/5 rounded-lg shadow-lg border border-[#d4af37]/20">
                <CreateElection onSubmit={handleCreateElection} />
              </div>
            </TabsContent>

            <TabsContent value="create-candidate">
              <div className="bg-gradient-to-br from-white to-[#1e3a8a]/5 rounded-lg shadow-lg border border-[#d4af37]/20">
                <CreateCandidate
                  elections={electionsWithStatus}
                  onSubmit={handleCreateCandidate}
                />
              </div>
            </TabsContent>

            <TabsContent value="publish-result">
              <div className="bg-gradient-to-br from-white to-[#1e3a8a]/5 rounded-lg shadow-lg border border-[#d4af37]/20">
                <PublishResult
                  elections={elections.filter((e) => e.status === "Ended")}
                  onPublish={onPublishResult}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Edit Election Dialog */}
          {showEditDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gradient-to-br from-white to-[#1e3a8a]/5 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4 border border-[#d4af37]/20">
                <div className="flex items-center justify-between p-4 border-b border-[#d4af37]/30 bg-gradient-to-r from-[#1e3a8a] to-[#1e3a8a]/90">
                  <h3 className="text-lg font-semibold text-white">Edit Election</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-4">
                  <EditElection
                    election={editingElection}
                    onSubmit={handleUpdateElection}
                    onCancel={handleCancelEdit}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
