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
import { Roles, Statuses, OfferKind } from '../constants/index.js';
import { connectDB } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

export async function seedDatabase(isDirectRun = false) {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/connect_invest';

  try {
    if (mongoose.connection.readyState !== 1) {
      console.log(`[Unified Seeder] Connecting to MongoDB...`);
      await connectDB();
    }
    console.log('[Unified Seeder] Connected to database.');

    console.log('[Unified Seeder] Resetting collections...');
    await Promise.all([
      User.deleteMany({}),
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
      Subscription.deleteMany({})
    ]);

    // 1. Admin Users
    const adminHash = await bcrypt.hash('AdminPassword123!', 10);
    const adminUser = await User.create({
      role: 'admin',
      name: 'System Administrator',
      email: 'admin@connectinvest.com',
      mobile: '+919876543210',
      password: adminHash,
      passwordHash: adminHash,
      status: 'active',
      isVerified: true
    });
    console.log(`[Unified Seeder] Created Admin: ${adminUser.email} (Password: AdminPassword123!)`);

    // 2. Company Owners & Companies
    const companyHash = await bcrypt.hash('CompanyPass123!', 10);
    const companyOwner1 = await User.create({
      role: 'companyOwner',
      name: 'Arjun Mehta',
      email: 'arjun@apexrenewables.in',
      mobile: '+919822011223',
      password: companyHash,
      passwordHash: companyHash,
      status: 'active',
      isVerified: true
    });

    const company1 = await Company.create({
      name: 'Apex Renewable Energy Pvt Ltd',
      legalName: 'Apex Renewable Energy Pvt Ltd',
      brandName: 'Apex Renewables',
      regNo: 'U40106DL2021PTC384920',
      cin: 'U40106DL2021PTC384920',
      pan: 'AABCA1234F',
      gstin: '07AABCA1234F1Z5',
      status: Statuses.COMPANY.APPROVED,
      verificationStatus: 'Verified',
      ownerUserId: companyOwner1._id,
      userId: companyOwner1._id,
      industry: 'Renewable Energy',
      sector: 'Clean Energy & Solar',
      website: 'https://apexrenewables.in',
      officialEmail: 'contact@apexrenewables.in',
      description: 'Pioneering solar microgrid installations for commercial hubs across India.',
      bankAccount: {
        holderName: 'Apex Renewable Energy Private Limited',
        accountNo: '918273645012',
        ifsc: 'HDFC0000128',
        bankName: 'HDFC Bank, Connaught Place',
        verified: true,
        effectiveFrom: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      directors: [
        {
          name: 'Arjun Mehta',
          email: 'arjun@apexrenewables.in',
          mobile: '+919822011223',
          designation: 'Managing Director',
          sharesOwnedPercentage: 60,
          identityVerified: true
        }
      ]
    });

    const companyOwner2 = await User.create({
      role: 'companyOwner',
      name: 'Sunita Rao',
      email: 'sunita@zenithagri.co',
      mobile: '+919845044556',
      password: companyHash,
      passwordHash: companyHash,
      status: 'active',
      isVerified: true
    });

    const company2 = await Company.create({
      name: 'Zenith Agri Harvest Ltd',
      legalName: 'Zenith Agri Harvest Ltd',
      brandName: 'Zenith Agri',
      regNo: 'U01100KA2020PLC134892',
      cin: 'U01100KA2020PLC134892',
      pan: 'AABCV5678K',
      gstin: '29AABCV5678K1Z3',
      status: Statuses.COMPANY.APPROVED,
      verificationStatus: 'Verified',
      ownerUserId: companyOwner2._id,
      userId: companyOwner2._id,
      industry: 'Food & Agriculture',
      sector: 'Hydroponics & Precision Farming',
      website: 'https://zenithagri.co',
      officialEmail: 'contact@zenithagri.co',
      description: 'Modern hydroponics and precision farming infrastructure across Karnataka.',
      bankAccount: {
        holderName: 'Zenith Agri Harvest Limited',
        accountNo: '112233445566',
        ifsc: 'ICIC0000002',
        bankName: 'ICICI Bank, MG Road Bengaluru',
        verified: true,
        effectiveFrom: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      }
    });

    // 3. Investors
    const investorHash = await bcrypt.hash('InvestorPassword123!', 10);
    const investor1 = await User.create({
      role: 'investor',
      name: 'Rahul Sharma',
      email: 'investor@connectinvest.com',
      mobile: '+919876543220',
      password: investorHash,
      passwordHash: investorHash,
      status: 'active',
      isVerified: true
    });

    const investor2 = await User.create({
      role: 'investor',
      name: 'Vikram Sharma',
      email: 'vikram.sharma@example.com',
      mobile: '+919811122233',
      password: investorHash,
      passwordHash: investorHash,
      status: 'active',
      isVerified: true
    });

    // 4. Investor Profiles & KYC
    await InvestorProfile.create({
      userId: investor1._id,
      pan: 'ABCDE1234F',
      panNumber: 'ABCDE1234F',
      aadhaarNumber: 'XXXX-XXXX-8921',
      aadhaarVerified: true,
      dob: new Date('1990-05-15'),
      nationality: 'Indian',
      kycStatus: Statuses.KYC.APPROVED,
      address: {
        line1: 'B-402, Green Glen Layout, Bellandur',
        street: 'B-402, Green Glen Layout',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560103'
      },
      bankAccount: {
        holderName: 'Rahul Sharma',
        accountNo: '50100482934210',
        ifsc: 'HDFC0001234',
        verified: true
      },
      bankDetails: {
        bankName: 'HDFC Bank Ltd',
        accountNumber: '50100482934210',
        ifscCode: 'HDFC0001234',
        accountHolderName: 'Rahul Sharma',
        isVerified: true
      }
    });

    await KYC.create({
      investorId: investor1._id,
      fullName: 'Rahul Sharma',
      panNumber: 'ABCDE1234F',
      addressProofType: 'Aadhaar Card',
      addressProofNumber: 'XXXX-XXXX-8921',
      bankName: 'HDFC Bank Ltd',
      accountNumber: '50100482934210',
      ifscCode: 'HDFC0001234',
      status: 'APPROVED',
      submittedAt: new Date(),
      reviewedAt: new Date()
    });

    await InvestorProfile.create({
      userId: investor2._id,
      pan: 'ABCDE5678G',
      panNumber: 'ABCDE5678G',
      aadhaarNumber: 'XXXX-XXXX-1122',
      aadhaarVerified: true,
      dob: new Date('1988-11-20'),
      nationality: 'Indian',
      kycStatus: Statuses.KYC.APPROVED,
      address: {
        line1: 'Flat 101, Palm Meadows',
        street: 'Flat 101, Palm Meadows',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050'
      },
      bankAccount: {
        holderName: 'Vikram Sharma',
        accountNo: '987654321098',
        ifsc: 'SBIN0000456',
        verified: true
      }
    });

    await KYC.create({
      investorId: investor2._id,
      fullName: 'Vikram Sharma',
      panNumber: 'ABCDE5678G',
      addressProofType: 'Aadhaar Card',
      addressProofNumber: 'XXXX-XXXX-1122',
      bankName: 'State Bank of India',
      accountNumber: '987654321098',
      ifscCode: 'SBIN0000456',
      status: 'APPROVED',
      submittedAt: new Date(),
      reviewedAt: new Date()
    });

    // 5. Offers (Both Offer and InvestmentOffer for complete compatibility)
    const offer1 = await Offer.create({
      kind: OfferKind.PROJECT,
      companyId: company1._id,
      title: 'Apex Solar Farm Phase 1 (Project)',
      description: '10 MW high-efficiency photovoltaic solar park installation in Rajasthan.',
      targetPaise: 5000000000, // ₹ 5,00,00,000 (5 Crore)
      minTargetPaise: 2500000000,
      raisedPaise: 3250000000,
      heldPaise: 0,
      status: Statuses.OFFER.OPEN,
      publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      rateBps: 1200, // 12%
      tenureMonths: 24,
      payoutFrequency: 'monthly',
      minInvestmentPaise: 5000000 // ₹ 50,000
    });

    const offer2 = await Offer.create({
      kind: OfferKind.PROJECT,
      companyId: company2._id,
      title: 'Zenith Agri Harvest Hub (Project)',
      description: 'Automated climate-controlled vertical hydroponic farm with verified corporate off-take agreements.',
      targetPaise: 2500000000, // ₹ 2,50,00,000
      minTargetPaise: 1500000000,
      raisedPaise: 1750000000,
      heldPaise: 0,
      status: Statuses.OFFER.OPEN,
      publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      rateBps: 1100, // 11%
      tenureMonths: 18,
      payoutFrequency: 'monthly',
      minInvestmentPaise: 2500000
    });

    // Seed InvestmentOffers for the Investor opportunities page
    const io1 = await InvestmentOffer.create({
      title: 'GreenTech Solar & Wind Energy Expansion',
      companyName: 'Apex Renewable Energy Pvt Ltd',
      type: 'Project',
      category: 'Renewable Energy',
      description: 'Discover renewable energy company focused on solar and wind investment solutions with 25-year PPA contracts.',
      targetAmount: 50000000,
      raisedAmount: 32500000,
      minInvestment: 50000,
      maxInvestment: 5000000,
      returnRate: 12,
      tenureMonths: 24,
      payoutFrequency: 'Monthly',
      riskLevel: 'Low',
      status: 'Active',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      location: 'Bengaluru, Karnataka',
      securityType: 'Senior Secured Debenture'
    });

    const io2 = await InvestmentOffer.create({
      title: 'Zenith Hydroponic Agri Harvest Hub',
      companyName: 'Zenith Agri Harvest Ltd',
      type: 'Project',
      category: 'Food & Agriculture',
      description: 'Automated climate-controlled vertical hydroponic farm providing premium organic produce to retail chains.',
      targetAmount: 25000000,
      raisedAmount: 17500000,
      minInvestment: 25000,
      maxInvestment: 2500000,
      returnRate: 11,
      tenureMonths: 18,
      payoutFrequency: 'Monthly',
      riskLevel: 'Low',
      status: 'Active',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
      location: 'Mysuru, Karnataka',
      securityType: 'Asset-Backed Note'
    });

    // 6. Investments
    const inv1 = await Investment.create({
      investorId: investor1._id,
      offerId: offer1._id,
      companyId: company1._id,
      amountPaise: 15000000, // ₹ 1,50,000
      amount: 150000,
      monthlyReturnPaise: 150000, // 1% per month = ₹ 1,500
      tenureMonths: 24,
      status: Statuses.INVESTMENT.CONFIRMED,
      activationDate: new Date('2026-01-15'),
      maturityDate: new Date('2028-01-15')
    });

    const inv2 = await Investment.create({
      investorId: investor1._id,
      offerId: offer2._id,
      companyId: company2._id,
      amountPaise: 10000000, // ₹ 1,00,000
      amount: 100000,
      monthlyReturnPaise: 91666,
      tenureMonths: 18,
      status: Statuses.INVESTMENT.CONFIRMED,
      activationDate: new Date('2026-02-01'),
      maturityDate: new Date('2027-08-01')
    });

    // 7. Payouts
    await Payout.create({
      investmentId: inv1._id,
      investorId: investor1._id,
      offerId: offer1._id,
      offerTitle: offer1.title,
      amountPaise: 150000, // ₹ 1,500
      amount: 1500,
      payoutType: 'return',
      status: Statuses.PAYOUT.PAID,
      paidDate: new Date('2026-02-15'),
      scheduledDate: new Date('2026-02-15'),
      bankRef: 'UTR-HDFC-9918237'
    });

    await Payout.create({
      investmentId: inv2._id,
      investorId: investor1._id,
      offerId: offer2._id,
      offerTitle: offer2.title,
      amountPaise: 91666,
      amount: 916.66,
      payoutType: 'return',
      status: Statuses.PAYOUT.CALCULATED,
      scheduledDate: new Date('2026-03-01')
    });

    // 8. Transactions
    await Transaction.create({
      investorId: investor1._id,
      investmentId: inv1._id,
      title: 'Investment in Apex Solar Farm Phase 1',
      type: 'Investment',
      amount: 150000,
      description: 'Investment in Apex Solar Farm Phase 1',
      status: 'Confirmed',
      transactionDate: new Date('2026-01-15'),
      referenceId: 'TXN-CI-2026-001'
    });

    await Transaction.create({
      investorId: investor1._id,
      investmentId: inv2._id,
      title: 'Investment in Zenith Agri Harvest Hub',
      type: 'Investment',
      amount: 100000,
      description: 'Investment in Zenith Agri Harvest Hub',
      status: 'Confirmed',
      transactionDate: new Date('2026-02-01'),
      referenceId: 'TXN-CI-2026-002'
    });

    await Transaction.create({
      investorId: investor1._id,
      title: 'Monthly Interest Payout - Apex Solar Farm',
      type: 'Payout',
      amount: 1500,
      description: 'Monthly Interest Payout - Apex Solar Farm',
      status: 'Confirmed',
      transactionDate: new Date('2026-02-15'),
      referenceId: 'TXN-CI-2026-003'
    });

    console.log('[Unified Seeder] Database seeded successfully!');
    console.log('--------------------------------------------------');
    console.log('Admin Account:    admin@connectinvest.com / AdminPassword123!');
    console.log('Investor Account: investor@connectinvest.com / InvestorPassword123!');
    console.log('Company Account:  arjun@apexrenewables.in / CompanyPass123!');
    console.log('--------------------------------------------------');

    if (isDirectRun) {
      process.exit(0);
    }
  } catch (err) {
    console.error('[Unified Seeder] Seeding error:', err);
    if (isDirectRun) {
      process.exit(1);
    }
    throw err;
  }
}

if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  seedDatabase(true);
}
