import express from 'express';
import { requireCompanyAuth, requireCompany } from '../middleware/companyAuthMiddleware.js';
import { requireApprovedUser, requireActiveFunding } from '../middleware/requireApprovedUser.js';
import { upload } from '../middleware/uploadMiddleware.js';
import {
  registerCompany,
  loginCompany,
  resubmitCompany
} from '../controllers/companyAuthController.js';
import {
  getCompanySubscription,
  createCompanySubscriptionOrder,
  verifyCompanySubscription
} from '../controllers/companySubscriptionController.js';
import {
  getCompanyProfile,
  updateCompanyProfile,
  addDirector,
  removeDirector,
  submitVerification,
  getDashboardOverview,
  getRequests,
  createRequest,
  getRequestById,
  updateRequest,
  getCompanyInvestments,
  getShareholders,
  createShareAllocation,
  getFinancialReports,
  createFinancialReport,
  getReturnsAndDividends,
  declareDividend,
  getCompanyTransactions,
  getCompanyDocuments,
  uploadCompanyDocument,
  deleteCompanyDocument,
  getCompanyNotifications,
  markCompanyNotificationRead
} from '../controllers/companyController.js';

const router = express.Router();

// Company Auth (public)
router.post('/auth/register', registerCompany);
router.post('/auth/login', loginCompany);
router.post('/auth/resubmit', requireCompanyAuth, resubmitCompany);

// All protected company endpoints
router.use(requireCompanyAuth, requireCompany);

// Profile (accessible during pending/resubmission for viewing/updating details)
router.get('/profile', getCompanyProfile);
router.put('/profile', updateCompanyProfile);
router.post('/directors', addDirector);
router.delete('/directors/:directorIndex', removeDirector);
router.post('/submit-verification', submitVerification);

// Dashboard & Operational routes - strictly require Admin Approval
router.use(requireApprovedUser);

// Dashboard & Investments
router.get('/dashboard-overview', getDashboardOverview);
router.get('/requests', getRequests);
router.post('/requests', requireActiveFunding, upload.array('documents', 5), createRequest);
router.get('/requests/:id', getRequestById);
router.put('/requests/:id', requireActiveFunding, upload.array('documents', 5), updateRequest);
router.get('/investments', getCompanyInvestments);

// Shareholders & Cap Table
router.get('/shareholders', getShareholders);
router.post('/shareholders/allocations', createShareAllocation);

// Financials & Dividends
router.get('/financials/reports', getFinancialReports);
router.post('/financials/reports', upload.single('file'), createFinancialReport);
router.get('/financials/returns-and-dividends', getReturnsAndDividends);
router.post('/financials/dividends', declareDividend);

// Transactions
router.get('/transactions', getCompanyTransactions);

// Documents
router.get('/documents', getCompanyDocuments);
router.post('/documents/upload', upload.single('file'), uploadCompanyDocument);
router.delete('/documents/:id', deleteCompanyDocument);

// Notifications
router.get('/notifications', getCompanyNotifications);
router.put('/notifications/:id/read', markCompanyNotificationRead);

// Subscription & Razorpay Billing
router.get('/subscription', getCompanySubscription);
router.post('/subscription/create-order', createCompanySubscriptionOrder);
router.post('/subscription/verify', verifyCompanySubscription);

export default router;

