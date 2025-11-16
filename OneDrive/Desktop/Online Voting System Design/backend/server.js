const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voting-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
});

const StudentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  studentId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  year: { type: String, required: true },
  password: { type: String, required: true },
  isRegistered: { type: Boolean, default: true }
}, { timestamps: true });

const LoginLogSchema = new mongoose.Schema({
  email: { type: String, required: true },
  studentId: { type: String },
  userType: { type: String, enum: ['admin', 'student'], required: true },
  loginTime: { type: Date, default: Date.now },
  ipAddress: { type: String },
  userAgent: { type: String }
});

const ElectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Ended'], default: 'Upcoming' },
  createdBy: { type: String, required: true }
}, { timestamps: true });

const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  department: { type: String, required: true },
  photoUrl: { type: String },
  votes: { type: Number, default: 0 }
}, { timestamps: true });

const VoteSchema = new mongoose.Schema({
  electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  studentId: { type: String, required: true },
  votedAt: { type: Date, default: Date.now }
});

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ['forgot-password'], required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // Expires in 10 minutes
});

const Admin = mongoose.model('Admin', AdminSchema);
const Student = mongoose.model('Student', StudentSchema);
const LoginLog = mongoose.model('LoginLog', LoginLogSchema);
const Election = mongoose.model('Election', ElectionSchema);
const Candidate = mongoose.model('Candidate', CandidateSchema);
const Vote = mongoose.model('Vote', VoteSchema);
const OTP = mongoose.model('OTP', OTPSchema);

// Initialize admin account
const initializeAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: 'admin@nec.edu' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Admin.create({
        email: 'admin@nec.edu',
        password: hashedPassword
      });
      console.log('Default admin account created: admin@nec.edu / admin123');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: email,
    subject: 'Password Reset OTP - Online Voting System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a8a;">Password Reset Request</h2>
        <p>You have requested to reset your password for the Online Voting System.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h3 style="color: #1e3a8a; margin: 0;">Your OTP Code</h3>
          <h1 style="color: #d4af37; font-size: 32px; letter-spacing: 4px; margin: 10px 0;">${otp}</h1>
        </div>
        <p><strong>Important:</strong></p>
        <ul>
          <li>This OTP is valid for 10 minutes only</li>
          <li>Do not share this OTP with anyone</li>
          <li>If you didn't request this, please ignore this email</li>
        </ul>
        <p>Best regards,<br>Online Voting System Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

// Middleware to log login attempts
const logLogin = async (email, studentId, userType, req) => {
  try {
    await LoginLog.create({
      email,
      studentId,
      userType,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
  } catch (error) {
    console.error('Error logging login attempt:', error);
  }
};

// Routes

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Log the login
    await logLogin(email, null, 'admin', req);

    // Generate token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: admin._id,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student registration
app.post('/api/student/register', async (req, res) => {
  try {
    const { fullName, email, studentId, department, year, password } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ email }, { studentId }]
    });

    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student already registered with this email or student ID' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = await Student.create({
      fullName,
      email,
      studentId,
      department,
      year,
      password: hashedPassword
    });

    res.status(201).json({
      message: 'Registration successful',
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        studentId: student.studentId,
        department: student.department,
        year: student.year
      }
    });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student login
app.post('/api/student/login', async (req, res) => {
  try {
    const { email, studentId, password } = req.body;

    // Find student
    const student = await Student.findOne({ email, studentId });
    if (!student) {
      return res.status(401).json({ 
        message: 'Invalid credentials. Please register first if you haven\'t already.' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Log the login
    await logLogin(email, studentId, 'student', req);

    // Generate token
    const token = jwt.sign(
      { id: student._id, email: student.email, studentId: student.studentId, role: 'student' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        studentId: student.studentId,
        department: student.department,
        year: student.year
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot password - Send OTP
app.post('/api/student/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if student exists
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate OTP
    const otp = generateOTP();

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email, type: 'forgot-password' });

    // Save new OTP
    await OTP.create({
      email,
      otp,
      type: 'forgot-password'
    });

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
    }

    res.json({ 
      message: 'OTP sent successfully to your email address',
      email: email.replace(/(.{2})(.*)(?=.{2})/, (gp1, gp2, gp3) => gp2 + '*'.repeat(gp3.length))
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP
app.post('/api/student/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find valid OTP
    const otpRecord = await OTP.findOne({ 
      email, 
      otp, 
      type: 'forgot-password' 
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is valid
    res.json({ 
      message: 'OTP verified successfully',
      verified: true 
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
app.post('/api/student/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Verify OTP one more time
    const otpRecord = await OTP.findOne({ 
      email, 
      otp, 
      type: 'forgot-password' 
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update student password
    const student = await Student.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({ 
      message: 'Password reset successfully',
      success: true 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all login logs (admin only)
app.get('/api/admin/login-logs', async (req, res) => {
  try {
    const logs = await LoginLog.find().sort({ loginTime: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching login logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all registered students (admin only)
app.get('/api/admin/students', async (req, res) => {
  try {
    const students = await Student.find({}, '-password').sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Election routes
// Create election (admin only)
app.post('/api/admin/elections', async (req, res) => {
  try {
    const { title, description, startDate, endDate, createdBy } = req.body;
    
    if (!title || !description || !startDate || !endDate || !createdBy) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newElection = new Election({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      createdBy
    });

    await newElection.save();
    res.status(201).json({ message: 'Election created successfully', election: newElection });
  } catch (error) {
    console.error('Error creating election:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all elections
app.get('/api/elections', async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections);
  } catch (error) {
    console.error('Error fetching elections:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get election by ID
app.get('/api/elections/:id', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    res.json(election);
  } catch (error) {
    console.error('Error fetching election:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update election status (admin only)
app.put('/api/admin/elections/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Upcoming', 'Ongoing', 'Ended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const election = await Election.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    res.json({ message: 'Election status updated', election });
  } catch (error) {
    console.error('Error updating election status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update election (admin only)
app.put('/api/admin/elections/:id', async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    // Fetch the election first
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const now = new Date();
    const existingStart = new Date(election.startDate);
    const existingEnd = new Date(election.endDate);
    const isOngoing = now >= existingStart && now <= existingEnd;

    // If election is ongoing, only allow changing the end date/time
    if (isOngoing) {
      if (!endDate) {
        return res.status(400).json({ message: 'End date is required when updating an ongoing election' });
      }

      const newEnd = new Date(endDate);
      if (isNaN(newEnd.getTime())) {
        return res.status(400).json({ message: 'Invalid end date format' });
      }

      if (newEnd <= now) {
        return res.status(400).json({ message: 'End date must be in the future' });
      }

      // Apply only endDate change for ongoing elections
      election.endDate = newEnd;
      await election.save();

      return res.json({ 
        message: 'Election end date updated successfully', 
        election: election.toObject() 
      });
    }

    // For non-ongoing elections (Upcoming or Ended), allow full update
    if (!title || !description || !startDate || !endDate) {
      return res.status(400).json({ message: 'Title, description, start date, and end date are required' });
    }

    // Check if there are any votes for this election
    const voteCount = await Vote.countDocuments({ electionId: req.params.id });
    if (voteCount > 0) {
      return res.status(400).json({ message: 'Cannot edit election that already has votes' });
    }

    // Validate dates
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (newStart >= newEnd) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Update all fields for non-ongoing elections
    election.title = title;
    election.description = description;
    election.startDate = newStart;
    election.endDate = newEnd;
    await election.save();

    res.json({ message: 'Election updated successfully', election: election.toObject() });
  } catch (error) {
    console.error('Error updating election:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete election (admin only)
app.delete('/api/admin/elections/:id', async (req, res) => {
  try {
    const electionId = req.params.id;

    // Check if there are any votes for this election
    const voteCount = await Vote.countDocuments({ electionId });
    if (voteCount > 0) {
      return res.status(400).json({ message: 'Cannot delete election that has votes' });
    }

    // Delete all candidates for this election first
    await Candidate.deleteMany({ electionId });

    // Delete the election
    const election = await Election.findByIdAndDelete(electionId);

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    res.json({ message: 'Election deleted successfully' });
  } catch (error) {
    console.error('Error deleting election:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Candidate routes
// Create candidate (admin only)
app.post('/api/admin/candidates', async (req, res) => {
  try {
    const { name, position, electionId, department, photoUrl } = req.body;
    
    if (!name || !position || !electionId || !department) {
      return res.status(400).json({ message: 'Name, position, election, and department are required' });
    }

    // Check if election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const newCandidate = new Candidate({
      name,
      position,
      electionId,
      department,
      photoUrl: photoUrl || ''
    });

    await newCandidate.save();
    // Convert ObjectId to string for frontend compatibility
    const candidateResponse = {
      ...newCandidate.toObject(),
      electionId: newCandidate.electionId.toString()
    };
    res.status(201).json({ message: 'Candidate created successfully', candidate: candidateResponse });
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all candidates
app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find().populate('electionId', 'title').sort({ createdAt: -1 });
    // Convert ObjectId to string for frontend compatibility
    const candidatesWithStringIds = candidates.map(candidate => ({
      ...candidate.toObject(),
      electionId: candidate.electionId._id.toString()
    }));
    res.json(candidatesWithStringIds);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get candidates by election ID
app.get('/api/candidates/election/:electionId', async (req, res) => {
  try {
    const candidates = await Candidate.find({ electionId: req.params.electionId }).sort({ createdAt: -1 });
    // Convert ObjectId to string for frontend compatibility
    const candidatesWithStringIds = candidates.map(candidate => ({
      ...candidate.toObject(),
      electionId: candidate.electionId.toString()
    }));
    res.json(candidatesWithStringIds);
  } catch (error) {
    console.error('Error fetching candidates for election:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete candidate (admin only)
app.delete('/api/admin/candidates/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Root route - server status
app.get('/', (req, res) => {
  res.json({
    message: 'Online Voting System API Server',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      admin: {
        login: 'POST /api/admin/login',
        loginLogs: 'GET /api/admin/login-logs',
        students: 'GET /api/admin/students',
        createElection: 'POST /api/admin/elections',
        updateElectionStatus: 'PUT /api/admin/elections/:id/status',
        createCandidate: 'POST /api/admin/candidates',
        deleteCandidate: 'DELETE /api/admin/candidates/:id'
      },
      student: {
        register: 'POST /api/student/register',
        login: 'POST /api/student/login',
        forgotPassword: 'POST /api/student/forgot-password',
        verifyOTP: 'POST /api/student/verify-otp',
        resetPassword: 'POST /api/student/reset-password'
      },
      elections: {
        create: 'POST /api/admin/elections',
        getAll: 'GET /api/elections',
        getById: 'GET /api/elections/:id',
        update: 'PUT /api/admin/elections/:id',
        delete: 'DELETE /api/admin/elections/:id',
        updateStatus: 'PUT /api/admin/elections/:id/status'
      },
      candidates: {
        getAll: 'GET /api/candidates',
        getByElection: 'GET /api/candidates/election/:electionId'
      },
      votes: {
        submit: 'POST /api/vote',
        getStatus: 'GET /api/vote/status/:electionId/:studentId',
        getResults: 'GET /api/elections/:electionId/results'
      },
      test: 'GET /api/test'
    }
  });
});

// Vote endpoints
app.post('/api/vote', async (req, res) => {
  try {
    const { electionId, candidateId, studentId } = req.body;

    if (!electionId || !candidateId || !studentId) {
      return res.status(400).json({ message: 'Election ID, candidate ID, and student ID are required' });
    }

    // Check if student has already voted in this election
    const existingVote = await Vote.findOne({ electionId, studentId });
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    // Verify election exists and is ongoing
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);

    if (now < startDate) {
      return res.status(400).json({ message: 'Election has not started yet' });
    }

    if (now > endDate) {
      return res.status(400).json({ message: 'Election has ended' });
    }

    // Verify candidate exists and belongs to this election
    const candidate = await Candidate.findOne({ _id: candidateId, electionId });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found for this election' });
    }

    // Create the vote record
    const vote = new Vote({
      electionId,
      candidateId,
      studentId
    });
    await vote.save();

    // Increment candidate vote count
    await Candidate.findByIdAndUpdate(candidateId, { $inc: { votes: 1 } });

    res.json({ 
      message: 'Vote submitted successfully',
      voteId: vote._id
    });
  } catch (error) {
    console.error('Vote submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vote status for a student in an election
app.get('/api/vote/status/:electionId/:studentId', async (req, res) => {
  try {
    const { electionId, studentId } = req.params;

    const vote = await Vote.findOne({ electionId, studentId });
    
    if (vote) {
      const candidate = await Candidate.findById(vote.candidateId);
      res.json({ 
        hasVoted: true, 
        votedFor: candidate ? candidate.name : 'Unknown',
        votedAt: vote.votedAt
      });
    } else {
      res.json({ hasVoted: false });
    }
  } catch (error) {
    console.error('Vote status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a vote record
app.delete('/api/vote/:voteId', async (req, res) => {
  try {
    const { voteId } = req.params;

    // Find the vote to delete
    const vote = await Vote.findById(voteId);
    if (!vote) {
      return res.status(404).json({ message: 'Vote not found' });
    }

    // Decrement candidate vote count
    await Candidate.findByIdAndUpdate(vote.candidateId, { $inc: { votes: -1 } });

    // Delete the vote
    await Vote.findByIdAndDelete(voteId);

    res.json({ message: 'Vote deleted successfully' });
  } catch (error) {
    console.error('Vote deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get election results
app.get('/api/elections/:electionId/results', async (req, res) => {
  try {
    const { electionId } = req.params;

    // Get all candidates for this election with their vote counts
    const candidates = await Candidate.find({ electionId }).sort({ votes: -1 });
    
    // Get total votes for this election
    const totalVotes = await Vote.countDocuments({ electionId });

    // Calculate results
    const results = candidates.map(candidate => ({
      _id: candidate._id,
      name: candidate.name,
      position: candidate.position,
      department: candidate.department,
      votes: candidate.votes,
      percentage: totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : '0.0'
    }));

    res.json({
      totalVotes,
      results
    });
  } catch (error) {
    console.error('Results fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeAdmin();
});

module.exports = app;