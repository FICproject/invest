/**
 * Connect Invest - Database Configuration
 * Connects to local MongoDB daemon or automatically launches an embedded local replica set on 127.0.0.1:27017
 */

import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isReplicaSet = false;
let mongodInstance = null;

export async function connectDB() {
  const defaultUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/connect_invest';

  // Attempt 1: Connect to existing local MongoDB instance
  try {
    console.log(`[MongoDB] Attempting connection to local instance at ${defaultUri}...`);
    const conn = await mongoose.connect(defaultUri, {
      serverSelectionTimeoutMS: 2000
    });

    console.log(`[MongoDB] Connected to active local instance (${conn.connection.host}:${conn.connection.port})`);

    try {
      const adminDb = conn.connection.db.admin();
      const status = await adminDb.command({ replSetGetStatus: 1 });
      if (status && status.ok) {
        isReplicaSet = true;
        console.log(`[MongoDB] Replica set "${status.set}" detected. ACID transactions active.`);
      }
    } catch {
      isReplicaSet = false;
      console.log('[MongoDB] Running standalone. ACID transactions will use atomic fallback.');
    }

    return conn;
  } catch (initialErr) {
    console.warn(`[MongoDB] No active daemon on port 27017 (${initialErr.message}).`);
    console.log('[MongoDB] Launching local MongoDB replica set service...');

    try {
      const { MongoMemoryReplSet } = await import('mongodb-memory-server');

      const dbPath = path.join(__dirname, '../../data/db');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      mongodInstance = await MongoMemoryReplSet.create({
        instanceOpts: [
          {
            port: 27017,
            dbPath,
            storageEngine: 'wiredTiger'
          }
        ],
        replSet: {
          name: 'rs0',
          count: 1,
          storageEngine: 'wiredTiger'
        }
      });

      const uri = mongodInstance.getUri('connect_invest');
      console.log(`[MongoDB] Local MongoDB replica set started on port 27017: ${uri}`);

      const conn = await mongoose.connect(uri);
      isReplicaSet = true;
      console.log('[MongoDB] Connected to local MongoDB replica set. Multi-document transactions active.');
      return conn;
    } catch (launchErr) {
      console.error('[MongoDB] Failed to start local embedded MongoDB runner:', launchErr);
      throw launchErr;
    }
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
