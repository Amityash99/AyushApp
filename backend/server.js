import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import constructionRoutes from './routes/constructionRoutes.js';
import hrRoutes from './routes/hrRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import movementRoutes from './routes/movementRoutes.js';
import gardenRoutes from './routes/gardenRoutes.js';

import gardenMaintenanceRoutes from './routes/gardenMaintenanceRoutes.js';

import programmeRoutes from './routes/programmeRoutes.js';
import yogaInstructorRoutes from './routes/yogaInstructorRoutes.js';
import yogaSessionRoutes from './routes/yogaSessionRoutes.js';
import reportingRoutes from './routes/reportingRoutes.js';
import iecPlanRoutes from './routes/iecPlanRoutes.js';
import iecReportRoutes from './routes/iecReportRoutes.js';
import brandingWorkRoutes from './routes/brandingWorkRoutes.js';
import ncdCampaignRoutes from './routes/ncdCampaignRoutes.js';
import ncdScreeningRoutes from './routes/ncdScreeningRoutes.js';
import inspectionRoutes from './routes/inspectionRoutes.js';


dotenv.config();

connectDB().catch((error) => {
  console.error('Failed to connect to MongoDB:', error.message);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at promise:', promise, 'reason:', reason);
});

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/construction', constructionRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/movement', movementRoutes);
app.use('/api/garden', gardenRoutes);

app.use('/api/garden-maintenance', gardenMaintenanceRoutes);

app.use('/api/programme', programmeRoutes);
app.use('/api/yoga-instructor', yogaInstructorRoutes);
app.use('/api/yoga-session', yogaSessionRoutes);
app.use('/api/reporting', reportingRoutes);
app.use('/api/iec-plan', iecPlanRoutes);
app.use('/api/iec-report', iecReportRoutes);
app.use('/api/branding-work', brandingWorkRoutes);
app.use('/api/ncd-campaign', ncdCampaignRoutes);
app.use('/api/ncd-screening', ncdScreeningRoutes);
app.use('/api/inspection', inspectionRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
