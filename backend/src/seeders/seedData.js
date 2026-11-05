import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  User,
  InvestorProfile,
  Company,
  Offer,
  InvestmentOffer,
  OfferTerms,
  Investment,
  Repayment,
  Payout,
  Release,
  Ledger,
  AuditLog,
  Dividend,
  KYC,
  Notification,
  Transaction,
  Shareholder,
  ShareAllocation,
  FinancialReport,
  Query,
  Subscription
} from '../models/index.js';
import { Payment } from '../models/Payment.js';
import { connectDB } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Clean & Fresh Database Initializer
 * Purges ALL demo/mock investors, companies, investments, returns, transactions, and offers.
 * Retains strictly the single system administrative root account so the Admin console is accessible.
 */
export async function seedDatabase(isDirectRun = false) {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log(`[Database Reset] Connecting to database...`);
      await connectDB();
    }

    console.log('[Database Reset] Completely purging all investors, companies, investments, returns, transactions...');

    await Promise.all([
      User.deleteMany({ role: { $ne: 'admin' } }),
      InvestorProfile.deleteMany({}),
      Company.deleteMany({}),
      Offer.deleteMany({}),
      InvestmentOffer.deleteMany({}),
      OfferTerms.deleteMany({}),
      Investment.deleteMany({}),
      Repayment.deleteMany({}),
      Payout.deleteMany({}),
      Release.deleteMany({}),
      Dividend.deleteMany({}),
      Ledger.collection.deleteMany({}),
      AuditLog.collection.deleteMany({}),
      KYC.deleteMany({}),
      Notification.deleteMany({}),
      Transaction.deleteMany({}),
      Shareholder.deleteMany({}),
      ShareAllocation.deleteMany({}),
      FinancialReport.deleteMany({}),
      Query.deleteMany({}),
      Subscription.deleteMany({}),
      Payment.deleteMany({})
    ]);

    // Ensure System Admin account exists for manual platform access
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      const adminHash = await bcrypt.hash('AdminPassword123!', 10);
      adminUser = await User.create({
        role: 'admin',
        name: 'System Administrator',
        email: 'admin@connectinvest.com',
        mobile: '+919876543210',
        password: adminHash,
        passwordHash: adminHash,
        status: 'active',
        registrationStatus: 'Approved',
        isVerified: true
      });
      console.log(`[Database Reset] Initialized root Administrator account: ${adminUser.email}`);
    } else {
      console.log(`[Database Reset] System Administrator verified: ${adminUser.email}`);
    }

    console.log('========================================================================');
    console.log('  FRESH BLANK DATABASE READY FOR MANUAL TESTING FROM SCRATCH');
    console.log('  All demo/mock investors:    REMOVED (0 records)');
    console.log('  All demo/mock companies:    REMOVED (0 records)');
    console.log('  All demo investments:       REMOVED (0 records)');
    console.log('  All demo payouts & returns: REMOVED (0 records)');
    console.log('  All transactions & ledgers: REMOVED (0 records)');
    console.log('  Admin Portal Login:         admin@connectinvest.com');
    console.log('========================================================================');

    if (isDirectRun) {
      process.exit(0);
    }
  } catch (err) {
    console.error('[Database Reset] Error during purge:', err);
    if (isDirectRun) {
      process.exit(1);
    }
    throw err;
  }
}

if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  seedDatabase(true);
}
