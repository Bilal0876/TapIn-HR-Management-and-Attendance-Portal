import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './features/auth/auth.routes';
import attendanceRoutes from './features/attendance/attendance.routes';
import employeeRoutes from './features/employees/employees.routes';
import correctionRoutes from './features/corrections/correction.routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/attendance', attendanceRoutes);
  app.use('/api/v1/employees', employeeRoutes);
  app.use('/api/v1/corrections', correctionRoutes);

  app.use(errorHandler);

  return app;
}
