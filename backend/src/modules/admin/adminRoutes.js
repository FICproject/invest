import express from 'express';
import {
  getDashboardStats,
  getWorkList,
  getInvestors,
  getInvestorInvestments,
  getAllInvestments,
  decideKyc,
  setUserBlockStatus,
  suspendInvestorFunding,
  suspendInvestorAccount,
  getCompanies,
  createCompany,
  suspendCompanyFunding,
  suspendCompanyAccount,
  decideKyb,
  deleteCompany,
  getOffers,
  getOfferInvestments,
  createOffer,
  setOfferTerms,
  publishOffer,
  activateOffer,
  toggleOfferHold,
  deleteOffer,
  getReleases,
  approveRelease,
  getRepayments,
  getAdminReturnAgreements,
  confirmRepaymentReceipt,
  markDefault,
  getPayouts,
  verifyPayout,
  verifyAllPayouts,
  getBatches,
  createPayoutBatch,
  approveAndSendBatch,
  retryPayout,
  togglePayoutHold,
  triggerAutoMonthlyReturns,
  paySingleReturn,
  getAllTransactions,
  getAuditLogs,
  exportReport,
  updateAdminCredentials,
  getQueries,
  createQuery,
  replyQuery,
  updateQueryStatus,
  getSubscriptions,
  recordSubscriptionPayment,
  updateSubscriptionStatus,
  getSubscriptionPricing,
  updateSubscriptionPricing,
  getCompanyCapTable,
  getDividends,
  declareDividend,
  distributeDividend,
  getShareholders,
  updateShareholderAllotment,
  getAllApprovals,
  getApprovalById,
  decideRegistrationApproval,
  previewDocument,
  downloadDocument,
  getFundingRequests,
  getFundingRequestById,
  decideFundingRequest,
  getInvestorRequests,
  getInvestorRequestById,
  decideInvestorRequest
} from './adminController.js';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import {
  getMaturityReleases,
  releaseMaturityPrincipal,
  toggleMaturityReleaseHold
} from './maturityReleaseController.js';

const router = express.Router();

// Enforce authentication & admin role on all routes
router.use(authenticate, requireAdmin);

// Dashboard & WorkList
router.get('/dashboard', getDashboardStats);
router.get('/worklist', getWorkList);

// Registration Approvals & Document Inspection Suite
router.get('/approvals', getAllApprovals);
router.get('/approvals/:id', getApprovalById);
router.post('/approvals/:id/decision', decideRegistrationApproval);
router.get('/documents/:filename', previewDocument);
router.get('/documents/:filename/download', downloadDocument);

// Investors & KYC
router.get('/investors', getInvestors);
router.get('/investors/:id/investments', getInvestorInvestments);
router.get('/investments', getAllInvestments);
router.post('/kyc/:id/decision', decideKyc);
router.post('/users/:id/block', setUserBlockStatus);
router.post('/investors/:id/suspend-funding', suspendInvestorFunding);
router.post('/investors/:id/suspend-account', suspendInvestorAccount);

// Companies & KYB
router.get('/companies', getCompanies);
router.post('/companies', createCompany);
router.get('/companies/:id/cap-table', getCompanyCapTable);
router.post('/kyb/:id/decision', decideKyb);
router.post('/companies/:id/suspend-funding', suspendCompanyFunding);
router.post('/companies/:id/suspend-account', suspendCompanyAccount);
router.delete('/companies/:id', deleteCompany);

// Offers & Term Sheets
router.get('/offers', getOffers);
router.post('/offers', createOffer);
router.get('/offers/:id/investments', getOfferInvestments);
router.put('/offers/:id/terms', setOfferTerms);
router.post('/offers/:id/publish', publishOffer);
router.post('/offers/:id/activate', activateOffer);
router.post('/offers/:id/hold', toggleOfferHold);
router.delete('/offers/:id', deleteOffer);

// Company Funding / Investment Requests (Company side submissions)
router.get('/funding-requests', getFundingRequests);
router.get('/funding-requests/:id', getFundingRequestById);
router.post('/funding-requests/:id/decision', decideFundingRequest);

// Investor Investment Requests (Investor side applications)
router.get('/investor-requests', getInvestorRequests);
router.get('/investor-requests/:id', getInvestorRequestById);
router.post('/investor-requests/:id/decision', decideInvestorRequest);

// Equity Dividends
router.get('/dividends', getDividends);
router.post('/dividends', declareDividend);
router.post('/dividends/:id/distribute', distributeDividend);

// Shareholder Management & Cap Table
router.get('/shareholders', getShareholders);
router.put('/shareholders/:id/allotment', updateShareholderAllotment);

// Fund Releases (Company side)
router.get('/releases', getReleases);
router.post('/releases/:id/approve', approveRelease);

// Repayments & Company Returns (Company collections)
router.get('/repayments', getRepayments);
router.get('/company-returns', getAdminReturnAgreements);
router.post('/repayments/:id/receipt', confirmRepaymentReceipt);
router.post('/repayments/:id/default', markDefault);

// Payout Batches (Investor payouts)
router.get('/payouts', getPayouts);
router.post('/payouts/:id/verify', verifyPayout);
router.post('/payouts/:id/pay', paySingleReturn);
router.post('/payouts/verify-all', verifyAllPayouts);
router.get('/payout-batches', getBatches);
router.post('/payout-batches', createPayoutBatch);
router.post('/payout-batches/:id/approve', approveAndSendBatch);
router.post('/payouts/:id/retry', retryPayout);
router.post('/payouts/:id/hold', togglePayoutHold);
router.post('/payouts/auto-process', triggerAutoMonthlyReturns);

// Investor Maturity Principal Releases (Tenure Completion Releases)
router.get('/maturity-releases', getMaturityReleases);
router.post('/maturity-releases/:id/release', releaseMaturityPrincipal);
router.post('/maturity-releases/:id/hold', toggleMaturityReleaseHold);

// Universal Master Transactions Log
router.get('/transactions', getAllTransactions);

// Audit Log & Reports
router.get('/audit-log', getAuditLogs);
router.get('/reports/:name/export', exportReport);

// Admin Profile & Credentials Settings
router.put('/settings/credentials', updateAdminCredentials);

// Queries & Support Tickets (Investor & Company)
router.get('/queries', getQueries);
router.post('/queries', createQuery);
router.post('/queries/:id/reply', replyQuery);
router.put('/queries/:id/status', updateQueryStatus);

// Subscriptions & Platform Service Fees (₹500/month)
router.get('/subscriptions', getSubscriptions);
router.post('/subscriptions', recordSubscriptionPayment);
router.put('/subscriptions/:id/status', updateSubscriptionStatus);
router.get('/subscriptions/pricing', getSubscriptionPricing);
router.put('/subscriptions/pricing', updateSubscriptionPricing);

export default router;
