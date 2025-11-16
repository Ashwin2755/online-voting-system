import { motion } from "motion/react";
import { ArrowLeft, Trophy } from "lucide-react";
import { Button } from "./ui/button";
import { CandidateCard } from "./CandidateCard";
import { useState, useEffect } from "react";
import { apiService, ElectionResults } from "../services/api";

interface ResultsPageProps {
  election: any;
  onBack: () => void;
}

export function ResultsPage({ election, onBack }: ResultsPageProps) {
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (election) {
      loadResults();
    }
  }, [election]);

  const loadResults = async () => {
    try {
      setIsLoading(true);
      const electionId = election._id || election.id;
      const resultsData = await apiService.getElectionResults(electionId);
      setResults(resultsData);
      setError(null);
    } catch (err) {
      console.error('Error loading election results:', err);
      setError('Failed to load election results');
    } finally {
      setIsLoading(false);
    }
  };

  const winner = results?.results?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-[#d4af37]">
        <div className="container mx-auto px-6 py-4">
          <Button onClick={onBack} variant="ghost" className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-[#1e3a8a]">{election.title}</h1>
          <p className="text-gray-600">Election Results</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading results...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <>
              {/* Winner Section */}
              {winner && winner.votes > 0 && (
                <div className="bg-gradient-to-br from-[#d4af37] to-[#d4af37]/80 rounded-2xl shadow-2xl p-8 mb-8 text-white">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Trophy className="w-10 h-10" />
                    <h2 className="text-3xl font-bold">Winner</h2>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">{winner.name}</h3>
                    <p className="text-lg opacity-90 mb-4">{winner.position} - {winner.department}</p>
                    <div className="bg-white/20 rounded-lg p-4 inline-block">
                      <p className="text-2xl font-bold">{winner.votes} votes</p>
                      <p className="text-sm opacity-80">({winner.percentage}% of total votes)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* All Results */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-[#1e3a8a] mb-6">Complete Results</h3>
                
                {results && results.results.length > 0 ? (
                  <div className="space-y-4">
                    {results.results.map((candidate, index) => (
                      <div key={candidate._id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1e3a8a] text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{candidate.name}</h4>
                            <p className="text-gray-600">{candidate.position} - {candidate.department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#1e3a8a]">{candidate.votes}</p>
                          <p className="text-sm text-gray-500">{candidate.percentage}%</p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-lg font-semibold text-gray-700">
                        Total Votes Cast: {results.totalVotes}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No votes have been cast yet.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
