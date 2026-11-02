import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Calendar, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { investmentService } from '../../services/investmentService';

export const InvestmentCalculator = ({ offer, initialAmount }) => {
  const min = offer ? offer.minInvestment : 5000;
  const max = offer ? offer.maxInvestment || 1000000 : 1000000;
  const rate = offer ? offer.returnRate : 10;
  const tenure = offer ? offer.tenureMonths : 24;

  const [amount, setAmount] = useState(initialAmount || min);
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCalc = async () => {
      if (!offer || !offer._id) return;
      setLoading(true);
      try {
        const res = await investmentService.calculateReturns(offer._id, amount, tenure);
        if (isMounted && res.success) {
          setCalculation(res.data);
        }
      } catch (err) {
        // Fallback local formula if network delayed
        const principal = Number(amount) || min;
        const totalInterest = Math.round((principal * rate * (tenure / 12)) / 100);
        if (isMounted) {
          setCalculation({
            principal,
            annualRate: rate,
            tenureMonths: tenure,
            payoutFrequency: offer.payoutFrequency,
            monthlyPayout: Math.round(totalInterest / tenure),
            totalExpectedInterest: totalInterest,
            totalMaturityAmount: principal + totalInterest
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCalc();
    return () => { isMounted = false; };
  }, [offer, amount, tenure]);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(59, 10, 17, 0.05)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Calculator size={20} color="var(--color-primary)" />
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
          Investment Calculator
        </h3>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        Simulate projected interest returns for this specific offer based on a {rate}% annual return rate and {tenure}-month tenure.
      </p>

      {/* Amount Input & Range */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
            Investment Amount
          </label>
          <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-primary)' }}>
            {formatCurrency(amount)}
          </span>
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={1000}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'var(--border-color)',
            borderRadius: '4px',
            outline: 'none',
            cursor: 'pointer',
            accentColor: 'var(--color-primary)',
            marginBottom: '10px'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>Min: {formatCurrency(min)}</span>
          <span>Max: {formatCurrency(max)}</span>
        </div>
      </div>

      {/* Projection Results */}
      {calculation && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            backgroundColor: 'var(--bg-surface-subtle)',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Monthly Payout</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#10B981', marginTop: '2px' }}>
              {formatCurrency(calculation.monthlyPayout)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>approx / month</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Returns</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-gold)', marginTop: '2px' }}>
              {formatCurrency(calculation.totalExpectedInterest)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Over {tenure} months</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Maturity Value</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-primary)', marginTop: '2px' }}>
              {formatCurrency(calculation.totalMaturityAmount)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Principal + Returns</div>
          </div>
        </div>
      )}
    </div>
  );
};
