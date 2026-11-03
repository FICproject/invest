import express from 'express';
import { requireCompanyAuth, requireCompany } from '../middleware/companyAuthMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import {
  registerCompany,
  loginCompany
} from '../controllers/companyAuthController.js';
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

// All protected company endpoints
router.use(requireCompanyAuth, requireCompany);

// Profile
router.get('/profile', getCompanyProfile);
router.put('/profile', updateCompanyProfile);
router.post('/directors', addDirector);
router.delete('/directors/:directorIndex', removeDirector);
router.post('/submit-verification', submitVerification);

// Dashboard & Investments
router.get('/dashboard-overview', getDashboardOverview);
router.get('/requests', getRequests);
router.post('/requests', upload.array('documents', 5), createRequest);
router.get('/requests/:id', getRequestById);
router.put('/requests/:id', upload.array('documents', 5), updateRequest);
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

export default router;

