import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { AdminLogin } from "./components/AdminLogin";
import { StudentLogin } from "./components/StudentLogin";
import { StudentRegister } from "./components/StudentRegister";
import { ForgotPassword } from "./components/ForgotPassword";
import { AdminDashboard } from "./components/AdminDashboard";
import { StudentDashboard } from "./components/StudentDashboard";
import { VotingPage } from "./components/VotingPage";
import { ResultsPage } from "./components/ResultsPage";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { apiService } from "./services/api";

type Page =
  | "landing"
  | "admin-login"
  | "student-login"
  | "student-register"
  | "forgot-password"
  | "admin-dashboard"
  | "student-dashboard"
  | "voting"
  | "results";

interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "Ongoing" | "Upcoming" | "Ended";
}

interface Candidate {
  id: string;
  name: string;
  position: string;
  electionId: string;
  department: string;
  photoUrl: string;
}

interface Vote {
  id: string;
  electionId: string;
  candidateId: string;
  studentId: string;
  timestamp: string;
}

interface Student {
  fullName: string;
  email: string;
  studentId: string;
  department: string;
  year: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  studentId?: string;
  department?: string;
  year?: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(null);
  const [selectedElection, setSelectedElection] = useState<any | null>(null);

  // Clear any stored authentication on app load to always start fresh
  useEffect(() => {
    apiService.logout(); // Clear any stored tokens
  }, []);

  // Mock data
  const [elections, setElections] = useState<Election[]>([
    {
      id: "1",
      title: "Student Council Election 2025",
      description: "Annual student council leadership election",
      startDate: "2025-10-01T09:00",
      endDate: "2025-10-15T17:00",
      status: "Ongoing",
    },
    {
      id: "2",
      title: "Sports Committee Election 2025",
      description: "Election for sports committee representatives",
      startDate: "2025-10-20T09:00",
      endDate: "2025-10-25T17:00",
      status: "Upcoming",
    },
    {
      id: "3",
      title: "Cultural Committee Election 2024",
      description: "Previous year cultural committee election",
      startDate: "2024-09-01T09:00",
      endDate: "2024-09-10T17:00",
      status: "Ended",
    },
  ]);

  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: "1",
      name: "Rajesh Kumar",
      position: "President",
      electionId: "1",
      department: "Computer Science",
      photoUrl: "https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMG1hbnxlbnwxfHx8fDE3NTk5OTA5OTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: "2",
      name: "Priya Sharma",
      position: "President",
      electionId: "1",
      department: "Electronics & Communication",
      photoUrl: "https://images.unsplash.com/photo-1581065178026-390bc4e78dad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHdvbWFufGVufDF8fHx8MTc1OTk3MDg1NHww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: "3",
      name: "Arun Patel",
      position: "Vice President",
      electionId: "1",
      department: "Mechanical",
      photoUrl: "https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMG1hbnxlbnwxfHx8fDE3NTk5OTA5OTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: "4",
      name: "Sneha Reddy",
      position: "Vice President",
      electionId: "1",
      department: "Information Technology",
      photoUrl: "https://images.unsplash.com/photo-1581065178026-390bc4e78dad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHdvbWFufGVufDF8fHx8MTc1OTk3MDg1NHww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: "5",
      name: "Karthik Vijay",
      position: "Sports Captain",
      electionId: "2",
      department: "Civil",
      photoUrl: "https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMG1hbnxlbnwxfHx8fDE3NTk5OTA5OTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: "6",
      name: "Divya Menon",
      position: "Sports Captain",
      electionId: "2",
      department: "Electrical & Electronics",
      photoUrl: "https://images.unsplash.com/photo-1581065178026-390bc4e78dad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHdvbWFufGVufDF8fHx8MTc1OTk3MDg1NHww&ixlib=rb-4.1.0&q=80&w=1080",
    },
  ]);

  const [votes, setVotes] = useState<Vote[]>([]);

  const [registeredStudents, setRegisteredStudents] = useState<Student[]>([
    {
      fullName: "Demo Student",
      email: "student@nec.edu",
      studentId: "NEC2025001",
      department: "Computer Science",
      year: "3",
    },
  ]);

  // Helper function to determine election status
  const getElectionStatus = (startDate: string, endDate: string): "Ongoing" | "Upcoming" | "Ended" => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return "Upcoming";
    if (now > end) return "Ended";
    return "Ongoing";
  };

  // Handlers
  const handlePortalSelect = (portal: "admin" | "student") => {
    if (portal === "admin") {
      setCurrentPage("admin-login");
    } else {
      setCurrentPage("student-login");
    }
  };

  const handleAdminLogin = (userData: User) => {
    setCurrentUser(userData);
    setCurrentPage("admin-dashboard");
  };

  const handleStudentLogin = (userData: User) => {
    setCurrentUser(userData);
    setCurrentStudent({
      fullName: userData.fullName || '',
      email: userData.email,
      studentId: userData.studentId || '',
      department: userData.department || '',
      year: userData.year || ''
    });
    setCurrentPage("student-dashboard");
  };

  const handleStudentRegister = () => {
    toast.success("Registration successful! Please login with your credentials.");
    setCurrentPage("student-login");
  };

  const handleCreateElection = (electionData: Omit<Election, "id" | "status">) => {
    const status = getElectionStatus(electionData.startDate, electionData.endDate);
    const newElection: Election = {
      ...electionData,
      id: Date.now().toString(),
      status,
    };
    setElections([...elections, newElection]);
    toast.success("Election created successfully!");
  };

  const handleCreateCandidate = (candidateData: Omit<Candidate, "id">) => {
    const newCandidate: Candidate = {
      ...candidateData,
      id: Date.now().toString(),
    };
    setCandidates([...candidates, newCandidate]);
    toast.success("Candidate added successfully!");
  };

  const handleEditCandidate = (candidateId: string, updatedData: Omit<Candidate, "id">) => {
    setCandidates(candidates.map(candidate => 
      candidate.id === candidateId 
        ? { ...candidate, ...updatedData }
        : candidate
    ));
  };

  const handleDeleteCandidate = (candidateId: string) => {
    setCandidates(candidates.filter(candidate => candidate.id !== candidateId));
  };

  const handlePublishResult = (electionId: string) => {
    toast.success("Results published successfully!");
  };

  const handleVoteClick = (electionId: string, election?: any) => {
    setSelectedElectionId(electionId);
    setSelectedElection(election);
    setCurrentPage("voting");
  };

  const handleSubmitVote = (candidateId: string) => {
    if (!currentStudent || !selectedElectionId) return;

    const newVote: Vote = {
      id: Date.now().toString(),
      electionId: selectedElectionId,
      candidateId,
      studentId: currentStudent.studentId,
      timestamp: new Date().toISOString(),
    };

    setVotes([...votes, newVote]);
    toast.success("Vote submitted successfully!");
    setCurrentPage("student-dashboard");
    setSelectedElectionId(null);
  };

  const handleViewResults = async (electionId: string) => {
    try {
      // Fetch the election details from backend
      const election = await apiService.getElectionById(electionId);
      setSelectedElectionId(electionId);
      setSelectedElection(election);
      setCurrentPage("results");
    } catch (error) {
      console.error("Error fetching election for results:", error);
      toast.error("Failed to load election details");
    }
  };

  const handleForgotPassword = () => {
    setCurrentPage("forgot-password");
  };

  const handleForgotPasswordSuccess = () => {
    toast.success("Password reset successfully! Please login with your new password.");
    setCurrentPage("student-login");
  };

  const handleLogout = () => {
    apiService.logout();
    setCurrentUser(null);
    setCurrentStudent(null);
    setCurrentPage("landing");
    toast.info("Logged out successfully");
  };

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return <LandingPage onSelectPortal={handlePortalSelect} />;

      case "admin-login":
        return (
          <AdminLogin
            onLogin={handleAdminLogin}
            onBack={() => setCurrentPage("landing")}
          />
        );

      case "student-login":
        return (
          <StudentLogin
            onLogin={handleStudentLogin}
            onRegister={() => setCurrentPage("student-register")}
            onBack={() => setCurrentPage("landing")}
            onForgotPassword={handleForgotPassword}
          />
        );

      case "student-register":
        return (
          <StudentRegister
            onRegister={handleStudentRegister}
            onBack={() => setCurrentPage("student-login")}
          />
        );

      case "forgot-password":
        return (
          <ForgotPassword
            onBack={() => setCurrentPage("student-login")}
            onSuccess={handleForgotPasswordSuccess}
          />
        );

      case "admin-dashboard":
        return (
          <AdminDashboard
            onLogout={handleLogout}
            onPublishResult={handlePublishResult}
          />
        );

      case "student-dashboard":
        return currentStudent ? (
          <StudentDashboard
            student={currentStudent}
            onLogout={handleLogout}
            votes={votes}
            onVote={handleVoteClick}
            onViewResults={handleViewResults}
          />
        ) : null;

      case "voting":
        return selectedElection ? (
          <VotingPage
            election={selectedElection}
            onSubmitVote={handleSubmitVote}
            onBack={() => setCurrentPage("student-dashboard")}
          />
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-500">Loading voting page...</p>
          </div>
        );

      case "results":
        return selectedElection ? (
          <ResultsPage
            election={selectedElection}
            onBack={() => setCurrentPage("student-dashboard")}
          />
        ) : null;

      default:
        return <LandingPage onSelectPortal={handlePortalSelect} />;
    }
  };

  return (
    <>
      {renderPage()}
      <Toaster position="top-right" />
    </>
  );
}
