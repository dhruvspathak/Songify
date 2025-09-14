/**
 * Songify Backend Server
 * Modular, secure backend for Spotify OAuth integration
 */

const createApp = require('./src/app');
const config = require('./src/config/environment');

/**
 * Start the server
 */
const startServer = () => {
  try {
    // Create Express application
    const app = createApp();

    // Start server
    const server = app.listen(config.PORT, () => {
      console.log(`🚀 Songify Backend Server running on port ${config.PORT}`);
      console.log(`📍 Environment: ${config.NODE_ENV}`);
      console.log(`🌐 Frontend URL: ${config.FRONTEND_URL}`);
      console.log(`🎵 Spotify Client ID: ${config.SPOTIFY.CLIENT_ID ? '✅ Configured' : '❌ Missing'}`);
      console.log(`🔑 Spotify Client Secret: ${config.SPOTIFY.CLIENT_SECRET ? '✅ Configured' : '❌ Missing'}`);
      console.log(`⏰ Server started at: ${new Date().toISOString()}`);
      
      if (config.NODE_ENV === 'development') {
        console.log(`\n📋 Available endpoints:`);
        console.log(`   Health: http://localhost:${config.PORT}/health`);
        console.log(`   Auth:   http://localhost:${config.PORT}/auth`);
        console.log(`   API:    http://localhost:${config.PORT}/api`);
      }
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      server.close((err) => {
        if (err) {
          console.error('❌ Error during server shutdown:', err);
          process.exit(1);
        }
        
        console.log('✅ Server closed successfully');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { startServer, createApp };