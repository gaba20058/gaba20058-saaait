import 'dotenv/config';
import app from './app';
import { connectDb } from './db';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDb();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();