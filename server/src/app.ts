import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import attendanceRoutes from './routes/attendance.routes';
import employeeRoutes from './routes/employees.routes';
import shiftRoutes from './routes/shifts.routes';
import leaveRoutes from './routes/leaves.routes';
import correctionRoutes from './routes/corrections.routes';
import reportsRoutes from './routes/reports.routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  // Disable caching for all API responses
  app.use('/api/v1', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/attendance', attendanceRoutes);
  app.use('/api/v1/employees', employeeRoutes);
  app.use('/api/v1/corrections', correctionRoutes);
  app.use('/api/v1/reports', reportsRoutes);
  app.use('/api/v1/leaves', leaveRoutes);
  app.use('/api/v1/shifts', shiftRoutes);

  app.use(errorHandler);

  return app;
}
