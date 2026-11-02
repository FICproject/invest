import { Investment } from '../models/Investment.js';
import { InvestmentOffer } from '../models/InvestmentOffer.js';
import { Transaction } from '../models/Transaction.js';
import { Payout } from '../models/Payout.js';
import { InvestorProfile } from '../models/InvestorProfile.js';
import { Notification } from '../models/Notification.js';
import { KYC } from '../models/KYC.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @route   GET /api/investor/dashboard
// @desc    Get aggregated dashboard summary figures, portfolio allocation, and charts
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const investorId = req.user._id;

  // 1. Fetch all investments for this investor
  const investments = await Investment.find({ investorId }).populate('offerId');

  let totalInvested = 0;
  let activeInvestmentsCount = 0;
  let expectedReturnsTotal = 0;
  let returnsReceivedTotal = 0;
  let confirmedCount = 0;
  let pendingCount = 0;
  let completedCount = 0;

  const sectorMap = {};

  investments.forEach((inv) => {
    if (inv.status === 'Confirmed') {
      totalInvested += inv.amountInvested;
      activeInvestmentsCount += 1;
      confirmedCount += 1;
      // Calculate interest portion: (expectedReturns - amountInvested)
      const interestEarned = Math.max(0, (inv.expectedReturns || inv.amountInvested) - inv.amountInvested);
      expectedReturnsTotal += interestEarned;
      returnsReceivedTotal += inv.returnsReceived || 0;
    } else if (inv.status === 'Pending') {
      pendingCount += 1;
    } else if (inv.status === 'Completed') {
      completedCount += 1;
    }

    // Sector breakdown for portfolio
    if (inv.offerId && inv.offerId.category && inv.status === 'Confirmed') {
      const cat = inv.offerId.category;
      sectorMap[cat] = (sectorMap[cat] || 0) + inv.amountInvested;
    }
  });

  // Calculate sector percentages
  const portfolioOverview = Object.keys(sectorMap).map((category) => {
    const amount = sectorMap[category];
    const percentage = totalInvested > 0 ? Math.round((amount / totalInvested) * 100) : 0;
    return {
      category,
      amount,
      percentage
    };
  });

  // Fallback if user is new and has no investments yet
  if (portfolioOverview.length === 0) {
    portfolioOverview.push(
      { category: 'Renewable Energy', amount: 0, percentage: 40 },
      { category: 'Real Estate', amount: 0, percentage: 25 },
      { category: 'Technology', amount: 0, percentage: 20 },
      { category: 'Others', amount: 0, percentage: 15 }
    );
  }

  // 2. Fetch upcoming payout
  const nextPayout = await Payout.findOne({
    investorId,
    status: 'Scheduled'
  }).sort({ scheduledDate: 1 });

  // 3. Fetch completed payouts total
  const completedPayouts = await Payout.find({
    investorId,
    status: 'Completed'
  });
  const totalPayoutsSum = completedPayouts.reduce((acc, p) => acc + p.amount, 0);

  // Returns received for active investments
  const actualReturnsReceived = returnsReceivedTotal > 0 ? returnsReceivedTotal : totalPayoutsSum;
  const pendingReturns = Math.max(0, expectedReturnsTotal - actualReturnsReceived);

  // 4. Fetch recent transactions
  const recentTransactions = await Transaction.find({ investorId })
    .sort({ createdAt: -1 })
    .limit(6);

  // 5. Fetch recent investment activity
  const recentActivity = investments.slice(0, 5).map((inv) => ({
    id: inv._id,
    title: inv.offerId ? inv.offerId.companyName || inv.offerId.title : 'Investment',
    amount: inv.amountInvested,
    date: inv.startDate,
    status: inv.status
  }));

  // 6. Monthly returns progression (last 6 months)
  const monthlyReturns = [
    { month: 'Oct', amount: Math.round(actualReturnsReceived * 0.15) },
    { month: 'Nov', amount: Math.round(actualReturnsReceived * 0.25) },
    { month: 'Dec', amount: Math.round(actualReturnsReceived * 0.45) },
    { month: 'Jan', amount: Math.round(actualReturnsReceived * 0.65) },
    { month: 'Feb', amount: Math.round(actualReturnsReceived * 0.85) },
    { month: 'Mar', amount: actualReturnsReceived }
  ];

  // 7. KYC status
  const kyc = await KYC.findOne({ investorId });

  res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalInvested,
        totalReturnsEarned: actualReturnsReceived,
        pendingReturns,
        activeInvestments: activeInvestmentsCount,
        nextPayoutDate: nextPayout ? nextPayout.scheduledDate : null
      },
      portfolioOverview,
      monthlyReturns,
      investmentStatus: {
        confirmed: confirmedCount,
        pending: pendingCount,
        completed: completedCount,
        total: investments.length
      },
      recentActivity,
      recentTransactions,
      kycStatus: kyc ? kyc.status : 'NOT_STARTED'
    }
  });
});

// @route   GET /api/investor/my-investments
// @desc    Get detailed list of investments belonging to logged-in investor
export const getMyInvestments = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const query = { investorId: req.user._id };

  if (status && status !== 'All') {
    query.status = status;
  }

  let investments = await Investment.find(query)
    .populate('offerId')
    .sort({ createdAt: -1 });

  if (search && search.trim()) {
    const s = search.toLowerCase();
    investments = investments.filter(
      (inv) =>
        (inv.offerId && inv.offerId.title.toLowerCase().includes(s)) ||
        (inv.offerId && inv.offerId.companyName.toLowerCase().includes(s)) ||
        (inv.certificateNumber && inv.certificateNumber.toLowerCase().includes(s))
    );
  }

  res.status(200).json({
    success: true,
    count: investments.length,
    data: investments
  });
});

// @route   GET /api/investor/profile
// @desc    Get investor personal and contact profile
export const getProfile = asyncHandler(async (req, res) => {
  const profile = await InvestorProfile.findOne({ userId: req.user._id });
  const kyc = await KYC.findOne({ investorId: req.user._id });

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        mobile: req.user.mobile,
        createdAt: req.user.createdAt
      },
      profile,
      kyc
    }
  });
});

// @route   PUT /api/investor/profile
// @desc    Update permitted profile fields
export const updateProfile = asyncHandler(async (req, res) => {
  const { address, notificationPreferences } = req.body;

  let profile = await InvestorProfile.findOne({ userId: req.user._id });
  if (!profile) {
    profile = new InvestorProfile({ userId: req.user._id });
  }

  if (address) {
    profile.address = { ...profile.address, ...address };
  }

  if (notificationPreferences) {
    profile.notificationPreferences = {
      ...profile.notificationPreferences,
      ...notificationPreferences
    };
  }

  await profile.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    data: profile
  });
});

// @route   PUT /api/investor/bank-details
// @desc    Update investor payout bank details
export const updateBankDetails = asyncHandler(async (req, res) => {
  const { bankName, accountNumber, ifscCode, accountHolderName } = req.body;

  if (!bankName || !accountNumber || !ifscCode || !accountHolderName) {
    throw new ApiError(400, 'Please provide complete bank details: Bank Name, Account Number, IFSC, and Account Holder Name.');
  }

  let profile = await InvestorProfile.findOne({ userId: req.user._id });
  if (!profile) {
    profile = new InvestorProfile({ userId: req.user._id });
  }

  profile.bankDetails = {
    bankName,
    accountNumber,
    ifscCode: ifscCode.toUpperCase(),
    accountHolderName,
    isVerified: true
  };

  await profile.save();

  res.status(200).json({
    success: true,
    message: 'Bank account details saved successfully for payout distributions.',
    data: profile.bankDetails
  });
});

// @route   GET /api/investor/notifications
// @desc    Get in-app notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ investorId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);

  const unreadCount = await Notification.countDocuments({
    investorId: req.user._id,
    isRead: false
  });

  res.status(200).json({
    success: true,
    unreadCount,
    data: notifications
  });
});

// @route   PUT /api/investor/notifications/:id/read
// @desc    Mark a notification as read
export const markNotificationRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, investorId: req.user._id },
    { isRead: true }
  );

  res.status(200).json({
    success: true,
    message: 'Notification marked as read.'
  });
});
