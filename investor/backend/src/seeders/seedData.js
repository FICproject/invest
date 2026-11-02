import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';
import { InvestorProfile } from '../models/InvestorProfile.js';
import { InvestmentOffer } from '../models/InvestmentOffer.js';
import { Investment } from '../models/Investment.js';
import { Transaction } from '../models/Transaction.js';
import { KYC } from '../models/KYC.js';
import { Payout } from '../models/Payout.js';
import { Notification } from '../models/Notification.js';
import { Company } from '../models/Company.js';
import { InvestmentRequest } from '../models/InvestmentRequest.js';
import { Shareholder } from '../models/Shareholder.js';
import { FinancialReport } from '../models/FinancialReport.js';

const seedDatabase = async () => {
  try {
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('[Seed] Connected to MongoDB. Clearing existing collections...');

    await User.deleteMany({});
    await InvestorProfile.deleteMany({});
    await InvestmentOffer.deleteMany({});
    await Investment.deleteMany({});
    await Transaction.deleteMany({});
    await KYC.deleteMany({});
    await Payout.deleteMany({});
    await Notification.deleteMany({});

    console.log('[Seed] Seeding Investment Offers...');

    // 1. Seed Investment Offers
    const offers = await InvestmentOffer.create([
      {
        title: 'GreenTech Solar & Wind Energy Expansion',
        companyName: 'GreenTech Solutions Pvt. Ltd.',
        type: 'Company',
        category: 'Renewable Energy',
        description: 'Discover renewable energy company focused on solar and wind investment solutions.',
        targetAmount: 140000000,
        raisedAmount: 84000000, // 60%
        minInvestment: 1000,
        maxInvestment: 10000000,
        returnRate: 3,
        tenureMonths: 60,
        payoutFrequency: 'Monthly',
        riskLevel: 'Low',
        status: 'Active',
        isFeatured: true,
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
        location: 'Bengaluru, Karnataka',
        securityType: 'Senior Secured Debenture',
        financialHighlights: [
          'Audited revenue of ₹42 Cr in FY25',
          '25-year sovereign power purchase agreement (PPA)',
          'Crisil A+ investment grade credit rating',
          'Asset backed by 1.25x collateral security'
        ]
      },
      {
        title: 'Skyline Premium Urban Residential Corridor',
        companyName: 'Skyline Residential Project',
        type: 'Project',
        category: 'Real Estate',
        description: 'Premium residential project in prime metropolitan real estate corridor.',
        targetAmount: 140000000,
        raisedAmount: 112000000, // 80%
        minInvestment: 1000,
        maxInvestment: 10000000,
        returnRate: 3,
        tenureMonths: 36,
        payoutFrequency: 'Monthly',
        riskLevel: 'Moderate',
        status: 'Active',
        isFeatured: true,
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        location: 'Mumbai, Maharashtra',
        securityType: 'First Charge Mortgage on Land & Construction',
        financialHighlights: [
          'RERA registered: P51800045231',
          'Pre-booked sales account for 65% of units',
          'Reputed Tier-1 EPC contractor executing civil works',
          'Dedicated RERA designated escrow account'
        ]
      },
      {
        title: 'Solar Power Plant 50MW Grid Feed',
        companyName: 'Solar Power Plant',
        type: 'Project',
        category: 'Renewable Energy',
        description: 'Clean energy for a better tomorrow. Scale solar power investment project.',
        targetAmount: 140000000,
        raisedAmount: 84000000, // 60%
        minInvestment: 1000,
        maxInvestment: 10000000,
        returnRate: 3,
        tenureMonths: 24,
        payoutFrequency: 'Monthly',
        riskLevel: 'Low',
        status: 'Active',
        isFeatured: true,
        imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
        location: 'Bikaner, Rajasthan',
        securityType: 'Solar Plant Equipment & Receivables Hypothecation',
        financialHighlights: [
          'Operational grid connectivity clearance received',
          'Fixed feed-in tariff of ₹3.15 per unit',
          'Comprehensive 10-year OEM maintenance warranty',
          'Clean energy carbon credits generation'
        ]
      },
      {
        title: 'AgriFresh Cold Chain & Organic Logistics',
        companyName: 'AgriFresh Foods Pvt. Ltd.',
        type: 'Company',
        category: 'Food & Agriculture',
        description: 'Organic food production and supply chain optimization.',
        targetAmount: 84000000,
        raisedAmount: 44000000, // 52.38% (approx 55%)
        minInvestment: 1000,
        maxInvestment: 10000000,
        returnRate: 3,
        tenureMonths: 60,
        payoutFrequency: 'Monthly',
        riskLevel: 'Moderate',
        status: 'Active',
        isFeatured: true,
        imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
        location: 'Karnataka',
        securityType: 'Charge on Cold Storage Real Estate & Fleet',
        financialHighlights: [
          'Over 120 farm clusters directly connected',
          'Supply contracts with top tier supermarket chains',
          '34% YoY operating margin expansion',
          'APEDA and FSSAI certified facilities'
        ]
      },
      {
        title: 'Nexus Advanced Healthcare Diagnostics',
        companyName: 'Nexus Diagnostics Ltd.',
        type: 'Company',
        category: 'Healthcare',
        description: 'Expanding automated pathology and radiology testing centers across 15 high-growth tier-2 urban clusters.',
        targetAmount: 80000000,
        raisedAmount: 36000000,
        minInvestment: 1000,
        maxInvestment: 10000000,
        returnRate: 3,
        tenureMonths: 20,
        payoutFrequency: 'Monthly',
        riskLevel: 'Low',
        status: 'Active',
        isFeatured: false,
        imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
        location: 'Hyderabad, Telangana',
        securityType: 'Medical Equipment Leasing Lien',
        financialHighlights: [
          'NABL and CAP accredited central laboratory',
          'Gross margins exceeding 52%',
          'Zero debt on existing laboratory assets'
        ]
      },
      {
        title: 'CyberCloud Enterprise Edge Hub',
        companyName: 'CyberCloud Infra Project',
        type: 'Project',
        category: 'Technology',
        description: 'Sustainable, green-powered tier-3 edge data center campus serving financial and fintech cloud infrastructures.',
        targetAmount: 200000000,
        raisedAmount: 150000000,
        minInvestment: 1000,
        maxInvestment: 10000000,
        returnRate: 3,
        tenureMonths: 36,
        payoutFrequency: 'Monthly',
        riskLevel: 'Moderate',
        status: 'Active',
        isFeatured: false,
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
        location: 'Noida, NCR',
        securityType: 'Charge on Server Hardware & Facility Leasehold',
        financialHighlights: [
          'PUE of 1.25 powered by dedicated rooftop solar',
          'Anchor lease signed with 3 enterprise customers',
          'Tier-III Uptime Institute design certification'
        ]
      }
    ]);

    console.log('[Seed] Seeding Default Verified Investor Account...');

    // 2. Create Seed User matching mockup: Rahul Sharma
    const user = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul.sharma@investor.com',
      mobile: '9876543210',
      password: 'Password@123',
      role: 'investor',
      isVerified: true
    });

    // 3. Create Investor Profile with Bank Details
    await InvestorProfile.create({
      userId: user._id,
      panNumber: 'ABCDE1234F',
      dateOfBirth: new Date('1988-06-15'),
      address: {
        street: '402, Lotus Greens, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038'
      },
      bankDetails: {
        bankName: 'HDFC Bank Ltd.',
        accountNumber: '50100482934210',
        ifscCode: 'HDFC0001234',
        accountHolderName: 'Rahul Sharma',
        isVerified: true
      },
      notificationPreferences: {
        emailAlerts: true,
        smsAlerts: true,
        payoutNotifications: true
      }
    });

    // 4. Create KYC record (Approved)
    await KYC.create({
      investorId: user._id,
      fullName: 'Rahul Sharma',
      panNumber: 'ABCDE1234F',
      panDocumentUrl: '/uploads/sample_pan.png',
      addressProofType: 'Aadhaar Card',
      addressProofNumber: 'XXXX-XXXX-8921',
      addressProofUrl: '/uploads/sample_aadhaar.png',
      selfieUrl: '/uploads/sample_selfie.png',
      bankProofUrl: '/uploads/sample_cheque.png',
      bankName: 'HDFC Bank Ltd.',
      accountNumber: '50100482934210',
      ifscCode: 'HDFC0001234',
      status: 'APPROVED',
      submittedAt: new Date('2026-01-10'),
      reviewedAt: new Date('2026-01-11')
    });

    console.log('[Seed] Seeding Investments matching dashboard ₹ 2,50,000 total...');

    // 5. Seed Investments matching ₹ 2,50,000 and 2 active investments:
    const inv1 = await Investment.create({
      investorId: user._id,
      offerId: offers[0]._id, // GreenTech Solutions (Renewable Energy)
      amountInvested: 150000,
      returnRate: 10,
      tenureMonths: 24,
      expectedReturns: 156000,
      returnsReceived: 1000,
      startDate: new Date('2026-01-15'),
      maturityDate: new Date('2028-01-15'),
      status: 'Confirmed',
      certificateNumber: 'CI-CERT-884920'
    });

    const inv2 = await Investment.create({
      investorId: user._id,
      offerId: offers[1]._id, // Skyline Residential (Real Estate)
      amountInvested: 100000,
      returnRate: 12,
      tenureMonths: 36,
      expectedReturns: 105000,
      returnsReceived: 1000,
      startDate: new Date('2026-02-01'),
      maturityDate: new Date('2029-02-01'),
      status: 'Confirmed',
      certificateNumber: 'CI-CERT-773819'
    });

    // 1 pending investment
    await Investment.create({
      investorId: user._id,
      offerId: offers[3]._id, // AgriFresh
      amountInvested: 23500,
      returnRate: 11,
      tenureMonths: 24,
      expectedReturns: 28670,
      returnsReceived: 0,
      startDate: new Date('2026-02-28'),
      maturityDate: new Date('2028-02-28'),
      status: 'Pending',
      certificateNumber: 'CI-CERT-551029'
    });

    // 2 completed historical investments
    await Investment.create({
      investorId: user._id,
      offerId: offers[2]._id, // Solar Power Plant
      amountInvested: 50000,
      returnRate: 11,
      tenureMonths: 12,
      expectedReturns: 55500,
      returnsReceived: 55500,
      startDate: new Date('2025-01-01'),
      maturityDate: new Date('2026-01-01'),
      status: 'Completed',
      certificateNumber: 'CI-CERT-440192'
    });

    await Investment.create({
      investorId: user._id,
      offerId: offers[4]._id, // Nexus Healthcare
      amountInvested: 30000,
      returnRate: 11.5,
      tenureMonths: 12,
      expectedReturns: 33450,
      returnsReceived: 33450,
      startDate: new Date('2025-02-01'),
      maturityDate: new Date('2026-02-01'),
      status: 'Completed',
      certificateNumber: 'CI-CERT-330184'
    });

    console.log('[Seed] Seeding Payouts and Transactions...');

    // 6. Seed Payout records
    // Completed Payout 1
    await Payout.create({
      investorId: user._id,
      investmentId: inv1._id,
      offerTitle: 'GreenTech Solutions Pvt. Ltd.',
      amount: 1000,
      payoutType: 'Monthly Interest',
      scheduledDate: new Date('2026-02-15'),
      paidDate: new Date('2026-02-15'),
      status: 'Completed',
      utrNumber: 'CMS89237418293',
      bankAccountEnding: '4210'
    });

    // Completed Payout 2
    await Payout.create({
      investorId: user._id,
      investmentId: inv2._id,
      offerTitle: 'Skyline Residential Project',
      amount: 1000,
      payoutType: 'Monthly Interest',
      scheduledDate: new Date('2026-03-01'),
      paidDate: new Date('2026-03-01'),
      status: 'Completed',
      utrNumber: 'CMS90124819284',
      bankAccountEnding: '4210'
    });

    // Scheduled Upcoming Payout (matches next payout 15 Apr 2026)
    await Payout.create({
      investorId: user._id,
      investmentId: inv1._id,
      offerTitle: 'GreenTech Solutions Pvt. Ltd.',
      amount: 1000,
      payoutType: 'Monthly Interest',
      scheduledDate: new Date('2026-04-15'),
      status: 'Scheduled',
      bankAccountEnding: '4210'
    });

    await Payout.create({
      investorId: user._id,
      investmentId: inv2._id,
      offerTitle: 'Skyline Residential Project',
      amount: 1000,
      payoutType: 'Monthly Interest',
      scheduledDate: new Date('2026-05-01'),
      status: 'Scheduled',
      bankAccountEnding: '4210'
    });

    // 7. Seed Transactions matching screenshot
    await Transaction.create([
      {
        investorId: user._id,
        investmentId: inv1._id,
        title: 'Investment - GreenTech Solutions',
        type: 'Investment',
        amount: 15000,
        status: 'Confirmed',
        referenceId: 'TXN_20260319_01',
        paymentMethod: 'Net Banking',
        createdAt: new Date('2026-03-19T10:30:00')
      },
      {
        investorId: user._id,
        investmentId: inv1._id,
        title: 'Monthly Return Received',
        type: 'Payout',
        amount: 2500,
        status: 'Confirmed',
        referenceId: 'RET_20260325_02',
        paymentMethod: 'Bank Transfer',
        createdAt: new Date('2026-03-25T14:15:00')
      },
      {
        investorId: user._id,
        investmentId: inv2._id,
        title: 'Investment - Skyline Residential',
        type: 'Investment',
        amount: 23500,
        status: 'Pending',
        referenceId: 'TXN_20260228_03',
        paymentMethod: 'UPI',
        createdAt: new Date('2026-02-28T16:45:00')
      },
      {
        investorId: user._id,
        title: 'Monthly Return - Solar Project',
        type: 'Payout',
        amount: 1000,
        status: 'Confirmed',
        referenceId: 'RET_20260215_04',
        paymentMethod: 'Bank Transfer',
        createdAt: new Date('2026-02-15T09:20:00')
      },
      {
        investorId: user._id,
        title: 'Payment Failed - Debit Card Decline',
        type: 'Investment',
        amount: 10000,
        status: 'Failed',
        referenceId: 'TXN_20260110_05',
        paymentMethod: 'Debit/Credit Card',
        createdAt: new Date('2026-01-10T11:05:00')
      }
    ]);

    // 8. Seed Notifications matching screenshot
    await Notification.create([
      {
        investorId: user._id,
        title: 'Payout Dispatched',
        message: 'Your monthly return of ₹2,500 has been credited to your HDFC Bank account.',
        type: 'payout',
        isRead: false,
        link: '/investor/returns-payouts',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        investorId: user._id,
        title: 'KYC Verified Successfully',
        message: 'Your account has been fully verified. You can now invest in all opportunities.',
        type: 'kyc',
        isRead: false,
        link: '/investor/kyc',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        investorId: user._id,
        title: 'New Investment Offer: CyberCloud',
        message: 'A new tech infrastructure offer has opened with 13% annual yield.',
        type: 'investment',
        isRead: true,
        link: '/opportunities',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 days ago
      }
    ]);

    // 9. Seed Default Company Account matching Login: contact@nexustech.in / Password123!
    const companyUser = await User.create({
      name: 'Dr. Vikram Malhotra',
      email: 'contact@nexustech.in',
      mobile: '9876543211',
      password: 'Password123!',
      role: 'company_admin',
      isVerified: true
    });

    const company = await Company.create({
      userId: companyUser._id,
      legalName: 'Nexus Tech Innovations Pvt Ltd',
      tradingName: 'NexusTech',
      cin: 'U72200MH2021PTC368910',
      pan: 'AABCN1234F',
      gstin: '27AABCN1234F1Z5',
      incorporationDate: new Date('2021-04-15'),
      companyType: 'Private Limited',
      industry: 'Information Technology',
      sector: 'Enterprise Software & Cloud Platforms',
      description: 'Pioneering enterprise AI software and next-generation cloud infrastructure platforms.',
      website: 'https://nexustech.in',
      verificationStatus: 'Verified',
      registeredAddress: {
        street: 'Floor 12, Nexus Heights, BKC',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400051',
        country: 'India'
      },
      authorizedCapital: 50000000,
      paidUpCapital: 25000000,
      totalShares: 2500000,
      shareFaceValue: 10,
      directors: [
        {
          name: 'Dr. Vikram Malhotra',
          din: '08765432',
          email: 'contact@nexustech.in',
          mobile: '9876543210',
          sharesOwnedPercentage: 45
        }
      ]
    });

    companyUser.companyId = company._id;
    await companyUser.save();

    await InvestmentRequest.create([
      {
        companyId: company._id,
        title: 'Series-A Platform Scale-up',
        investmentModel: 'Equity',
        fundingTarget: 25000000,
        raisedAmount: 18500000,
        minInvestment: 50000,
        shortDescription: 'Accelerating enterprise cloud deployment across Asian regions.',
        detailedDescription: 'Full architectural scaling for distributed cloud infra and high-throughput real-time APIs.',
        useOfFunds: 'Cloud infra expansion (40%), Engineering team growth (35%), Global marketing (25%)',
        status: 'Open for Investment',
        tenureMonths: 36,
        returnRate: 15.5
      },
      {
        companyId: company._id,
        title: 'Fixed-Term R&D Expansion',
        investmentModel: 'Fixed-Term',
        fundingTarget: 15000000,
        raisedAmount: 15000000,
        minInvestment: 25000,
        shortDescription: 'Next-gen distributed infrastructure core framework.',
        detailedDescription: 'R&D initiative focusing on high security and automated compliance tooling for enterprises.',
        useOfFunds: 'R&D laboratory (50%), Security certifications (30%), Patents and compliance (20%)',
        status: 'Approved',
        tenureMonths: 24,
        returnRate: 12.0
      }
    ]);

    await Shareholder.create([
      {
        companyId: company._id,
        name: 'Dr. Vikram Malhotra',
        email: 'contact@nexustech.in',
        panOrId: 'AABCN1234F',
        folioNumber: 'FN-1001',
        sharesHeld: 1125000,
        shareType: 'Equity',
        sharePercentage: 45
      },
      {
        companyId: company._id,
        name: 'Rahul Sharma',
        email: 'rahul.sharma@investor.com',
        panOrId: 'ABCDE1234F',
        folioNumber: 'FN-1002',
        sharesHeld: 125000,
        shareType: 'Equity',
        sharePercentage: 5
      }
    ]);

    console.log('[Seed] Database seeding completed successfully!');
    console.log('[Seed] Test Investor: rahul.sharma@investor.com / Password@123');
    console.log('[Seed] Test Company: contact@nexustech.in / Password123!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
