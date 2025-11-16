# Online Voting System

A professional, full-stack voting system built with modern technologies.

## Project Structure

```
voting-system/
├── backend/           # Express.js + MongoDB API
├── frontend/          # React + TypeScript UI
└── Documentation
```

## Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB running locally or connection string

### Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Backend**
   - Navigate to `/backend`
   - Update `.env` with your MongoDB URI:
     ```env
     MONGODB_URI=mongodb://localhost:27017/voting-system
     PORT=5000
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASS=your-app-password
     ```

3. **Start Development**
   ```bash
   npm run dev
   ```
   
   This starts both:
   - **Backend:** `http://localhost:5000` (API)
   - **Frontend:** `http://localhost:5173` (UI)

## Available Scripts

### From Root Directory
```bash
npm run dev              # Start backend and frontend together
npm run dev:frontend    # Start only frontend dev server
npm run dev:backend     # Start only backend server
npm run build           # Build frontend for production
npm run start:frontend  # Start frontend dev server
npm run start:backend   # Start backend server
```

## Features

### Admin Portal
- ✅ Secure login
- ✅ Create and manage elections
- ✅ Add candidates with photos (up to 50MB)
- ✅ View real-time voting results
- ✅ Publish results
- ✅ Edit elections (until they end)

### Student Portal
- ✅ Registration and login
- ✅ Forgot password with OTP verification
- ✅ Vote in ongoing elections
- ✅ View voting history
- ✅ Delete vote records
- ✅ View election results

### Security Features
- ✅ JWT authentication
- ✅ Password hashing with bcryptjs
- ✅ Email verification with OTP
- ✅ CORS protection
- ✅ Input validation
- ✅ Role-based access control

## Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + bcryptjs
- **Email:** Nodemailer

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Router:** React Router 7
- **UI Components:** Radix UI
- **Icons:** Lucide React
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form
- **Charts:** Recharts

## Folder Structure

### Backend (`/backend`)
- `server.js` - Express server with all routes and models
- `package.json` - Backend dependencies
- `.env` - Configuration file
- `node_modules/` - Installed packages

### Frontend (`/frontend`)
- `src/components/` - React components
- `src/services/api.ts` - API client
- `src/styles/` - Global styles
- `src/utils/` - Helper functions
- `vite.config.ts` - Build configuration
- `package.json` - Frontend dependencies

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/student/login` - Student login
- `POST /api/student/register` - Student registration
- `POST /api/student/forgot-password` - Request password reset
- `POST /api/student/verify-otp` - Verify OTP
- `POST /api/student/reset-password` - Reset password

### Elections
- `GET /api/elections` - Get all elections
- `GET /api/elections/:id` - Get specific election
- `POST /api/admin/elections` - Create election (admin)
- `PUT /api/admin/elections/:id` - Update election (admin)
- `DELETE /api/admin/elections/:id` - Delete election (admin)

### Candidates
- `GET /api/candidates` - Get all candidates
- `POST /api/admin/candidates` - Create candidate (admin)
- `DELETE /api/admin/candidates/:id` - Delete candidate (admin)

### Voting
- `POST /api/vote` - Submit a vote
- `GET /api/vote/status/:electionId/:studentId` - Check vote status
- `DELETE /api/vote/:voteId` - Delete a vote
- `GET /api/elections/:id/results` - Get election results

## Development

### Backend Development
1. Navigate to backend folder: `cd backend`
2. Start server: `npm start`
3. Server runs on `http://localhost:5000`
4. Auto-restarts on file changes

### Frontend Development
1. Navigate to frontend folder: `cd frontend`
2. Start dev server: `npm run dev`
3. Frontend runs on `http://localhost:5173`
4. Hot reload on file changes

## Building for Production

```bash
# Build frontend
npm run build

# Output: frontend/dist/ (ready for deployment)
```

## Deployment

### Backend Deployment
Deploy `/backend` to:
- Heroku
- Railway
- Render
- AWS EC2
- DigitalOcean

### Frontend Deployment
1. Build: `npm run build`
2. Deploy `/frontend/dist/` to:
   - Vercel
   - Netlify
   - GitHub Pages
   - AWS S3 + CloudFront

## Configuration

### Backend Configuration (`.env`)
```env
MONGODB_URI=mongodb://localhost:27017/voting-system
PORT=5000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend Configuration
API base URL is configured in `/frontend/src/services/api.ts`
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

## Troubleshooting

### Backend won't start
- Check MongoDB is running
- Check port 5000 is available
- Verify `.env` file exists and has correct MongoDB URI

### Frontend won't start
- Check backend is running
- Check port 5173 is available
- Clear cache: `rm -rf frontend/node_modules && npm install`

### API calls failing
- Check backend is running on port 5000
- Check CORS is enabled in server
- Verify API base URL in frontend config

## Features Details

### Election Management
- Create elections with title, description, start and end dates
- Edit election dates while election is ongoing
- Elections cannot be edited once ended
- Real-time status updates (Upcoming → Ongoing → Ended)

### Voting System
- Students can vote once per election
- Vote counts update in real-time
- Vote history shows all student votes
- Students can delete individual votes
- Results show live vote counts and percentages

### Photo Upload
- Candidates can have profile photos
- Upload size limit: 50MB
- Photos stored as Base64 in database
- Display in voting interface and results

## License

MIT

## Support

For issues or questions, please check the documentation files or create an issue in the repository.

---

**Last Updated:** November 16, 2025  
**Status:** Production Ready ✅
