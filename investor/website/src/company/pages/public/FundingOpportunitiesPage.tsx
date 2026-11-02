import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket,
  TrendingUp,
  ShoppingCart,
  Handshake,
  ArrowRight,
  Filter,
  CheckCircle,
  HelpCircle,
  Clock,
  Percent,
  Banknote,
  ShieldAlert
} from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import laptopGrowthImg from '../../assets/images/laptop-growth-gold.jpg';

export const FundingOpportunitiesPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<'All' | 'Fixed-Term' | 'Equity'>('All');

  const opportunityTypes = [
    {
      id: 'fixed-term',
      model: 'Fixed-Term',
      icon: TrendingUp,
      title: 'Fixed-Term Debt & Growth Capital',
      ticketSize: '₹25 Lakhs – ₹5 Crores',
      typicalTenure: '12 – 36 Months',
      expectedReturns: '12% – 18% p.a.',
      summary: 'Non-dilutive capital structured with predictable monthly or quarterly yield payouts. Ideal for businesses with existing revenue looking to finance equipment, stock, or seasonal cash flow.',
      benefits: [
        'Zero equity dilution or board seat requirement',
        'Transparent repayment schedules directly in your company portal',
        'Automated payout ledger with direct bank integration',
        'Preserve 100% of your future enterprise upside'
      ],
      idealFor: 'Manufacturing, B2B wholesale, Logistics, Established retail chains'
    },
    {
      id: 'equity-growth',
      model: 'Equity',
      icon: Rocket,
      title: 'Growth Equity & CCPS Syndicates',
      ticketSize: '₹50 Lakhs – ₹15 Crores',
      typicalTenure: '3 – 5 Years Horizon',
      expectedReturns: 'Long-term Valuation Upside',
      summary: 'Strategic growth rounds backed by angel investors and micro-VC syndicates. Formatted as Compulsorily Convertible Preference Shares (CCPS) or Ordinary Shares to fund high-velocity expansion.',
      benefits: [
        'Strategic network of industry operators and active mentors',
        'Cap-table and shareholder register managed seamlessly in-app',
        'Standardized SHA / Term Sheet documentation templates',
        'Transparent shareholder voting and AGM dividend declaration tools'
      ],
      idealFor: 'Tech startups, D2C consumer brands, SaaS platforms, Renewable energy'
    },
    {
      id: 'ecommerce-scale',
      model: 'Fixed-Term',
      icon: ShoppingCart,
      title: 'E-commerce & Revenue-Based Financing',
      ticketSize: '₹15 Lakhs – ₹2 Crores',
      typicalTenure: '6 – 18 Months',
      expectedReturns: 'Flat fee / Revenue share',
      summary: 'Agile capital designed specifically for marketplace sellers (Amazon, Flipkart) and Shopify storefronts needing inventory funding ahead of major festive and promotional cycles.',
      benefits: [
        'Linked to monthly gross merchandise value (GMV)',
        'Rapid disbursement within 72 hours of data verification',
        'Collateral-free structure based on platform sales track record',
        'Repeated line of credit upon on-time repayments'
      ],
      idealFor: 'E-commerce brands, quick-commerce suppliers, digital-first retailers'
    },
    {
      id: 'strategic-jv',
      model: 'Equity',
      icon: Handshake,
      title: 'Strategic Alliances & Joint Ventures',
      ticketSize: '₹2 Crores – ₹25 Crores',
      typicalTenure: 'Long Term',
      expectedReturns: 'Synergistic Enterprise Value',
      summary: 'For mature businesses looking to acquire competitors, establish overseas distribution hubs, or enter co-manufacturing agreements with accredited institutional sponsors.',
      benefits: [
        'Curated matchmaking with strategic sector leaders',
        'Confidential deal room with strict NDA and permission controls',
        'Independent third-party financial and valuation certification',
        'Full support through board resolution and MCA filings'
      ],
      idealFor: 'Pharma & healthcare, specialty chemicals, green mobility, infrastructure'
    }
  ];

  const filtered = selectedModel === 'All' 
    ? opportunityTypes 
    : opportunityTypes.filter(o => o.model === selectedModel);

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1F2421] font-sans antialiased selection:bg-[#E8A51D] selection:text-white flex flex-col justify-between">
      <PublicNavbar />

      <main>
        {/* Header */}
        <section className="py-20 bg-gradient-to-b from-[#FFF9ED] to-[#FFFDF7] border-b border-[#F2EBD9]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B37400] block mb-2">
                  FUNDING OPPORTUNITIES
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1F2421] tracking-tight font-display leading-tight">
                  Funding Frameworks Tailored for <span className="text-[#DE8E0A]">Every Growth Phase</span>
                </h1>
                <p className="mt-4 text-[15px] text-[#556171] leading-relaxed max-w-xl">
                  Whether you require non-dilutive working capital with predictable returns or institutional growth equity, Connect Invest standardizes the campaign architecture to fit your balance sheet.
                </p>

                {/* Filter buttons */}
                <div className="mt-8 flex items-center gap-3">
                  <span className="text-xs font-bold text-[#78716C] flex items-center gap-1.5">
                    <Filter size={14} /> Filter Model:
                  </span>
                  {(['All', 'Fixed-Term', 'Equity'] as const).map((model) => (
                    <button
                      key={model}
                      onClick={() => setSelectedModel(model)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        selectedModel === model
                          ? 'bg-[#F4B41A] text-[#1F2421] shadow-sm'
                          : 'bg-white border border-[#EFE8D8] text-[#556171] hover:border-[#DE8E0A]'
                      }`}
                    >
                      {model === 'All' ? 'All Models' : model}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center">
                <div className="rounded-3xl overflow-hidden shadow-lg border border-[#F4E9CD] w-full max-w-[420px]">
                  <img
                    src={laptopGrowthImg}
                    alt="Funding Analytics Dashboard"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Opportunities List */}
        <section className="py-16">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {filtered.map((opp) => {
                const Icon = opp.icon;
                return (
                  <div
                    key={opp.id}
                    className="p-8 rounded-3xl bg-white border border-[#EFE8D8] shadow-sm hover:border-[#F4B41A] hover:shadow-md transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                  >
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#FFF4D6] text-[#B37400] flex items-center justify-center flex-shrink-0">
                          <Icon size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-extrabold text-[#1F2421] font-display">
                              {opp.title}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FFF9ED] border border-[#F4E9CD] text-[#B37400]">
                              {opp.model}
                            </span>
                          </div>
                          <span className="text-[12px] text-[#78716C] font-medium">
                            Ideal for: {opp.idealFor}
                          </span>
                        </div>
                      </div>

                      <p className="text-[13.5px] text-[#556171] leading-relaxed">
                        {opp.summary}
                      </p>

                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold text-[#1F2421] block">Key Platform Advantages:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12.5px] text-[#4B5563]">
                          {opp.benefits.map((b, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle size={15} className="text-[#DE8E0A] flex-shrink-0 mt-0.5" />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Metric Card */}
                    <div className="lg:col-span-5 bg-[#FFFDF7] p-6 rounded-2xl border border-[#F4E9CD] flex flex-col justify-between h-full space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#F2EBD9]">
                          <span className="text-xs text-[#78716C] font-semibold flex items-center gap-1.5">
                            <Banknote size={14} className="text-[#DE8E0A]" /> Target Ticket Size:
                          </span>
                          <span className="text-sm font-extrabold text-[#1F2421]">{opp.ticketSize}</span>
                        </div>

                        <div className="flex items-center justify-between pb-3 border-b border-[#F2EBD9]">
                          <span className="text-xs text-[#78716C] font-semibold flex items-center gap-1.5">
                            <Clock size={14} className="text-[#DE8E0A]" /> Typical Duration:
                          </span>
                          <span className="text-sm font-extrabold text-[#1F2421]">{opp.typicalTenure}</span>
                        </div>

                        <div className="flex items-center justify-between pb-3 border-b border-[#F2EBD9]">
                          <span className="text-xs text-[#78716C] font-semibold flex items-center gap-1.5">
                            <Percent size={14} className="text-[#DE8E0A]" /> Return Structure:
                          </span>
                          <span className="text-sm font-extrabold text-[#1F2421]">{opp.expectedReturns}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Link
                          to="/company/register"
                          className="w-full py-3 rounded-full bg-[#F4B41A] hover:bg-[#E8A51D] text-[#1F2421] font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
                        >
                          <span>Apply for {opp.model} Request</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Diligence Checklist */}
        <section className="py-16 bg-[#FFF9ED] border-t border-[#F2EBD9]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B37400] block mb-1">
                PRE-QUALIFICATION
              </span>
              <h2 className="text-3xl font-extrabold text-[#1F2421] tracking-tight font-display">
                Minimum Eligibility Requirements
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Incorporated Entity', desc: 'Registered Private Limited, Public Limited, or LLP under Ministry of Corporate Affairs (MCA).' },
                { title: 'Statutory Compliance', desc: 'Active Company PAN, GST registration, and updated annual MCA filings without defaults.' },
                { title: 'Financial Records', desc: 'Minimum 12 months operating history with audited or certified balance sheet & profit/loss statements.' }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white border border-[#EFE8D8] shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-[#FFF4D6] text-[#DE8E0A] font-bold text-sm flex items-center justify-center mb-3">
                    0{i + 1}
                  </div>
                  <h4 className="text-[15px] font-bold text-[#1F2421] mb-1 font-display">{item.title}</h4>
                  <p className="text-[12.5px] text-[#6B7280] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

