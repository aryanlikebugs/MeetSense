import 'dotenv/config';
import { connectDB } from './config/db.js';
import app from './app.js';
import { createServer } from 'http';
import './config/env.js';
import { initSocket } from './sockets/index.js';

const PORT = process.env.PORT || 5000;

const server = createServer(app);

// Initialize Socket.IO
initSocket(server);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
