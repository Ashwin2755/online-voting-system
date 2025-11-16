const API_BASE_URL = 'https://online-voting-system-08mr.onrender.com/api';

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    fullName?: string;
    studentId?: string;
    department?: string;
    year?: string;
  };
}

export interface RegisterData {
  fullName: string;
  email: string;
  studentId: string;
  department: string;
  year: string;
  password: string;
}

export interface LoginLog {
  _id: string;
  email: string;
  studentId?: string;
  userType: 'admin' | 'student';
  loginTime: string;
  ipAddress: string;
  userAgent: string;
}

export interface Election {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'Upcoming' | 'Ongoing' | 'Ended';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateElectionData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface Candidate {
  _id: string;
  name: string;
  position: string;
  electionId: string | any; // Allow both string and ObjectId types
  department: string;
  photoUrl?: string;
  votes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateData {
  name: string;
  position: string;
  electionId: string;
  department: string;
  photoUrl?: string;
}

export interface VoteData {
  electionId: string;
  candidateId: string;
  studentId: string;
}

export interface VoteStatus {
  hasVoted: boolean;
  votedFor?: string;
  votedAt?: string;
}

export interface ElectionResults {
  totalVotes: number;
  results: {
    _id: string;
    name: string;
    position: string;
    department: string;
    votes: number;
    percentage: string;
  }[];
}

export interface ForgotPasswordResponse {
  message: string;
  email?: string;
}

export interface VerifyOTPResponse {
  message: string;
  verified: boolean;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async adminLogin(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async studentLogin(email: string, studentId: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/student/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, studentId, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async studentRegister(registerData: RegisterData): Promise<{ message: string; student: any }> {
    const response = await fetch(`${API_BASE_URL}/student/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(registerData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return await response.json();
  }

  async getLoginLogs(): Promise<LoginLog[]> {
    const response = await fetch(`${API_BASE_URL}/admin/login-logs`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch login logs');
    }

    return await response.json();
  }

  async getRegisteredStudents(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/admin/students`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }

    return await response.json();
  }

  async testConnection(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/test`);
    return await response.json();
  }

  // Election methods
  async createElection(electionData: CreateElectionData): Promise<{ message: string; election: Election }> {
    const user = this.getCurrentUser();
    const response = await fetch(`${API_BASE_URL}/admin/elections`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        ...electionData,
        createdBy: user?.email || 'admin'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create election');
    }

    return await response.json();
  }

  async getAllElections(): Promise<Election[]> {
    const response = await fetch(`${API_BASE_URL}/elections`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch elections');
    }

    return await response.json();
  }

  async getElectionById(id: string): Promise<Election> {
    const response = await fetch(`${API_BASE_URL}/elections/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch election');
    }

    return await response.json();
  }

  async updateElectionStatus(id: string, status: 'Upcoming' | 'Ongoing' | 'Ended'): Promise<{ message: string; election: Election }> {
    const response = await fetch(`${API_BASE_URL}/admin/elections/${id}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update election status');
    }

    return await response.json();
  }

  async updateElection(id: string, electionData: CreateElectionData): Promise<{ message: string; election: Election }> {
    const response = await fetch(`${API_BASE_URL}/admin/elections/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(electionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update election');
    }

    return await response.json();
  }

  async deleteElection(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/elections/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete election');
    }

    return await response.json();
  }

  // Candidate methods
  async createCandidate(candidateData: CreateCandidateData): Promise<{ message: string; candidate: Candidate }> {
    const response = await fetch(`${API_BASE_URL}/admin/candidates`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(candidateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create candidate');
    }

    return await response.json();
  }

  async getAllCandidates(): Promise<Candidate[]> {
    const response = await fetch(`${API_BASE_URL}/candidates`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch candidates');
    }

    return await response.json();
  }

  async getCandidatesByElection(electionId: string): Promise<Candidate[]> {
    const response = await fetch(`${API_BASE_URL}/candidates/election/${electionId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch candidates for election');
    }

    return await response.json();
  }

  async deleteCandidate(candidateId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/candidates/${candidateId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete candidate');
    }

    return await response.json();
  }

  // Vote methods
  async submitVote(voteData: VoteData): Promise<{ message: string; voteId: string }> {
    const response = await fetch(`${API_BASE_URL}/vote`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(voteData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit vote');
    }

    return await response.json();
  }

  async getStudentVotes(studentId: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/votes/student/${studentId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        console.error('Failed to fetch student votes:', response.status);
        return [];
      }

      const data = await response.json();
      console.log('Student votes fetched from backend:', data);
      
      if (!Array.isArray(data)) {
        return [];
      }

      // Normalize the vote data to ensure electionId is always accessible
      const normalizedVotes = data.map((vote) => {
        return {
          ...vote,
          // Ensure electionId is a string ID
          electionId: typeof vote.electionId === 'string' 
            ? vote.electionId 
            : vote.electionId?._id || vote.electionId?.id
        };
      });

      console.log('Normalized votes:', normalizedVotes);
      return normalizedVotes;
    } catch (error) {
      console.error('Error fetching student votes:', error);
      return [];
    }
  }

  async getVoteStatus(electionId: string, studentId: string): Promise<VoteStatus> {
    const response = await fetch(`${API_BASE_URL}/vote/status/${electionId}/${studentId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vote status');
    }

    return await response.json();
  }

  async getElectionResults(electionId: string): Promise<ElectionResults> {
    const response = await fetch(`${API_BASE_URL}/elections/${electionId}/results`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch election results');
    }

    return await response.json();
  }

  async deleteVote(voteId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/vote/${voteId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete vote');
    }

    return await response.json();
  }

  // Forgot Password methods
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const response = await fetch(`${API_BASE_URL}/student/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }

    return await response.json();
  }

  async verifyOTP(email: string, otp: string): Promise<VerifyOTPResponse> {
    const response = await fetch(`${API_BASE_URL}/student/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify OTP');
    }

    return await response.json();
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<ResetPasswordResponse> {
    const response = await fetch(`${API_BASE_URL}/student/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reset password');
    }

    return await response.json();
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}

export const apiService = new ApiService();