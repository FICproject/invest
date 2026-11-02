import {
  calculateMonthlyReturnPaise,
  calculateTotalReturnsPaise,
  formatINR,
  validateOfferTenures,
  validateInvestmentAmount,
  checkBankCoolingOff,
  calculateSharesFromPaise,
  calculateEquityDilutionPct,
  calculateDividendPerInvestorPaise
} from '../src/services/rulesService.js';
import { OfferKind } from '../src/constants/index.js';

console.log('--- Testing PRD Rules & Formula Verification ---');

// Test 1: PRD Section 3.4 Table Verifications
const cases = [
  { amount: 1000 * 100, bps: 300, expectedMonthly: 30 * 100, expected12m: 360 * 100, expected60m: 1800 * 100 },
  { amount: 25000 * 100, bps: 300, expectedMonthly: 750 * 100, expected12m: 9000 * 100, expected60m: 45000 * 100 },
  { amount: 100000 * 100, bps: 300, expectedMonthly: 3000 * 100, expected12m: 36000 * 100, expected60m: 180000 * 100 },
  { amount: 1000000 * 100, bps: 300, expectedMonthly: 30000 * 100, expected12m: 360000 * 100, expected60m: 1800000 * 100 }
];

let allPassed = true;

for (const c of cases) {
  const monthly = calculateMonthlyReturnPaise(c.amount, c.bps);
  const total12m = calculateTotalReturnsPaise(c.amount, c.bps, 12);
  const total60m = calculateTotalReturnsPaise(c.amount, c.bps, 60);

  const passMonthly = monthly === c.expectedMonthly;
  const pass12m = total12m === c.expected12m;
  const pass60m = total60m === c.expected60m;

  console.log(`Principal ${formatINR(c.amount)}: Monthly ${formatINR(monthly)} [${passMonthly ? 'PASS' : 'FAIL'}], 12m ${formatINR(total12m)} [${pass12m ? 'PASS' : 'FAIL'}], 60m ${formatINR(total60m)} [${pass60m ? 'PASS' : 'FAIL'}]`);

  if (!passMonthly || !pass12m || !pass60m) allPassed = false;
}

// Test 2: Tenure Checks
const projectValid = validateOfferTenures(OfferKind.PROJECT, [12, 18, 24]);
const projectInvalid = validateOfferTenures(OfferKind.PROJECT, [6, 12]);
const companyValid = validateOfferTenures(OfferKind.COMPANY, [60, 84, 120]);
const companyInvalid = validateOfferTenures(OfferKind.COMPANY, [48, 60]);
const equityValid = validateOfferTenures(OfferKind.EQUITY, []);

console.log(`Project Tenures [12, 18, 24]: ${projectValid.valid ? 'VALID' : 'INVALID'}`);
console.log(`Project Tenures [6, 12] (< 12m): ${!projectInvalid.valid ? 'PROPERLY REJECTED' : 'UNEXPECTED ACCEPT'}`);
console.log(`Company Tenures [60, 84, 120]: ${companyValid.valid ? 'VALID' : 'INVALID'}`);
console.log(`Company Tenures [48, 60] (< 60m): ${!companyInvalid.valid ? 'PROPERLY REJECTED' : 'UNEXPECTED ACCEPT'}`);
console.log(`Equity Offer (No Tenures): ${equityValid.valid ? 'VALID (NO TENURE REQUIRED)' : 'INVALID'}`);

// Test 2.1: Equity Share & Dilution Formulas
const shares = calculateSharesFromPaise(2500000 * 100, 500 * 100);
const dilutionPct = calculateEquityDilutionPct(10000000 * 100, 90000000 * 100);
const dividendPayout = calculateDividendPerInvestorPaise(5000, 25 * 100);

console.log(`Equity Shares calculation (₹25L @ ₹500/sh): ${shares} shares [${shares === 5000 ? 'PASS' : 'FAIL'}]`);
console.log(`Equity Dilution calculation (₹1Cr raise on ₹9Cr pre-money): ${dilutionPct}% [${dilutionPct === 10 ? 'PASS' : 'FAIL'}]`);
console.log(`Dividend distribution (5,000 shares @ ₹25/sh): ${formatINR(dividendPayout)} [${dividendPayout === 125000 * 100 ? 'PASS' : 'FAIL'}]`);

if (!projectValid.valid || projectInvalid.valid || !companyValid.valid || companyInvalid.valid || !equityValid.valid || shares !== 5000 || dilutionPct !== 10 || dividendPayout !== 125000 * 100) {
  allPassed = false;
}

// Test 3: Cooling-off Check
const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

const coolingPast = checkBankCoolingOff(pastDate);
const coolingFuture = checkBankCoolingOff(futureDate);

console.log(`Past Bank Account (5 days ago): In Cooling-Off = ${coolingPast.inCoolingOff}`);
console.log(`Fresh Bank Account (+2 days): In Cooling-Off = ${coolingFuture.inCoolingOff} (${coolingFuture.hoursRemaining} hours left)`);

if (coolingPast.inCoolingOff || !coolingFuture.inCoolingOff) {
  allPassed = false;
}

console.log(`\nOverall Rules Verification: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
process.exit(allPassed ? 0 : 1);
