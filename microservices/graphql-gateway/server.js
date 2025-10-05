const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { setupServiceClients } = require('./service-clients');
require('dotenv').config();

async function startServer() {
  try {
    console.log('🔄 Initializing GraphQL Gateway...');
    const serviceClients = await setupServiceClients();
    
    const app = express();

    app.use(cors({
      origin: [
        'http://localhost:5173',
        'http://localhost:3000', 
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Apollo-Require-Preflight'],
    }));

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: true,
      playground: true,
      cors: false,
      context: ({ req }) => {
        return {
          user: req.user || null,
          services: serviceClients
        };
      },
    });

    await server.start();
    server.applyMiddleware({ 
      app, 
      path: '/graphql',
      cors: false // We handle CORS with express middleware above
    });
    
    // Health check endpoint
    app.get('/health', async (req, res) => {
      try {
        const servicesStatus = await serviceClients.getHealthStatus();
        
        res.json({ 
          status: 'OK', 
          service: 'GraphQL Gateway API',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          services: servicesStatus
        });
      } catch (error) {
        res.status(500).json({
          status: 'ERROR',
          service: 'GraphQL Gateway API',
          timestamp: new Date().toISOString(),
          error: error.message
        });
      }
    });

    const PORT = process.env.GATEWAY_PORT || 4000;
    
    app.listen(PORT, () => {
      console.log(`   GraphQL Gateway running at:`);
      console.log(`   GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
      console.log(`   GraphQL Playground: http://localhost:${PORT}${server.graphqlPath}`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
      console.log(`\n📱 Frontend should connect to: http://localhost:${PORT}/graphql`);
    });

  } catch (error) {
    console.error('❌ Failed to start Gateway server:', error);
    process.exit(1);
  }
}

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer().catch(error => {
  console.error('Error starting server:', error);
  process.exit(1);
});