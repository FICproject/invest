/**
 * Connect Invest - Unified Database Configuration
 * Connects to local MongoDB daemon or automatically launches an embedded local replica set on 127.0.0.1:27017
 */

import mongoose from 'mongoose';
import dns from 'dns';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Fix Node.js DNS resolution on Windows networks for mongodb+srv SRV lookup
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if custom DNS fails
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isReplicaSet = false;
let mongodInstance = null;

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('[MongoDB] MONGODB_URI is not defined in .env. Please configure your MongoDB Atlas connection string.');
  }
  const defaultUri = process.env.MONGODB_URI;

  try {
    console.log(`[MongoDB] Connecting to MongoDB Atlas database...`);
    const conn = await mongoose.connect(defaultUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error('[MongoDB] Connection error:', err.message);
    throw err;
  }
}

/**
 * Execute operations inside a session transaction when replica set is active
 */
export async function withTransaction(callback) {
  if (isReplicaSet) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } else {
    return await callback(null);
  }
}

export { isReplicaSet, mongodInstance };

