import { Company } from '../models/Company.js';
import { CompanyDocument } from '../models/CompanyDocument.js';
import { InvestmentRequest } from '../models/InvestmentRequest.js';
import { Investment } from '../models/Investment.js';
import { Transaction } from '../models/Transaction.js';
import { Shareholder } from '../models/Shareholder.js';
import { ShareAllocation } from '../models/ShareAllocation.js';
import { FinancialReport } from '../models/FinancialReport.js';
import { Dividend } from '../models/Dividend.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// 1. Company Profile Management
export const getCompanyProfile = asyncHandler(async (req, res) => {
  const documents = await CompanyDocument.find({ companyId: req.company._id });
  res.status(200).json({
    success: true,
    company: req.company,
    documents
  });
});

export const updateCompanyProfile = asyncHandler(async (req, res) => {
  const company = req.company;
  const updates = req.body;

  if (updates.registeredAddress) {
    company.registeredAddress = { ...company.registeredAddress, ...updates.registeredAddress };
    delete updates.registeredAddress;
  }
  Object.assign(company, updates);
  await company.save();

  await AuditLog.create({
    companyId: company._id,
    userId: req.user._id,
    userEmail: req.user.email,
    action: 'UPDATE_COMPANY_PROFILE',
    module: 'COMPANY'
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    company
  });
});

export const addDirector = asyncHandler(async (req, res) => {
  const { name, din, pan, email, mobile, designation, sharesOwnedPercentage } = req.body;
  if (!name || !email || !mobile) {
    throw new ApiError(400, 'Name, email, and mobile are required for director');
  }

  req.company.directors.push({
    name,
    din,
    pan,
    email,
    mobile,
    designation: designation || 'Director',
    sharesOwnedPercentage: Number(sharesOwnedPercentage) || 0
  });

  await req.company.save();

  res.status(200).json({
    success: true,
    message: 'Director added successfully',
    directors: req.company.directors
  });
});

export const removeDirector = asyncHandler(async (req, res) => {
  const idx = parseInt(req.params.directorIndex, 10);
  if (isNaN(idx) || idx < 0 || idx >= req.company.directors.length) {
    throw new ApiError(400, 'Invalid director index');
  }

  req.company.directors.splice(idx, 1);
  await req.company.save();

  res.status(200).json({
    success: true,
    message: 'Director removed',
    directors: req.company.directors
  });
});

export const submitVerification = asyncHandler(async (req, res) => {
  req.company.verificationStatus = 'In Review';
  req.company.verificationRemarks = 'Submitted for platform administrative verification.';
  await req.company.save();

  res.status(200).json({
    success: true,
    message: 'Verification request submitted successfully',
    company: req.company
  });
});

// 2. Company Dashboard Overview
export const getDashboardOverview = asyncHandler(async (req, res) => {
  const companyId = req.company._id;

  const requests = await InvestmentRequest.find({ companyId });
  const totalFundsRequested = requests.reduce((sum, r) => sum + (r.fundingTarget || 0), 0);
  const totalFundsRaised = requests.reduce((sum, r) => sum + (r.raisedAmount || 0), 0);
  const activeRequestsCount = requests.filter(
    (r) => r.status === 'Open for Investment' || r.status === 'Approved'
  ).length;

  const investments = await Investment.find({ companyId });
  const uniqueInvestors = new Set(investments.map((i) => i.investorEmail || i.investorName)).size;

  const shareholders = await Shareholder.find({ companyId });
  const pendingRequests = requests.filter(
    (r) => r.status === 'Submitted' || r.status === 'Under Review'
  ).length;

  const fundingProgress =
    totalFundsRequested > 0 ? Math.round((totalFundsRaised / totalFundsRequested) * 100) : 0;

  const fixedTermTotal = requests
    .filter((r) => r.investmentModel === 'Fixed-Term')
    .reduce((sum, r) => sum + r.raisedAmount, 0);

  const equityTotal = requests
    .filter((r) => r.investmentModel === 'Equity')
    .reduce((sum, r) => sum + r.raisedAmount, 0);

  const recentTransactions = await Transaction.find({ companyId })
    .sort({ createdAt: -1 })
    .limit(5);

  const recentInvestments = await Investment.find({ companyId })
    .sort({ createdAt: -1 })
    .limit(5);

  const latestNotifications = await Notification.find({ companyId })
    .sort({ createdAt: -1 })
    .limit(5);

  const pendingDocs = await CompanyDocument.find({
    companyId,
    status: { $in: ['Pending', 'Action Required'] }
  }).limit(5);

  const activityData = [
    { month: 'May', requested: 1500000, raised: 900000 },
    { month: 'Jun', requested: 2500000, raised: 1800000 },
    { month: 'Jul', requested: 2000000, raised: 1400000 },
    { month: 'Aug', requested: 3500000, raised: 2900000 },
    { month: 'Sep', requested: 4000000, raised: 3200000 },
    { month: 'Oct', requested: totalFundsRequested || 5000000, raised: totalFundsRaised || 3850000 }
  ];

  res.status(200).json({
    success: true,
    kpi: {
      totalFundsRequested,
      totalFundsRaised,
      activeRequestsCount,
      totalInvestors: uniqueInvestors,
      totalShareholders: shareholders.length,
      fundingProgress,
      availableFunds: totalFundsRaised,
      pendingApprovals: pendingRequests
    },
    charts: {
      fundingProgress,
      activityData,
      modelDistribution: [
        { name: 'Fixed-Term Investment', value: fixedTermTotal || 2400000, color: '#E11D5A' },
        { name: 'Equity Investment', value: equityTotal || 1450000, color: '#8B5CF6' }
      ]
    },
    recentInvestments,
    recentTransactions,
    latestNotifications,
    pendingDocs
  });
});

// 3. Investment Requests
export const getRequests = asyncHandler(async (req, res) => {
  const { status, model } = req.query;
  const filter = { companyId: req.company._id };

  if (status && status !== 'All') filter.status = status;
  if (model && model !== 'All') filter.investmentModel = model;

  const requests = await InvestmentRequest.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: requests.length,
    requests
  });
});

export const createRequest = asyncHandler(async (req, res) => {
  const { isDraft, ...payload } = req.body;
  const files = (req.files && Array.isArray(req.files)) ? req.files : [];

  const initialStatus = (isDraft === true || isDraft === 'true') ? 'Draft' : 'Submitted';

  const supportingDocuments = files.map(f => ({
    name: f.originalname,
    fileUrl: `/uploads/${f.filename}`
  }));

  if (payload.supportingDocuments && Array.isArray(payload.supportingDocuments)) {
    supportingDocuments.push(...payload.supportingDocuments);
  }

  // Parse numeric values if submitted as multipart form-data
  const fundingTarget = Number(payload.fundingTarget) || Number(payload.requiredAmount) || 0;
  const minInvestment = Number(payload.minInvestment) || Number(payload.minAmount) || 0;
  const maxInvestment = Number(payload.maxInvestment) || Number(payload.maxAmount) || fundingTarget;
  const expectedReturnRate = Number(payload.expectedReturnRate) || Number(payload.agreedReturnRate) || 0;
  const investmentPeriodYears = Number(payload.investmentPeriodYears) || (payload.fundingDuration === 'Long-Term' ? 5 : 2);
  const durationMonths = Number(payload.durationMonths) || (investmentPeriodYears * 12);

  const newRequest = await InvestmentRequest.create({
    ...payload,
    title: payload.title || payload.entityOrProjectName || 'Funding Request',
    shortDescription: payload.shortDescription || payload.fundingPurpose || 'Capital requirement proposal',
    detailedDescription: payload.detailedDescription || payload.fundingPurpose || 'Detailed investment proposal',
    useOfFunds: payload.useOfFunds || payload.fundingPurpose || 'Business growth and capital expansion',
    investmentPurpose: payload.investmentPurpose || 'Company Investment',
    fundingDuration: payload.fundingDuration || 'Short-Term',
    entityOrProjectName: payload.entityOrProjectName || payload.title,
    fundingTarget,
    minInvestment,
    maxInvestment,
    expectedReturnRate,
    agreedReturnRate: expectedReturnRate,
    investmentPeriodYears,
    durationMonths,
    supportingDocuments,
    companyId: req.company._id,
    status: initialStatus
  });

  await AuditLog.create({
    companyId: req.company._id,
    userId: req.user._id,
    userEmail: req.user.email,
    action: initialStatus === 'Draft' ? 'SAVE_DRAFT_REQUEST' : 'SUBMIT_INVESTMENT_REQUEST',
    module: 'INVESTMENT_REQUEST',
    details: { requestId: newRequest._id, status: initialStatus }
  });

  res.status(201).json({
    success: true,
    message: initialStatus === 'Draft' ? 'Funding request saved as Draft' : 'Funding request submitted successfully',
    request: newRequest
  });
});

export const getRequestById = asyncHandler(async (req, res) => {
  const request = await InvestmentRequest.findOne({
    _id: req.params.id,
    companyId: req.company._id
  });

  if (!request) throw new ApiError(404, 'Investment request not found');

  const investments = await Investment.find({ requestId: request._id });

  res.status(200).json({
    success: true,
    request,
    investments
  });
});

export const updateRequest = asyncHandler(async (req, res) => {
  const request = await InvestmentRequest.findOne({
    _id: req.params.id,
    companyId: req.company._id
  });

  if (!request) throw new ApiError(404, 'Investment request not found');

  // Allow editing if Draft, Submitted, or Under Review (or if rejected/changes requested)
  if (['Approved', 'Funded', 'Funding Completed'].includes(request.status)) {
    throw new ApiError(403, 'Approved or Funded requests cannot be modified.');
  }

  const files = (req.files && Array.isArray(req.files)) ? req.files : [];
  if (files.length > 0) {
    const uploadedDocs = files.map(f => ({
      name: f.originalname,
      fileUrl: `/uploads/${f.filename}`
    }));
    request.supportingDocuments.push(...uploadedDocs);
  }

  const { isDraft, ...updates } = req.body;
  if (isDraft !== undefined) {
    request.status = (isDraft === true || isDraft === 'true') ? 'Draft' : 'Submitted';
  }

  if (updates.fundingTarget) updates.fundingTarget = Number(updates.fundingTarget);
  if (updates.minInvestment) updates.minInvestment = Number(updates.minInvestment);
  if (updates.maxInvestment) updates.maxInvestment = Number(updates.maxInvestment);
  if (updates.expectedReturnRate) {
    updates.expectedReturnRate = Number(updates.expectedReturnRate);
    updates.agreedReturnRate = updates.expectedReturnRate;
  }
  if (updates.investmentPeriodYears) {
    updates.investmentPeriodYears = Number(updates.investmentPeriodYears);
    updates.durationMonths = updates.investmentPeriodYears * 12;
  }

  Object.assign(request, updates);
  await request.save();

  res.status(200).json({
    success: true,
    message: 'Investment request updated successfully',
    request
  });
});

export const getCompanyInvestments = asyncHandler(async (req, res) => {
  const { status, model } = req.query;
  const filter = { companyId: req.company._id };

  if (status && status !== 'All') filter.paymentStatus = status;
  if (model && model !== 'All') filter.investmentModel = model;

  const investments = await Investment.find(filter)
    .populate('requestId', 'title investmentModel fundingTarget raisedAmount')
    .sort({ createdAt: -1 });

  const totalCommitted = investments.reduce((sum, i) => sum + (i.amount || i.amountInvested || 0), 0);
  const totalReceived = investments
    .filter((i) => i.paymentStatus === 'Received' || i.paymentStatus === 'Settled' || i.status === 'Confirmed')
    .reduce((sum, i) => sum + (i.amount || i.amountInvested || 0), 0);

  res.status(200).json({
    success: true,
    totalCommitted,
    totalReceived,
    investments
  });
});

// 4. Shareholders & Cap Table
export const getShareholders = asyncHandler(async (req, res) => {
  const shareholders = await Shareholder.find({ companyId: req.company._id }).sort({
    ownershipPercentage: -1
  });

  const allocations = await ShareAllocation.find({ companyId: req.company._id })
    .populate('shareholderId', 'name email folioNumber')
    .sort({ resolutionDate: -1 });

  const totalSharesIssued = shareholders.reduce((acc, s) => acc + s.sharesHeld, 0);
  const totalEquityCapitalRaised = shareholders.reduce((acc, s) => acc + s.totalInvestedAmount, 0);

  const capTableData = shareholders.map((s) => ({
    name: s.name,
    shares: s.sharesHeld,
    percentage: s.ownershipPercentage,
    class: s.shareClass
  }));

  res.status(200).json({
    success: true,
    shareholders,
    allocations,
    metrics: {
      totalShareholders: shareholders.length,
      totalSharesIssued,
      totalEquityCapitalRaised
    },
    capTableData
  });
});

export const createShareAllocation = asyncHandler(async (req, res) => {
  const { shareholderId, allotmentRound, sharesCount, pricePerShare, resolutionNumber, resolutionDate } = req.body;

  if (!shareholderId || !sharesCount || !pricePerShare || !resolutionNumber) {
    throw new ApiError(400, 'Please provide all mandatory allotment details.');
  }

  const shareholder = await Shareholder.findOne({
    _id: shareholderId,
    companyId: req.company._id
  });

  if (!shareholder) throw new ApiError(404, 'Shareholder record not found.');

  const totalConsideration = Number(sharesCount) * Number(pricePerShare);

  const allocation = await ShareAllocation.create({
    companyId: req.company._id,
    shareholderId: shareholder._id,
    allotmentRound,
    sharesCount: Number(sharesCount),
    pricePerShare: Number(pricePerShare),
    totalConsideration,
    resolutionNumber,
    resolutionDate: resolutionDate || new Date(),
    status: 'Approved'
  });

  shareholder.sharesHeld += Number(sharesCount);
  shareholder.totalInvestedAmount += totalConsideration;
  shareholder.issuanceStatus = 'Issued';
  await shareholder.save();

  // Recalculate cap table percentages
  const allShareholders = await Shareholder.find({ companyId: req.company._id });
  const grandTotalShares = allShareholders.reduce((sum, s) => sum + s.sharesHeld, 0);

  if (grandTotalShares > 0) {
    for (const sh of allShareholders) {
      sh.ownershipPercentage = parseFloat(((sh.sharesHeld / grandTotalShares) * 100).toFixed(2));
      await sh.save();
    }
  }

  res.status(201).json({
    success: true,
    message: 'Official share allotment record added successfully.',
    allocation
  });
});

// 5. Financial Reports & Dividends
export const getFinancialReports = asyncHandler(async (req, res) => {
  const { year, periodType } = req.query;
  const filter = { companyId: req.company._id };

  if (year && year !== 'All') filter.financialYear = year;
  if (periodType && periodType !== 'All') filter.periodType = periodType;

  const reports = await FinancialReport.find(filter).sort({ createdAt: -1 });

  const totalRevenue = reports.reduce((acc, r) => acc + r.revenue, 0);
  const totalExpenses = reports.reduce((acc, r) => acc + r.operatingExpenses, 0);
  const netProfit = reports.reduce((acc, r) => acc + r.netProfitOrLoss, 0);
  const fundsRaised = reports.reduce((acc, r) => acc + (r.fundsRaisedInPeriod || 0), 0);

  const periodTrends = reports
    .map((r) => ({
      period: r.periodName,
      revenue: r.revenue,
      expenses: r.operatingExpenses,
      profit: r.netProfitOrLoss
    }))
    .reverse();

  res.status(200).json({
    success: true,
    metrics: { totalRevenue, totalExpenses, netProfit, fundsRaised },
    reports,
    periodTrends
  });
});

export const createFinancialReport = asyncHandler(async (req, res) => {
  const { financialYear, periodType, periodName, revenue, operatingExpenses, netProfitOrLoss, auditStatus, auditorName, notes } = req.body;
  const file = req.file;

  const calculatedProfit =
    netProfitOrLoss !== undefined ? Number(netProfitOrLoss) : Number(revenue) - Number(operatingExpenses);

  const report = await FinancialReport.create({
    companyId: req.company._id,
    financialYear,
    periodType,
    periodName,
    revenue: Number(revenue),
    operatingExpenses: Number(operatingExpenses),
    netProfitOrLoss: calculatedProfit,
    auditStatus: auditStatus || 'Company-Reported',
    auditorName,
    reportFileUrl: file ? `/uploads/${file.filename}` : undefined,
    notes
  });

  res.status(201).json({
    success: true,
    message: 'Financial report submitted successfully.',
    report
  });
});

export const getReturnsAndDividends = asyncHandler(async (req, res) => {
  const companyId = req.company._id;

  // 1. Fetch all investments for this company
  const investments = await Investment.find({ companyId })
    .populate('requestId', 'title investmentModel agreedReturnRate durationMonths maturityDate fundingTarget raisedAmount category');

  // Compute summary figures
  const totalReceived = investments
    .filter(inv => inv.paymentStatus === 'Received' || inv.status === 'Confirmed' || inv.paymentStatus === 'Committed')
    .reduce((sum, inv) => sum + (inv.amount || inv.amountInvested || 0), 0);

  // Fetch transactions of type Payout or Refund for total repaid
  const repayments = await Transaction.find({
    companyId,
    type: { $in: ['Payout', 'Refund'] },
    status: 'Confirmed'
  });
  const totalRepaid = repayments.reduce((sum, tx) => sum + tx.amount, 0);

  // Categorize investments into Company Investments and Project Investments
  const companyInvestments = [];
  const projectInvestments = [];

  let totalObligations = 0;

  investments.forEach((inv) => {
    const rate = inv.returnRate || inv.requestId?.agreedReturnRate || 14.5;
    const durationMonths = inv.tenureMonths || inv.requestId?.durationMonths || 12;
    const principal = inv.amount || inv.amountInvested || 0;
    const expectedReturn = inv.expectedReturns || Math.round(principal * (rate / 100) * (durationMonths / 12));
    const returnsReceived = inv.returnsReceived || 0;
    const pendingRepayment = Math.max(0, principal + expectedReturn - returnsReceived);
    totalObligations += pendingRepayment;

    const record = {
      _id: inv._id,
      investorName: inv.investorName || 'Institutional Investor',
      title: inv.requestId?.title || 'Connect Invest Note',
      type: (inv.requestId?.category === 'Project' || inv.investmentModel === 'Project') ? 'Project Investment' : 'Company Investment',
      investmentModel: inv.investmentModel || 'Fixed-Term',
      principalAmount: principal,
      returnRate: rate,
      durationMonths,
      expectedReturn,
      totalDue: principal + expectedReturn,
      repaidAmount: returnsReceived,
      pendingRepayment,
      nextRepaymentDate: inv.maturityDate || inv.requestId?.maturityDate || new Date(Date.now() + 30 * 86400000),
      maturityDate: inv.maturityDate || inv.requestId?.maturityDate || new Date(Date.now() + 365 * 86400000),
      status: inv.status || 'Confirmed'
    };

    if (record.type === 'Project Investment') {
      projectInvestments.push(record);
    } else {
      companyInvestments.push(record);
    }
  });

  const pendingRepayments = Math.max(0, totalObligations - totalRepaid);

  // Upcoming repayment dates
  const upcomingRepayments = investments
    .map(inv => ({
      _id: inv._id,
      title: inv.requestId?.title || 'Contractual Note Servicing',
      amount: Math.round(((inv.amount || inv.amountInvested || 0) * (inv.returnRate || 12) / 100) / 12),
      dueDate: inv.maturityDate || new Date(Date.now() + 30 * 86400000),
      status: 'Upcoming Scheduled'
    }))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const dividends = await Dividend.find({ companyId }).sort({ declarationDate: -1 });

  res.status(200).json({
    success: true,
    summary: {
      totalReceived,
      totalRepaid,
      pendingRepayments,
      totalActiveDeals: investments.length,
      averageReturnRate: investments.length > 0
        ? parseFloat((investments.reduce((sum, i) => sum + (i.returnRate || 14), 0) / investments.length).toFixed(1))
        : 14.5
    },
    companyInvestments,
    projectInvestments,
    allInvestments: [...companyInvestments, ...projectInvestments],
    upcomingRepayments,
    repaymentHistory: repayments,
    dividends
  });
});

export const declareDividend = asyncHandler(async (req, res) => {
  const { declarationDate, recordDate, payoutDate, financialYear, dividendType, amountPerShare, boardResolutionRef, notes } = req.body;

  const shareholders = await Shareholder.find({ companyId: req.company._id });
  const totalEligibleShares = shareholders.reduce((sum, s) => sum + s.sharesHeld, 0);

  if (totalEligibleShares === 0) {
    throw new ApiError(400, 'No eligible shares found to declare dividends.');
  }

  const totalDividendAmount = Math.round(totalEligibleShares * Number(amountPerShare));

  const dividend = await Dividend.create({
    companyId: req.company._id,
    declarationDate: new Date(declarationDate),
    recordDate: new Date(recordDate),
    payoutDate: payoutDate ? new Date(payoutDate) : undefined,
    financialYear,
    dividendType: dividendType || 'Interim',
    amountPerShare: Number(amountPerShare),
    totalDividendAmount,
    eligibleShareholdersCount: shareholders.length,
    boardResolutionRef,
    approvalStatus: 'Board Approved',
    disbursementStatus: 'Pending',
    notes
  });

  res.status(201).json({
    success: true,
    message: 'Dividend officially declared under board resolution.',
    dividend
  });
});

// 6. Transactions, Documents & Notifications
export const getCompanyTransactions = asyncHandler(async (req, res) => {
  const { search, status, type, model, page = '1', limit = '10' } = req.query;
  const filter = { companyId: req.company._id };

  if (status && status !== 'All') filter.status = status;
  if (type && type !== 'All') filter.type = type;
  if (model && model !== 'All') filter.investmentModel = model;

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { referenceId: searchRegex },
      { title: searchRegex },
      { paymentMethod: searchRegex }
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await Transaction.countDocuments(filter);
  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // Compute metrics for transactions
  const allCompanyTxs = await Transaction.find({ companyId: req.company._id });
  const totalFundingReceived = allCompanyTxs
    .filter(t => (t.type === 'Investment' || t.type === 'Deposit') && t.status === 'Confirmed')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalRepayments = allCompanyTxs
    .filter(t => (t.type === 'Payout' || t.type === 'Refund') && t.status === 'Confirmed')
    .reduce((sum, t) => sum + t.amount, 0);

  res.status(200).json({
    success: true,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    metrics: {
      totalFundingReceived,
      totalRepayments,
      totalTransactionsCount: allCompanyTxs.length
    },
    transactions
  });
});

export const getCompanyDocuments = asyncHandler(async (req, res) => {
  const documents = await CompanyDocument.find({ companyId: req.company._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, documents });
});

export const uploadCompanyDocument = asyncHandler(async (req, res) => {
  const { documentType, title } = req.body;
  const file = req.file;

  if (!file) throw new ApiError(400, 'Please select a file to upload');

  const doc = await CompanyDocument.create({
    companyId: req.company._id,
    documentType: documentType || 'Other',
    title: title || file.originalname,
    fileUrl: `/uploads/${file.filename}`,
    fileSize: file.size,
    mimeType: file.mimetype,
    status: 'Pending',
    uploadedBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Document uploaded successfully',
    document: doc
  });
});

export const deleteCompanyDocument = asyncHandler(async (req, res) => {
  const doc = await CompanyDocument.findOne({
    _id: req.params.id,
    companyId: req.company._id
  });

  if (!doc) throw new ApiError(404, 'Document not found');
  await doc.deleteOne();

  res.status(200).json({ success: true, message: 'Document deleted successfully' });
});

export const getCompanyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ companyId: req.company._id }).sort({ createdAt: -1 });
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  res.status(200).json({ success: true, unreadCount, notifications });
});

export const markCompanyNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (id === 'all') {
    await Notification.updateMany({ companyId: req.company._id, isRead: false }, { isRead: true });
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  }

  const notif = await Notification.findOne({ _id: id, companyId: req.company._id });
  if (!notif) throw new ApiError(404, 'Notification not found');

  notif.isRead = true;
  await notif.save();

  res.status(200).json({ success: true, notification: notif });
});

