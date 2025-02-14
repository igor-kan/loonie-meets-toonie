import express from 'express';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const app = express();
const port = 3000;

// Configure postgres client
const client = postgres(process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/db');
const db = drizzle(client);

app.use(express.json());

// Add CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
    console.log('Shutting down server...');
    client.end();
    process.exit(0);
}); 