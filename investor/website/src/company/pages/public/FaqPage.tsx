import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  HelpCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Building,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';

export const FaqPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Registration' | 'Diligence' | 'Funding' | 'Repayment'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqData = [
    {
      category: 'Registration',
      q: 'What is Connect Invest and who is it built for?',
      a: 'Connect Invest is a digital capital access platform connecting incorporated Indian enterprises (Startups, MSMEs, Private & Public Limiteds, LLPs) seeking growth capital with accredited individual and institutional investors. It streamlines company diligence, term structuring, digital contract execution, and ongoing investor communications.'
    },
    {
      category: 'Registration',
      q: 'What business legal structures are eligible to register?',
      a: 'Any incorporated legal entity registered under the Ministry of Corporate Affairs (MCA), including Private Limited Companies (Pvt Ltd), Public Limited Companies (Ltd), and Limited Liability Partnerships (LLPs). Sole proprietorships without MCA incorporation can register for advisory review but require corporate conversion before public capital campaigns.'
    },
    {
      category: 'Registration',
      q: 'Does it cost anything to register and submit a company profile?',
      a: 'No. Initial company onboarding, document upload, and compliance evaluation are 100% free with zero upfront listing or registration fees. Connect Invest works on a transparent success-aligned framework only upon successful capital campaign fulfillment.'
    },
    {
      category: 'Diligence',
      q: 'What documents are required for platform verification?',
      a: 'We require standard statutory business records: Certificate of Incorporation (COI), Company PAN Card, GST Registration Certificate, Memorandum and Articles of Association (MOA & AOA) or LLP Agreement, audited Balance Sheets and Profit & Loss statements for the last 1–2 financial years, and authorized Director KYC (PAN & Aadhaar).'
    },
    {
      category: 'Diligence',
      q: 'How long does the company verification process take?',
      a: 'Initial statutory checks (CIN, MCA status, PAN validation) are completed within 24 to 48 business hours. Once verified, you will receive an official "Verified Enterprise" badge and unlock the campaign creation builder.'
    },
    {
      category: 'Diligence',
      q: 'How does Connect Invest safeguard our confidential business data?',
      a: 'We enforce enterprise-grade data security. Your sensitive business projections, cap tables, and client contracts are strictly locked behind authenticated access. Investors must be KYC-verified and agree to platform Non-Disclosure Agreements (NDAs) prior to accessing proprietary pitch decks.'
    },
    {
      category: 'Funding',
      q: 'What is the difference between Fixed-Term and Equity funding?',
      a: 'Fixed-Term funding is non-dilutive structured debt where your enterprise agrees to pay fixed interest returns (e.g. 12%–18% p.a.) over a defined tenure (e.g. 12 to 36 months) with scheduled principal redemption, retaining 100% equity ownership. Equity funding issues shares or CCPS (Compulsorily Convertible Preference Shares) to investors in exchange for capital, welcoming them as company shareholders.'
    },
    {
      category: 'Funding',
      q: 'What is the minimum and maximum funding request size?',
      a: 'Our campaign architecture supports funding requests starting from ₹15 Lakhs up to ₹25 Crores per request. Early-stage businesses typically raise between ₹25 Lakhs and ₹2 Crores, while established manufacturers and growth-stage firms raise up to ₹15+ Crores.'
    },
    {
      category: 'Funding',
      q: 'Does registration guarantee funding from investors?',
      a: 'Registration and verification do not guarantee capital disbursement. Funding depends on investor appetite, commercial viability, transparent accounting, and agreement on commercial terms. Connect Invest gives your business direct institutional visibility, digital execution tools, and syndicate syndication support.'
    },
    {
      category: 'Repayment',
      q: 'How are scheduled interest payouts and dividends disbursed?',
      a: 'Your company dashboard includes an integrated payout ledger. For Fixed-Term requests, the system automatically schedules monthly or quarterly coupon payouts. You initiate payment directly via bank transfer/RTGS or integrated portal rails, and the system automatically generates digital disbursement receipts and UTR acknowledgments.'
    },
    {
      category: 'Repayment',
      q: 'What happens if a company needs to prepay or restructure tenure?',
      a: 'Prepayment terms are configured directly when drafting your investment request. Many campaigns permit early full redemption after a standard lock-in period (e.g. 6 or 12 months) without penalties, saving your business future interest expense.'
    },
    {
      category: 'Repayment',
      q: 'How does the platform assist with shareholder folio management?',
      a: 'For equity rounds, the platform auto-generates digital Share Allotment records, Board Resolution references, and Folio numbers for each participating investor. You can view, search, and export your updated shareholder register anytime.'
    }
  ];

  const categories = ['All', 'Registration', 'Diligence', 'Funding', 'Repayment'] as const;

  const filteredFaqs = faqData.filter(item => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1F2421] font-sans antialiased selection:bg-[#E8A51D] selection:text-white flex flex-col justify-between">
      <PublicNavbar />

      <main>
        {/* Header Hero */}
        <section className="py-20 bg-gradient-to-b from-[#FFF9ED] to-[#FFFDF7] border-b border-[#F2EBD9]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B37400] block mb-2">
              KNOWLEDGE BASE & SUPPORT
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1F2421] tracking-tight font-display leading-[1.15]">
              Frequently Asked <span className="text-[#DE8E0A]">Questions</span>
            </h1>
            <p className="mt-4 text-[15px] sm:text-[16px] text-[#556171] leading-relaxed">
              Find transparent answers regarding company onboarding, legal compliance, campaign models, fee structures, and post-funding operations.
            </p>

            {/* Search Input */}
            <div className="mt-8 relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E988A] w-5 h-5" />
              <input
                type="text"
                placeholder="Search topics (e.g., MCA documents, equity terms, payouts)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-full bg-white border border-[#EFE8D8] text-sm focus:outline-none focus:border-[#F4B41A] shadow-sm text-[#1F2421]"
              />
            </div>

            {/* Category Pills */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeCategory === cat
                      ? 'bg-[#F4B41A] text-[#1F2421] shadow-sm'
                      : 'bg-white border border-[#EFE8D8] text-[#556171] hover:border-[#DE8E0A]'
                  }`}
                >
                  {cat === 'All' ? 'All Questions' : cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs Accordion Section */}
        <section className="py-16">
          <div className="max-w-[860px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-[#EFE8D8] p-8">
                <HelpCircle className="w-12 h-12 text-[#DE8E0A] mx-auto mb-3 opacity-60" />
                <h3 className="text-lg font-bold text-[#1F2421] mb-1 font-display">No matching questions found</h3>
                <p className="text-sm text-[#6B7280]">Try searching with alternative keywords or reset the category filter.</p>
                <button
                  onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                  className="mt-4 px-5 py-2 rounded-full bg-[#FFF9ED] text-[#B37400] text-xs font-bold border border-[#F4E9CD]"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border transition-all duration-300 shadow-sm ${
                      isOpen
                        ? 'border-[#F4B41A] bg-white shadow-md ring-1 ring-[#F4B41A]/30'
                        : 'border-[#EFE8D8] bg-white/90 hover:bg-white hover:border-[#F4B41A]/60'
                    }`}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full px-6 py-4.5 text-left flex items-center justify-between text-[14px] font-bold text-[#1F2421] transition-colors"
                    >
                      <span className={`${isOpen ? 'text-[#DE8E0A]' : 'text-[#1F2421]'}`}>
                        {faq.q}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ml-4 transition-transform duration-300 ${
                          isOpen
                            ? 'bg-[#FFF4D6] text-[#DE8E0A] rotate-180'
                            : 'bg-[#F9F6EE] text-[#9E988A]'
                        }`}
                      >
                        <ChevronDown size={15} />
                      </div>
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-6 pb-5 pt-1 text-[13px] text-[#556171] leading-relaxed border-t border-[#F7F2E6]">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Contact Support Banner */}
        <section className="pb-16">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-[#FFF9ED] border border-[#F4E9CD] p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-4xl mx-auto shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF4D6] text-[#B37400] flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={22} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#1F2421] font-display">Have a specific question not covered here?</h4>
                  <p className="text-[13px] text-[#6B7280] mt-0.5">Our enterprise compliance desk is available Monday–Friday to assist your team.</p>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Link
                  to="/company/register"
                  className="px-6 py-2.5 rounded-full bg-[#F4B41A] hover:bg-[#E8A51D] text-[#1F2421] font-bold text-xs shadow-sm inline-flex items-center gap-1.5"
                >
                  <span>Connect with Advisory</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

