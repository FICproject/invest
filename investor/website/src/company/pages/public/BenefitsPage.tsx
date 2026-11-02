import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  TrendingUp,
  Zap,
  Users,
  PieChart,
  BadgePercent,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BarChart3,
  Scale,
  Award
} from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';

import cardStartupsImg from '../../assets/images/card-startups.jpg';
import cardGrowingImg from '../../assets/images/card-growing.jpg';
import cardEstablishedImg from '../../assets/images/card-established.jpg';
import cardEcommerceImg from '../../assets/images/card-ecommerce.jpg';

export const BenefitsPage: React.FC = () => {
  const coreBenefits = [
    {
      icon: Zap,
      title: 'Accelerated Capital Access',
      desc: 'Bypass cold outreach and prolonged pitch roadshows. Present your opportunity directly to 1,500+ accredited, active investors looking for verified high-growth opportunities.',
    },
    {
      icon: Scale,
      title: 'Founder-Friendly Deal Terms',
      desc: 'Retain complete operational control. Whether you choose non-dilutive Fixed-Term capital or structured Equity CCPS, you set the coupon rates, tenures, or valuation benchmarks.',
    },
    {
      icon: ShieldCheck,
      title: 'Institutional Verification & Trust',
      desc: 'Earning our verified badge signals high compliance, clean accounting, and regulatory integrity to prospective co-investors, banking partners, and suppliers.',
    },
    {
      icon: BarChart3,
      title: 'Complete Lifecycle Management',
      desc: 'From initial term sheet signatures to automated interest payouts, cap-table tracking, and dividend declarations—manage your entire investor relations in one unified portal.',
    },
    {
      icon: Users,
      title: 'Strategic Mentorship & Network',
      desc: 'Many of our syndicate members are veteran business founders, CXOs, and industry leaders who bring valuable client introductions, governance advice, and procurement channels.',
    },
    {
      icon: PieChart,
      title: 'Transparent Reporting & Compliance',
      desc: 'Publish quarterly performance reports, audit statements, and board resolutions with one click, fulfilling MCA corporate governance standards seamlessly.',
    },
  ];

  const businessCategories = [
    {
      img: cardStartupsImg,
      title: 'Early-Stage Startups',
      description: 'Innovative founders building scalable tech, D2C, or software solutions who need seed or pre-Series A capital with operator mentorship.',
      points: ['Convertible CCPS models', 'Access to angel networks', 'Rapid 30-day closing cycles']
    },
    {
      img: cardGrowingImg,
      title: 'Growing MSMEs & Mid-Market',
      description: 'Profitable businesses scaling manufacturing capacity, purchasing new commercial machinery, or expanding distribution footprints.',
      points: ['Fixed-term monthly coupon debt', 'Preserve 100% equity upside', 'Flexible tenure up to 36 months']
    },
    {
      img: cardEstablishedImg,
      title: 'Established Corporations',
      description: 'Mature enterprises undertaking strategic joint ventures, brownfield industrial acquisitions, or corporate restructuring.',
      points: ['Consortium syndicates up to ₹25 Cr', 'Independent valuation support', 'Customized shareholder agreements']
    },
    {
      img: cardEcommerceImg,
      title: 'E-commerce & Digital Brands',
      description: 'Omnichannel brands and high-volume sellers needing immediate working capital for seasonal inventory buildup and digital advertising.',
      points: ['Non-collateralized revenue financing', 'Disbursement in under 72 hours', 'Revolving credit access']
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
                PLATFORM ADVANTAGES
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1F2421] tracking-tight font-display leading-[1.15]">
                Why Fast-Growing Enterprises Choose <span className="text-[#DE8E0A]">Connect Invest</span>
              </h1>
              <p className="mt-4 text-[15px] sm:text-[16px] text-[#556171] leading-relaxed">
                Fundraising is a full-time distraction from building your core business. Connect Invest delivers the technology, compliance framework, and investor reach so you can secure capital on your terms.
              </p>
            </div>
          </div>
        </section>

        {/* 6 Grid Benefits */}
        <section className="py-16">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coreBenefits.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div
                    key={i}
                    className="p-7 rounded-3xl bg-white border border-[#EFE8D8] shadow-sm hover:border-[#F4B41A] hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-[#FFF4D6] text-[#B37400] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        <Icon size={22} />
                      </div>
                      <h3 className="text-lg font-bold text-[#1F2421] font-display mb-2">
                        {b.title}
                      </h3>
                      <p className="text-[13px] text-[#6B7280] leading-relaxed">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Who Can Use Connect Invest (Image Cards) */}
        <section className="py-16 bg-[#FFF9ED] border-y border-[#F2EBD9]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-left mb-12">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B37400] block mb-1">
                ELIGIBILITY & AUDIENCE
              </span>
              <h2 className="text-3xl font-extrabold text-[#1F2421] tracking-tight font-display">
                Suitable for Every Growth Stage
              </h2>
              <p className="text-[14px] text-[#556171] max-w-2xl mt-1">
                From fast-moving digital startups to multi-decade industrial manufacturers, our dual funding instruments match your capital structure.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {businessCategories.map((card, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl bg-white border border-[#EFE8D8] overflow-hidden shadow-sm hover:border-[#F4B41A] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={card.img}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <h4 className="text-[16px] font-bold text-[#1F2421] font-display mb-2">
                        {card.title}
                      </h4>
                      <p className="text-[12px] text-[#6B7280] leading-relaxed mb-4">
                        {card.description}
                      </p>

                      <div className="space-y-1.5 pt-3 border-t border-[#F8F3E8]">
                        {card.points.map((pt, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-2 text-[11.5px] text-[#374151]">
                            <CheckCircle size={13} className="text-[#DE8E0A] flex-shrink-0" />
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Link
                      to="/company/register"
                      className="w-full py-2 rounded-xl bg-[#FFF9ED] hover:bg-[#F4B41A] text-[#B37400] hover:text-[#1F2421] font-bold text-[11.5px] border border-[#F4E9CD] flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>Check Suitability</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison / Traditional vs Connect Invest */}
        <section className="py-16">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B37400] block mb-1">
                THE CONNECT INVEST ADVANTAGE
              </span>
              <h2 className="text-3xl font-extrabold text-[#1F2421] tracking-tight font-display">
                How We Compare to Traditional Channels
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-3xl overflow-hidden shadow-sm border border-[#EFE8D8] text-left text-[13px]">
                <thead>
                  <tr className="bg-[#FFF9ED] border-b border-[#F2EBD9] text-[#1F2421]">
                    <th className="py-4 px-6 font-bold">Feature / Capability</th>
                    <th className="py-4 px-6 font-bold text-[#DE8E0A]">Connect Invest Platform</th>
                    <th className="py-4 px-6 font-bold text-[#78716C]">Traditional Bank Loans</th>
                    <th className="py-4 px-6 font-bold text-[#78716C]">Offline Broker Networks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2EBD9] text-[#4A5568]">
                  <tr>
                    <td className="py-4 px-6 font-bold text-[#1F2421]">Collateral Requirement</td>
                    <td className="py-4 px-6 text-[#DE8E0A] font-semibold">Zero hard assets needed (revenue-based)</td>
                    <td className="py-4 px-6">100%–150% real estate or fixed deposits</td>
                    <td className="py-4 px-6">Case by case / strict guarantees</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-bold text-[#1F2421]">Closing Timeline</td>
                    <td className="py-4 px-6 text-[#DE8E0A] font-semibold">2 – 4 Weeks average</td>
                    <td className="py-4 px-6">3 – 6 Months with extensive branch visits</td>
                    <td className="py-4 px-6">Unpredictable (months to never)</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-bold text-[#1F2421]">Investor Relations & Ledger</td>
                    <td className="py-4 px-6 text-[#DE8E0A] font-semibold">Automated digital dashboard & folios</td>
                    <td className="py-4 px-6">Strict monthly EMIs via bank ECS</td>
                    <td className="py-4 px-6">Manual paper records and scattered calls</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-bold text-[#1F2421]">Network & Strategic Value</td>
                    <td className="py-4 px-6 text-[#DE8E0A] font-semibold">Active CXO & operator syndicate network</td>
                    <td className="py-4 px-6">Pure financial debt / zero value add</td>
                    <td className="py-4 px-6">Intermediaries taking upfront commissions</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-16">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-[#FFF9ED] border border-[#F4E9CD] p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-sm">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1F2421] font-display mb-3">
                Experience the Difference in Corporate Funding
              </h3>
              <p className="text-[14px] text-[#556171] mb-6">
                Join our roster of high-performing Indian enterprises and present your funding terms to an aligned investor network.
              </p>
              <Link
                to="/company/register"
                className="px-8 py-3.5 rounded-full bg-[#F4B41A] hover:bg-[#E8A51D] text-[#1F2421] font-bold text-sm shadow-md inline-flex items-center gap-2"
              >
                <span>Register Now — Free Evaluation</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

