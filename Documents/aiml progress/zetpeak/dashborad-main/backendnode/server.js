import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initDatabase } from './database/init.js';
import customersRouter from './routes/customers.js';
import servicesRouter from './routes/services.js';
import appointmentsRouter from './routes/appointments.js';
import teamMembersRouter from './routes/team-members.js';
import onboardingRouter from './routes/onboarding.js';
import analyticsRouter from './routes/analytics.js';
import organizationSettingsRouter from './routes/organization-settings.js';
import workspacesRouter from './routes/workspaces.js';
import resourcesRouter from './routes/resources.js';
import locationsRouter from './routes/locations.js';
import integrationsRouter from './routes/integrations.js';
import customLabelsRouter from './routes/custom-labels.js';
import rolesRouter from './routes/roles.js';
import exportRouter from './routes/export.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Initialize database
initDatabase();

// Routes
app.use('/api/customers', customersRouter);
app.use('/api/services', servicesRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/team-members', teamMembersRouter);
app.use('/api/onboarding/business', onboardingRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/organization-settings', organizationSettingsRouter);
app.use('/api/workspaces', workspacesRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/integrations', integrationsRouter);
app.use('/api/custom-labels', customLabelsRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/export', exportRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Node.js backend is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║   🚀 Zervos Node.js Backend Server Running           ║
╚═══════════════════════════════════════════════════════╝
  
  📍 Server: http://localhost:${PORT}
  🔧 Environment: ${process.env.NODE_ENV || 'development'}
  🌐 CORS Enabled: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}
  
  Available endpoints:
  - GET  /api/health
  - CRUD /api/customers
  - CRUD /api/services
  - CRUD /api/appointments
  - CRUD /api/team-members
  - CRUD /api/onboarding/business
  - GET  /api/analytics/*
  - CRUD /api/organization-settings
  - CRUD /api/workspaces
  - CRUD /api/resources
  - CRUD /api/locations
  - CRUD /api/integrations
  - CRUD /api/custom-labels
  - CRUD /api/roles
  - GET  /api/export/* (appointments, customers, services, team-members, all)
  `);
});

export default app;
