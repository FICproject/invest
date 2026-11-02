/**
 * Connect Invest - Replica Set Initializer
 * Initiates single-node replica set on local MongoDB to enable ACID multi-document transactions
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function initReplica() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/admin';
  console.log(`[Replica Init] Connecting to: ${uri}`);

  try {
    const conn = await mongoose.connect(uri);
    const adminDb = conn.connection.db.admin();

    try {
      const status = await adminDb.command({ replSetGetStatus: 1 });
      console.log(`[Replica Init] Replica set "${status.set}" is already active and healthy.`);
    } catch {
      console.log('[Replica Init] No active replica set found. Initiating rs0...');
      const initResult = await adminDb.command({
        replSetInitiate: {
          _id: 'rs0',
          members: [{ _id: 0, host: '127.0.0.1:27017' }]
        }
      });
      console.log('[Replica Init] Replica set initiated successfully:', initResult);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Replica Init] Error initializing replica set:', error.message);
    console.log('[Replica Init] Note: To support replica sets, ensure mongod was started with `--replSet rs0`.');
    process.exit(1);
  }
}

initReplica();
