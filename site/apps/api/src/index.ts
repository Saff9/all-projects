import 'dotenv/config';
import app from './app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

async function startServer() {
  // Check if DATABASE_URL is set
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl || databaseUrl.trim() === '') {
    console.warn('⚠️  DATABASE_URL not set - running without database');
    console.log('⚠️  API will return error messages for all endpoints');
    
    // Start server without database
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (NO DATABASE)`);
      console.log(`📍 API: http://localhost:${PORT}/api`);
      console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
    });
    return;
  }

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API: http://localhost:${PORT}/api`);
      console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('👋 Server shut down gracefully');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('👋 Server shut down gracefully');
  process.exit(0);
});

startServer();
