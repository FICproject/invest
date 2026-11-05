import { InvestmentOffer } from '../models/InvestmentOffer.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @route   GET /api/investments
// @desc    Get all active investment opportunities with filters & search
export const getAllOffers = asyncHandler(async (req, res) => {
  const { category, type, search, sort, status, minAmount, maxAmount } = req.query;

  const query = {};

  // Status filtering (default only Active or Fully Funded, exclude Draft/Hidden)
  if (status) {
    query.status = status;
  } else {
    query.status = { $in: ['Active', 'Fully Funded'] };
  }

  // Category filter
  if (category && category !== 'All') {
    query.category = category;
  }

  // Type filter
  if (type && type !== 'All') {
    query.type = type;
  }

  // Minimum / Maximum investment filter
  if (minAmount) {
    query.minInvestment = { $gte: Number(minAmount) };
  }
  if (maxAmount) {
    query.minInvestment = { ...query.minInvestment, $lte: Number(maxAmount) };
  }

  // Search keyword across title, company name, and description
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { title: searchRegex },
      { companyName: searchRegex },
      { description: searchRegex }
    ];
  }

  // Sorting
  let sortOption = { createdAt: -1 };
  if (sort === 'returnRate_desc') {
    sortOption = { returnRate: -1 };
  } else if (sort === 'returnRate_asc') {
    sortOption = { returnRate: 1 };
  } else if (sort === 'minInvestment_asc') {
    sortOption = { minInvestment: 1 };
  } else if (sort === 'minInvestment_desc') {
    sortOption = { minInvestment: -1 };
  } else if (sort === 'raised_desc') {
    sortOption = { raisedAmount: -1 };
  }

  const offers = await InvestmentOffer.find(query).sort(sortOption).lean();

  // Fixed 3% return rate for all investors
  const investorOffers = offers.map(o => ({
    ...o,
    returnRate: 3
  }));

  res.status(200).json({
    success: true,
    count: investorOffers.length,
    data: investorOffers
  });
});

// @route   GET /api/investments/featured
// @desc    Get top featured investment offers for landing page and dashboard
export const getFeaturedOffers = asyncHandler(async (req, res) => {
  const offers = await InvestmentOffer.find({
    status: { $in: ['Active', 'Fully Funded'] },
    isFeatured: true
  }).sort({ createdAt: 1 }).limit(4);

  // If fewer than 4 marked as featured, fallback to top active offers
  let result = offers;
  if (result.length < 4) {
    result = await InvestmentOffer.find({
      status: { $in: ['Active', 'Fully Funded'] }
    }).sort({ createdAt: 1 }).limit(4);
  }

  const investorFeatured = result.map(o => {
    const obj = typeof o.toObject === 'function' ? o.toObject() : o;
    return {
      ...obj,
      returnRate: 3
    };
  });

  res.status(200).json({
    success: true,
    count: investorFeatured.length,
    data: investorFeatured
  });
});

// @route   GET /api/investments/:id
// @desc    Get full investment offer details by ID
export const getOfferById = asyncHandler(async (req, res) => {
  const offer = await InvestmentOffer.findById(req.params.id).lean();

  if (!offer) {
    throw new ApiError(404, 'Investment opportunity not found.');
  }

  // Fixed 3% return rate for investors
  offer.returnRate = 3;

  res.status(200).json({
    success: true,
    data: offer
  });
});

// @route   POST /api/investments/calculate
// @desc    Calculate projected return schedule based on offer rate and amount
export const calculateReturns = asyncHandler(async (req, res) => {
  const { offerId, amount, customTenureMonths } = req.body;

  if (!offerId || !amount) {
    throw new ApiError(400, 'Please provide investment offer ID and investment amount.');
  }

  const offer = await InvestmentOffer.findById(offerId);
  if (!offer) {
    throw new ApiError(404, 'Investment opportunity not found.');
  }

  const principal = Number(amount);
  if (isNaN(principal) || principal <= 0) {
    throw new ApiError(400, 'Invalid investment amount.');
  }

  const tenureMonths = customTenureMonths ? Number(customTenureMonths) : (offer.tenureMonths || 12);
  const annualRate = 3; // Fixed 3% return for investors
  
  // Simple Annual Interest formula: (P * R * T) / 100 where T is in years
  const totalInterest = (principal * annualRate * (tenureMonths / 12)) / 100;
  const monthlyPayout = totalInterest / tenureMonths;
  const totalMaturityAmount = principal + totalInterest;

  res.status(200).json({
    success: true,
    data: {
      principal,
      annualRate: 3,
      tenureMonths,
      payoutFrequency: offer.payoutFrequency || 'Monthly',
      monthlyPayout: Math.round(monthlyPayout),
      totalExpectedInterest: Math.round(totalInterest),
      totalMaturityAmount: Math.round(totalMaturityAmount)
    }
  });
});
