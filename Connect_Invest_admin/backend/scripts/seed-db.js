/**
 * Connect Invest - Real Database Seeder
 * Populates local MongoDB with initial administrative account and test documents
 */

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
  OfferTerms,
  Investment,
  Repayment,
  Payout,
  Release,
  Ledger,
  AuditLog,
  Dividend
} from '../src/models/index.js';
import { Roles, Statuses, OfferKind } from '../src/constants/index.js';
import { rupeesToPaise, calculateMonthlyReturnPaise } from '../src/services/rulesService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

export async function seed(isDirectRun = false) {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/connect_invest';

  try {
    if (mongoose.connection.readyState !== 1) {
      console.log(`[Seeder] Connecting to local MongoDB at: ${uri}`);
      await mongoose.connect(uri);
    }
    console.log('[Seeder] Connected to database.');

    // Clear existing collections for a clean, deterministic seed
    console.log('[Seeder] Resetting existing collections...');
    await Promise.all([
      User.deleteMany({}),
      InvestorProfile.deleteMany({}),
      Company.deleteMany({}),
      Offer.deleteMany({}),
      OfferTerms.deleteMany({}),
      Investment.deleteMany({}),
      Repayment.deleteMany({}),
      Payout.deleteMany({}),
      Release.deleteMany({}),
      Dividend.deleteMany({}),
      Ledger.collection.deleteMany({}),
      AuditLog.collection.deleteMany({})
    ]);

    // 1. Create Default Admin User
    const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
    const adminUser = await User.create({
      role: Roles.ADMIN,
      name: 'System Administrator',
      email: 'admin@connectinvest.com',
      mobile: '+91 98765 43210',
      passwordHash: adminPasswordHash,
      status: 'active'
    });
    console.log(`[Seeder] Created Admin User: ${adminUser.email} (Password: AdminPassword123!)`);

    // 2. Create Company Owners & Companies
    const companyOwnerHash = await bcrypt.hash('CompanyPass123!', 10);
    const owner1 = await User.create({
      role: Roles.COMPANY_OWNER,
      name: 'Arjun Mehta',
      email: 'arjun@apexrenewables.in',
      mobile: '+91 98220 11223',
      passwordHash: companyOwnerHash,
      status: 'active'
    });

    const company1 = await Company.create({
      name: 'Apex Renewable Energy Pvt Ltd',
      regNo: 'U40106DL2021PTC384920',
      status: Statuses.COMPANY.APPROVED,
      ownerUserId: owner1._id,
      profile: {
        description: 'Pioneering solar microgrid installations for commercial hubs across Northern India.',
        sector: 'Clean Energy & Solar',
        website: 'https://apexrenewables.in',
        city: 'New Delhi',
        state: 'Delhi',
        foundedYear: 2021
      },
      kybDocuments: {
        incorporationCert: '/uploads/samples/apex_cin.pdf',
        panCard: '/uploads/samples/apex_pan.pdf',
        gstCert: '/uploads/samples/apex_gst.pdf',
        signatoryProof: '/uploads/samples/arjun_aadhar.pdf'
      },
      bankAccount: {
        holderName: 'Apex Renewable Energy Private Limited',
        accountNo: '918273645012',
        ifsc: 'HDFC0000128',
        bankName: 'HDFC Bank, Connaught Place',
        verified: true,
        effectiveFrom: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago (Passed cooling off)
      }
    });

    const owner2 = await User.create({
      role: Roles.COMPANY_OWNER,
      name: 'Sunita Rao',
      email: 'sunita@zenithagri.co',
      mobile: '+91 98450 44556',
      passwordHash: companyOwnerHash,
      status: 'active'
    });

    const company2 = await Company.create({
      name: 'Zenith Agritech Solutions LLP',
      regNo: 'AAB-1928',
      status: Statuses.COMPANY.KYB_SUBMITTED, // Waiting for admin review!
      ownerUserId: owner2._id,
      profile: {
        description: 'IoT automated smart greenhouse infrastructure for organic farming.',
        sector: 'Agriculture & AgriTech',
        website: 'https://zenithagri.co',
        city: 'Bengaluru',
        state: 'Karnataka',
        foundedYear: 2023
      },
      kybDocuments: {
        incorporationCert: '/uploads/samples/zenith_llp.pdf',
        panCard: '/uploads/samples/zenith_pan.pdf'
      },
      bankAccount: {
        holderName: 'Zenith Agritech Solutions LLP',
        accountNo: '50200039281726',
        ifsc: 'ICIC0000002',
        bankName: 'ICICI Bank, Koramangala',
        verified: false,
        effectiveFrom: new Date() // Fresh bank update (In cooling off!)
      }
    });
    console.log(`[Seeder] Created 2 Companies (1 Approved, 1 Pending KYB review).`);

    // 3. Create Sample Investors & KYC Records
    const investorPasswordHash = await bcrypt.hash('InvestorPass123!', 10);

    // Investor 1: KYC Approved
    const invUser1 = await User.create({
      role: Roles.INVESTOR,
      name: 'Vikram Sharma',
      email: 'vikram.sharma@example.com',
      mobile: '+91 99100 88221',
      passwordHash: investorPasswordHash,
      status: 'active'
    });

    await InvestorProfile.create({
      userId: invUser1._id,
      dob: new Date('1988-06-15'),
      pan: 'ABCPS1234F',
      address: {
        line1: 'Flat 402, Sunshine Towers, Sector 45',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122003'
      },
      kycStatus: Statuses.KYC.APPROVED,
      kycReason: 'All documents verified and PAN matched successfully with NSDL records.',
      documents: {
        idProof: '/uploads/samples/vikram_pan.jpg',
        addressProof: '/uploads/samples/vikram_passport.jpg',
        selfie: '/uploads/samples/vikram_selfie.jpg'
      },
      bankAccount: {
        holderName: 'Vikram Sharma',
        accountNo: '304928172635',
        ifsc: 'SBIN0001234',
        verified: true
      }
    });

    // Investor 2: KYC Submitted (Pending Admin Review!)
    const invUser2 = await User.create({
      role: Roles.INVESTOR,
      name: 'Pooja Patel',
      email: 'pooja.patel@example.com',
      mobile: '+91 98200 99443',
      passwordHash: investorPasswordHash,
      status: 'active'
    });

    await InvestorProfile.create({
      userId: invUser2._id,
      dob: new Date('1994-11-20'),
      pan: 'BNYPP9876K',
      address: {
        line1: 'B-12, Green Acres, Viman Nagar',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411014'
      },
      kycStatus: Statuses.KYC.SUBMITTED, // Ready for Admin KYC worklist
      documents: {
        idProof: '/uploads/samples/pooja_pan.jpg',
        addressProof: '/uploads/samples/pooja_utility.pdf',
        selfie: '/uploads/samples/pooja_selfie.jpg'
      },
      bankAccount: {
        holderName: 'Pooja Patel',
        accountNo: '60192837465',
        ifsc: 'HDFC0000045',
        verified: false
      }
    });

    // Investor 3: KYC Needs Info
    const invUser3 = await User.create({
      role: Roles.INVESTOR,
      name: 'Rahul Verma',
      email: 'rahul.verma@example.com',
      mobile: '+91 97110 33445',
      passwordHash: investorPasswordHash,
      status: 'active'
    });

    await InvestorProfile.create({
      userId: invUser3._id,
      dob: new Date('1991-03-10'),
      pan: 'CKMPV4567M',
      address: {
        line1: '84 Indiranagar 100ft Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038'
      },
      kycStatus: Statuses.KYC.MORE_INFO_NEEDED,
      kycReason: 'Aadhar address proof was blurry. Please upload a clear color scan.',
      documents: {
        idProof: '/uploads/samples/rahul_pan.jpg'
      }
    });
    console.log(`[Seeder] Created 3 Investors (1 Approved, 1 Submitted awaiting review, 1 Needs More Info).`);

    // 4. Create Offers
    // Offer 1: Active Project Offer (12-month lock-in, 300 bps return)
    const projectTargetPaise = rupeesToPaise(5000000); // ₹50,00,000
    const projectMinTargetPaise = rupeesToPaise(4000000); // ₹40,00,000
    const projectRaisedPaise = rupeesToPaise(5000000); // 100% funded!

    const offer1 = await Offer.create({
      kind: OfferKind.PROJECT,
      companyId: company1._id,
      title: 'Solar Rooftop Grid Expansion Phase II',
      description: 'Turnkey 2.5 MW solar rooftop microgrid deployment for industrial logistics park in Gurugram.',
      useOfFunds: 'Procurement of Tier-1 solar photovoltaic panels, string inverters, and net-metering switchgear.',
      targetPaise: projectTargetPaise,
      minTargetPaise: projectMinTargetPaise,
      raisedPaise: projectRaisedPaise,
      rateBps: 300, // 3% per month
      tenures: [12, 18, 24], // PRD compliant (>= 12 months)
      status: Statuses.OFFER.ACTIVE,
      activationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Activated 30 days ago
      maturityDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
      milestones: [
        { title: 'Equipment Procurement', completed: true },
        { title: 'Rooftop Mounting & Inverters', completed: true },
        { title: 'Grid Interconnection & Inspection', completed: false }
      ]
    });

    await OfferTerms.create({
      offerId: offer1._id,
      version: 1,
      body: 'Standard 300 bps project financing terms with monthly returns and principal repayment at 12-month maturity.',
      acceptedByCompanyAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
    });

    // Offer 2: Open Project Offer (Accepting funds)
    const offer2 = await Offer.create({
      kind: OfferKind.PROJECT,
      companyId: company1._id,
      title: 'Commercial EV Charging Hub Network',
      description: '10 DC Fast-Charging stations across Delhi-NCR expressway network.',
      useOfFunds: 'Transformer installation, fast-chargers, payment kiosks.',
      targetPaise: rupeesToPaise(2500000), // ₹25,00,000
      minTargetPaise: rupeesToPaise(2000000),
      raisedPaise: rupeesToPaise(1250000), // 50% funded
      rateBps: 275, // 2.75% per month
      tenures: [12, 24, 36],
      status: Statuses.OFFER.OPEN,
      windowStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      windowEnd: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
    });

    // Offer 3: Submitted Draft Offer (Awaiting Admin Terms Review in WorkList!)
    const offer3 = await Offer.create({
      kind: OfferKind.PROJECT,
      companyId: company2._id,
      title: 'Automated Hydroponics Farming Facility',
      description: 'Hydroponics vertical farming facility for pesticide-free exotic vegetables.',
      useOfFunds: 'Greenhouse polycarbonate roofing, nutrient dosing systems, climate controllers.',
      targetPaise: rupeesToPaise(3500000),
      minTargetPaise: rupeesToPaise(3000000),
      rateBps: 250,
      tenures: [12, 18],
      status: Statuses.OFFER.SUBMITTED // Appears in Admin Work List for Terms configuration
    });

    // Offer 4: Active Equity / Shareholder Investment Offer (No fixed tenure or maturity)
    const equityTargetPaise = rupeesToPaise(10000000); // ₹1,00,00,000 (1 Crore)
    const sharePricePaise = rupeesToPaise(500); // ₹500 per share

    const offer4 = await Offer.create({
      kind: OfferKind.EQUITY,
      companyId: company1._id,
      title: 'Apex CleanTech Series-A Equity Expansion Round',
      description: 'Equity shareholding round to fund expansion of rooftop solar microgrid manufacturing facilities across North India.',
      useOfFunds: 'Automated assembly robotics, inverter testing laboratory, and regional distribution infrastructure.',
      targetPaise: equityTargetPaise,
      minTargetPaise: rupeesToPaise(8000000),
      raisedPaise: equityTargetPaise, // 100% funded!
      rateBps: 0,
      tenures: [],
      status: Statuses.OFFER.ACTIVE,
      activationDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      maturityDate: null, // Perpetual equity
      sharePricePaise,
      faceValuePaise: rupeesToPaise(10),
      preMoneyValuationPaise: rupeesToPaise(90000000), // ₹9 Crore
      postMoneyValuationPaise: rupeesToPaise(100000000), // ₹10 Crore
      totalSharesOffered: 20000,
      equityOfferedPercentage: 10.0,
      equityInstrument: 'equity_shares',
      hasVotingRights: true
    });

    await OfferTerms.create({
      offerId: offer4._id,
      version: 1,
      body: 'Share Subscription Agreement (SSA) and Shareholders Agreement (SHA) terms for Apex CleanTech Series-A Equity Round at ₹500 per share.',
      acceptedByCompanyAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
    });

    console.log(`[Seeder] Created 4 Offers (including Type 3: Equity / Shareholder Investment).`);

    // 5. Create Confirmed & Active Investment
    const invAmountPaise = rupeesToPaise(500000); // ₹5,00,000
    const monthlyReturnPaise = calculateMonthlyReturnPaise(invAmountPaise, 300); // ₹15,000

    const investment1 = await Investment.create({
      offerId: offer1._id,
      investorId: invUser1._id,
      tenureMonths: 12,
      amountPaise: invAmountPaise,
      monthlyReturnPaise,
      termsVersion: 1,
      status: Statuses.INVESTMENT.ACTIVE,
      gatewayRef: 'PAY_GW_981726451',
      activationDate: offer1.activationDate,
      maturityDate: offer1.maturityDate
    });

    // Investment 2: Equity Shareholding Investment (Vikram Sharma holding 5,000 shares = 2.5%)
    const equityInvPaise = rupeesToPaise(2500000); // ₹25,00,000
    const sharesAllotted = Math.floor(equityInvPaise / sharePricePaise); // 5,000 shares

    const investment2 = await Investment.create({
      offerId: offer4._id,
      investorId: invUser1._id,
      tenureMonths: null,
      amountPaise: equityInvPaise,
      monthlyReturnPaise: 0,
      sharesAllotted,
      sharePricePaise,
      ownershipPercentage: 2.5, // 2.5% of post-money equity
      allotmentStatus: 'Allotted',
      certificateNo: 'CERT-APEX-EQ-2026-001',
      termsVersion: 1,
      status: Statuses.INVESTMENT.ACTIVE,
      gatewayRef: 'PAY_GW_EQUITY_884192',
      activationDate: offer4.activationDate,
      maturityDate: null
    });

    // Investment 3: Equity Shareholding Investment (Pooja Patel holding 10,000 shares = 5.0%)
    const poojaInvPaise = rupeesToPaise(5000000); // ₹50,00,000
    await Investment.create({
      offerId: offer4._id,
      investorId: invUser2._id,
      tenureMonths: null,
      amountPaise: poojaInvPaise,
      monthlyReturnPaise: 0,
      sharesAllotted: 10000,
      sharePricePaise,
      ownershipPercentage: 5.0, // 5.0% of post-money equity
      allotmentStatus: 'Allotted',
      certificateNo: 'CERT-APEX-EQ-2026-002',
      dematFolioNumber: 'IN300126-10492817',
      termsVersion: 1,
      status: Statuses.INVESTMENT.ACTIVE,
      gatewayRef: 'PAY_GW_EQUITY_991823',
      activationDate: offer4.activationDate,
      maturityDate: null
    });

    // Investment 4: Equity Shareholding Investment (Rahul Verma holding 2,000 shares = 1.0%)
    const rahulInvPaise = rupeesToPaise(1000000); // ₹10,00,000
    await Investment.create({
      offerId: offer4._id,
      investorId: invUser3._id,
      tenureMonths: null,
      amountPaise: rahulInvPaise,
      monthlyReturnPaise: 0,
      sharesAllotted: 2000,
      sharePricePaise,
      ownershipPercentage: 1.0, // 1.0% of post-money equity
      allotmentStatus: 'Pending',
      certificateNo: 'PENDING',
      termsVersion: 1,
      status: Statuses.INVESTMENT.ACTIVE,
      gatewayRef: 'PAY_GW_EQUITY_773612',
      activationDate: offer4.activationDate,
      maturityDate: null
    });

    // Seed sample declared Dividend for the equity offer
    await Dividend.create({
      companyId: company1._id,
      offerId: offer4._id,
      financialYear: 'FY 2026-27',
      recordDate: new Date(),
      dividendPerSharePaise: rupeesToPaise(25), // ₹25 per share
      totalPoolPaise: rupeesToPaise(500000), // ₹5,00,000 pool
      status: 'Declared',
      bankRef: 'HDFC-DIV-981726',
      notes: 'Interim dividend approved by Board of Directors from Q2 net profits.'
    });

    // 6. Create Repayment Due & Investor Payout Record
    const repayment1 = await Repayment.create({
      offerId: offer1._id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
      payoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      kind: 'return',
      expectedPaise: monthlyReturnPaise,
      status: Statuses.REPAYMENT.DUE
    });

    // Second Repayment: Overdue! (To test Overdue badge & default warning)
    await Repayment.create({
      offerId: offer1._id,
      dueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      payoutDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      kind: 'return',
      expectedPaise: rupeesToPaise(30000),
      status: Statuses.REPAYMENT.OVERDUE
    });

    // Payout record in READY status
    await Payout.create({
      investmentId: investment1._id,
      repaymentId: repayment1._id,
      investorId: invUser1._id,
      offerId: offer1._id,
      amountPaise: monthlyReturnPaise,
      status: Statuses.PAYOUT.READY // Ready to be batched
    });

    // 7. Seed Initial Immutable Ledger & Audit Log
    await Ledger.create({
      account: 'PLATFORM_ESCROW',
      debitPaise: 0,
      creditPaise: invAmountPaise,
      refType: 'INVESTMENT',
      refId: investment1._id,
      description: `Investment confirmed from Vikram Sharma for ${offer1.title}`
    });

    await AuditLog.create({
      actorId: adminUser._id,
      role: 'admin',
      action: 'SYSTEM_SEEDED',
      targetEntity: 'System',
      targetId: adminUser._id,
      after: { seeded: true, timestamp: new Date() },
      reason: 'Initial database bootstrap for development'
    });

    console.log('[Seeder] Initial ledger and audit logs created.');
    console.log('====================================================');
    console.log('  Database seeding completed successfully!');
    console.log(`  Admin credentials: admin@connectinvest.com / AdminPassword123!`);
    console.log('====================================================');

    if (isDirectRun) {
      await mongoose.disconnect();
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seeder] Error seeding database:', error);
    if (isDirectRun) process.exit(1);
    throw error;
  }
}

// Auto-run if executed directly via CLI
if (process.argv[1] && process.argv[1].endsWith('seed-db.js')) {
  seed(true);
}
