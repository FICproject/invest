import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  UserCheck,
  Building,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import heroBuildingImg from '../../assets/images/hero-building-gold.jpg';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Company Registration & Identity Creation',
      tagline: 'Establish your institutional credibility',
      desc: 'Sign up with your verified corporate email and primary director details. Provide your Corporate Identification Number (CIN) and PAN to auto-verify your entity status via MCA registry databases.',
      tasks: [
        'Corporate Email & Authorized Director OTP verification',
        'Company PAN, CIN & Registered Address validation',
        'Secure multi-factor authentication setup'
      ],
      timeframe: '5 - 10 Minutes'
    },
    {
      num: '02',
      title: 'Business Profile & Statutory Documents Upload',
      tagline: 'Assemble your verifiable digital data room',
      desc: 'Complete your comprehensive company dossier including business model overview, key leadership profiles, cap table overview, and verified compliance documents (COI, GST, MOA/AOA, and audited financial statements).',
      tasks: [
        'Certificate of Incorporation & GST certificates upload',
        'Audited P&L statements & balance sheets (last 2 fiscal years)',
        'Pitch deck, business plan & financial forecasts'
      ],
      timeframe: 'Same-day completion'
    },
    {
      num: '03',
      title: 'Compliance Review & Platform Verification',
      tagline: 'Quality audit for investor readiness',
      desc: 'Our compliance and risk team verifies the submitted documentation against statutory databases. We ensure your valuation, proposed coupon rates, or equity share pricing meet market benchmarks and legal standards.',
      tasks: [
        'Director identification (DIN) and background diligence',
        'Financial audit verification and solvency check',
        'Official "Verified Enterprise" badge badge allotment'
      ],
      timeframe: '24 - 48 Hours'
    },
    {
      num: '04',
      title: 'Design & Launch Investment Requests',
      tagline: 'Define your campaign parameters',
      desc: 'Draft and configure your capital request. Select your desired fundraising model: Fixed-Term Debt (coupon rate, tenure, repayment structure) or Growth Equity (pre-money valuation, share class, voting rights).',
      tasks: [
        'Specify funding target & minimum ticket size',
        'Set up automated payout frequency (Monthly, Quarterly, Maturity)',
        'Review legal disclosure terms before publishing to live marketplace'
      ],
      timeframe: 'Self-paced / Immediate'
    },
    {
      num: '05',
      title: 'Investor Engagement, Diligence & Commitments',
      tagline: 'Connect with accredited capital partners',
      desc: 'Once live, verified investors discover your opportunity, submit commitment amounts, ask diligence questions through secure encrypted channels, and execute digital subscription agreements.',
      tasks: [
        'Real-time tracking of committed vs. raised funds in your dashboard',
        'Direct inquiry management and verified investor dialogue',
        'Legally binding digital execution of investment contracts'
      ],
      timeframe: '2 - 4 Weeks typically'
    },
    {
      num: '06',
      title: 'Escrow Settlement & Ongoing Portal Management',
      tagline: 'Post-funding reporting and shareholder tools',
      desc: 'Funds are disbursed directly to your verified corporate bank account. Use your company portal to disburse scheduled interest returns, manage shareholder folios, publish quarterly financials, and declare dividends.',
      tasks: [
        'Automated payout ledger with bank UTR tracking',
        'Digital Share Certificate and folio number issuance',
        'Quarterly investor updates and regulatory audit logs'
      ],
      timeframe: 'Ongoing lifecycle'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1F2421] font-sans antialiased selection:bg-[#E8A51D] selection:text-white flex flex-col justify-between">
      <PublicNavbar />

      <main>
        {/* Header Hero */}
        <section className="py-20 bg-gradient-to-b from-[#FFF9ED] to-[#FFFDF7] border-b border-[#F2EBD9]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B37400] block mb-2">
                HOW IT WORKS
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1F2421] tracking-tight font-display leading-[1.15]">
                A Transparent, Step-by-Step Pathway to <span className="text-[#DE8E0A]">Growth Capital</span>
              </h1>
              <p className="mt-4 text-[15px] sm:text-[16px] text-[#556171] leading-relaxed">
                Connect Invest removes the friction, ambiguity, and lengthy paperwork of corporate fundraising. Here is exactly how your enterprise transitions from initial onboarding to funded growth.
              </p>
            </div>
          </div>
        </section>

        {/* Process Timeline */}
        <section className="py-16">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12 relative before:content-[''] before:absolute before:left-4 sm:before:left-7 before:top-4 before:bottom-4 before:w-[2px] before:bg-[#EFE8D8]">
              {steps.map((st, idx) => (
                <div key={st.num} className="relative flex gap-6 sm:gap-10 items-start group">
                  {/* Step Bubble */}
                  <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-[#F4B41A] text-[#1F2421] font-black text-xs sm:text-base flex items-center justify-center flex-shrink-0 shadow-md ring-4 ring-[#FFFDF7] z-10">
                    {st.num}
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 p-6 sm:p-8 rounded-3xl bg-white border border-[#EFE8D8] shadow-sm hover:border-[#F4B41A] transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold text-[#DE8E0A] uppercase tracking-wider">
                        {st.tagline}
                      </span>
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FFF9ED] text-[#B37400] border border-[#F4E9CD]">
                        ⏱ {st.timeframe}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#1F2421] font-display mb-3">
                      {st.title}
                    </h3>
                    <p className="text-[13.5px] text-[#556171] leading-relaxed mb-4">
                      {st.desc}
                    </p>

                    <div className="space-y-2 pt-3 border-t border-[#F8F3E8]">
                      <span className="text-xs font-bold text-[#1F2421] block">Key Milestones:</span>
                      <div className="space-y-1.5">
                        {st.tasks.map((task, tIdx) => (
                          <div key={tIdx} className="flex items-center gap-2 text-[12.5px] text-[#4A5568]">
                            <CheckCircle2 size={14} className="text-[#DE8E0A] flex-shrink-0" />
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security & Verification Guarantee */}
        <section className="py-16 bg-[#FFF9ED] border-y border-[#F2EBD9]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-6 rounded-2xl bg-white border border-[#EFE8D8]">
                <ShieldCheck className="w-10 h-10 text-[#DE8E0A] mx-auto mb-3" />
                <h4 className="font-bold text-[#1F2421] text-base mb-1 font-display">Bank-Grade Data Isolation</h4>
                <p className="text-[12px] text-[#6B7280]">All pitch data and audit reports are encrypted with 256-bit AES encryption.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-[#EFE8D8]">
                <Lock className="w-10 h-10 text-[#DE8E0A] mx-auto mb-3" />
                <h4 className="font-bold text-[#1F2421] text-base mb-1 font-display">Authenticated Access Only</h4>
                <p className="text-[12px] text-[#6B7280]">Only KYC-cleared investors sign NDAs to view sensitive company projections.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-[#EFE8D8]">
                <Layers className="w-10 h-10 text-[#DE8E0A] mx-auto mb-3" />
                <h4 className="font-bold text-[#1F2421] text-base mb-1 font-display">Standardized Compliances</h4>
                <p className="text-[12px] text-[#6B7280]">Legal contracts formulated compliant with Indian Companies Act, 2013 provisions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-[#1F2421] font-display mb-3">
              Ready to embark on step one?
            </h2>
            <p className="text-[14px] text-[#556171] max-w-xl mx-auto mb-6">
              Create your company profile today and initiate verification with zero upfront listing charges.
            </p>
            <Link
              to="/company/register"
              className="px-8 py-3.5 rounded-full bg-[#F4B41A] hover:bg-[#E8A51D] text-[#1F2421] font-bold text-sm shadow-md inline-flex items-center gap-2"
            >
              <span>Register Your Company</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

