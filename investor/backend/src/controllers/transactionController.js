import { Transaction } from '../models/Transaction.js';
import { Investment } from '../models/Investment.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @route   GET /api/transactions
// @desc    Get transaction ledger history with filters
export const getTransactions = asyncHandler(async (req, res) => {
  const investorId = req.user._id;
  const { type, status, search } = req.query;

  const query = { investorId };

  if (type && type !== 'All') {
    query.type = type;
  }

  if (status && status !== 'All') {
    query.status = status;
  }

  if (search && search.trim()) {
    const s = new RegExp(search.trim(), 'i');
    query.$or = [{ title: s }, { referenceId: s }, { description: s }];
  }

  const transactions = await Transaction.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions
  });
});

// @route   GET /api/transactions/statement
// @desc    Get full account statement data for download/printing
export const getStatement = asyncHandler(async (req, res) => {
  const investorId = req.user._id;
  const { fromDate, toDate } = req.query;

  const query = { investorId };
  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) query.createdAt.$gte = new Date(fromDate);
    if (toDate) query.createdAt.$lte = new Date(toDate);
  }

  const transactions = await Transaction.find(query).sort({ createdAt: -1 });
  const investments = await Investment.find({ investorId }).populate('offerId');

  const totalInvested = investments
    .filter((i) => i.status === 'Confirmed')
    .reduce((sum, i) => sum + i.amountInvested, 0);

  const totalReturns = transactions
    .filter((t) => t.type === 'Payout' && t.status === 'Confirmed')
    .reduce((sum, t) => sum + t.amount, 0);

  res.status(200).json({
    success: true,
    data: {
      investor: {
        name: req.user.name,
        email: req.user.email,
        mobile: req.user.mobile
      },
      generatedAt: new Date(),
      statementPeriod: {
        from: fromDate || 'Account Inception',
        to: toDate || new Date().toISOString()
      },
      summary: {
        totalInvested,
        totalReturnsReceived: totalReturns,
        totalActiveInvestments: investments.filter((i) => i.status === 'Confirmed').length,
        totalTransactions: transactions.length
      },
      transactions,
      investments
    }
  });
});
