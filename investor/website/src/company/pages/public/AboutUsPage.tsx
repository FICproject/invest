import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Users, Target, Award, CheckCircle2, TrendingUp, Building2, Globe2 } from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';

import teamMeetingImg from '../../assets/images/team-meeting-gold.jpg';
import heroBuildingImg from '../../assets/images/hero-building-gold.jpg';
import bottomBuildingImg from '../../assets/images/bottom-building-gold.jpg';

export const AboutUsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1F2421] font-sans antialiased selection:bg-[#E8A51D] selection:text-white flex flex-col justify-between">
      <PublicNavbar />

      <main>
        {/* Hero Section */}
        <section className="py-20 border-b border-[#F2EBD9] relative overflow-hidden bg-gradient-to-b from-[#FFF9ED] to-[#FFFDF7]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B37400] block mb-2">
                ABOUT CONNECT INVEST
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1F2421] tracking-tight font-display leading-[1.15]">
                Bridging Visionary Enterprises with <span className="text-[#DE8E0A]">Strategic Capital</span>
              </h1>
              <p className="mt-4 text-[15px] sm:text-[16px] text-[#556171] leading-relaxed">
                Connect Invest is India’s premier company-facing investment bridge. We empower ambitious startups, MSMEs, and high-growth enterprises to access verified capital through institutional standards, structured disclosure, and investor readiness.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/company/register"
                  className="px-6 py-3 rounded-full bg-[#F4B41A] hover:bg-[#E8A51D] text-[#1F2421] font-bold text-[13.5px] shadow-sm inline-flex items-center gap-2"
                >
                  <span>Register Your Company</span>
                  <ArrowRight size={15} />
                </Link>
                <Link
                  to="/opportunities"
                  className="px-6 py-3 rounded-full bg-white hover:bg-[#FFF9ED] text-[#374151] font-semibold text-[13.5px] border border-[#E5E0D0] transition-all"
                >
                  Explore Opportunities
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Core Narrative with Image Section */}
        <section className="py-16">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6">
                <div className="relative rounded-3xl overflow-hidden shadow-lg border border-[#F4E9CD]">
                  <img
                    src={teamMeetingImg}
                    alt="Connect Invest Advisory and Diligence Team"
                    className="w-full h-auto object-cover max-h-[460px]"
                  />
                  <div className="absolute bottom-5 right-5 bg-[#F4B41A] text-[#1F2421] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                    <span className="text-2xl">🏢</span>
                    <div>
                      <span className="block text-[12px] font-extrabold">Enterprise First</span>
                      <span className="block text-[10.5px] font-medium text-[#3D2900]">Trusted MCA Diligence</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-5">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B37400] block">
                  OUR MISSION & VALUES
                </span>
                <h2 className="text-3xl font-extrabold text-[#1F2421] tracking-tight font-display">
                  Transforming Capital Raising into a Transparent, Streamlined Journey
                </h2>
                <p className="text-[14px] text-[#556171] leading-relaxed">
                  Historically, Indian businesses spent months navigating scattered investor meetings, opaque terms, and delayed legal documentation. Connect Invest was built to replace fragmented fundraising with a verified, digital workflow.
                </p>

                <div className="space-y-3 pt-2">
                  {[
                    {
                      title: 'Direct Strategic Alignment',
                      desc: 'We connect companies directly with vetted investors aligned to their industry, ticket size, and growth model.',
                    },
                    {
                      title: 'Regulatory Compliance & Verification',
                      desc: 'Built-in MCA verification, CIN/PAN checks, and audited documentation guarantee institutional trust.',
                    },
                    {
                      title: 'Tailored Funding Instruments',
                      desc: 'Choose between structured Fixed-Term interest models or Equity CCPS rounds designed for your balance sheet.',
                    },
                  ].map((val, i) => (
                    <div key={i} className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white border border-[#EFE8D8]">
                      <CheckCircle2 className="w-5 h-5 text-[#DE8E0A] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[13.5px] font-bold text-[#1F2421]">{val.title}</h4>
                        <p className="text-[12px] text-[#6B7280] leading-snug mt-0.5">{val.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Milestones & Trust Metrics */}
        <section className="py-16 bg-[#FFF9ED] border-y border-[#F2EBD9]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B37400] block mb-1">
                OUR IMPACT
              </span>
              <h2 className="text-3xl font-extrabold text-[#1F2421] tracking-tight font-display">
                Built to Scale Enterprise Potential
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Verified Enterprises', val: '250+', desc: 'Active registered Indian businesses' },
                { label: 'Capital Facilitated', val: '₹120 Cr+', desc: 'Committed across sectors' },
                { label: 'Active Investors', val: '1,500+', desc: 'Accredited and institutional network' },
                { label: 'Diligence Turnaround', val: '48 Hrs', desc: 'Rapid initial verification standard' },
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white border border-[#EFE8D8] text-center shadow-sm">
                  <div className="text-3xl font-extrabold text-[#DE8E0A] font-display mb-1">{stat.val}</div>
                  <div className="text-[13.5px] font-bold text-[#1F2421]">{stat.label}</div>
                  <p className="text-[11.5px] text-[#78716C] mt-1">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership & Integrity Section */}
        <section className="py-16">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B37400] block mb-1">
                OPERATIONAL PRINCIPLES
              </span>
              <h2 className="text-3xl font-extrabold text-[#1F2421] tracking-tight font-display">
                How We Safeguard Company Interests
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Confidentiality First',
                  desc: 'Proprietary pitch materials and financial projections are only visible to authenticated, KYC-cleared investors.',
                },
                {
                  icon: Target,
                  title: 'Strict Diligence Protocol',
                  desc: 'Every business requirement undergoes legal, financial, and regulatory checks before presenting to capital partners.',
                },
                {
                  icon: Globe2,
                  title: 'Dedicated Campaign Support',
                  desc: 'Our financial advisory team assists you in structuring fair market valuations and realistic coupon terms.',
                },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <div key={i} className="p-6 rounded-2xl bg-white border border-[#EFE8D8] shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-[#FFF4D6] text-[#B37400] flex items-center justify-center mb-4">
                        <Icon size={24} />
                      </div>
                      <h4 className="text-[16px] font-bold text-[#1F2421] font-display mb-2">{card.title}</h4>
                      <p className="text-[12.5px] text-[#6B7280] leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="pb-16">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-r from-[#874A00] via-[#A85E00] to-[#874A00] text-white p-8 sm:p-12 relative overflow-hidden shadow-xl flex flex-col sm:flex-row items-center justify-between gap-8">
              <div className="space-y-3 max-w-xl z-10">
                <span className="text-[11px] uppercase font-bold tracking-widest text-[#FFD885] block">
                  READY TO CONNECT?
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight">
                  Join hundreds of growing Indian businesses on Connect Invest.
                </h3>
                <p className="text-[13px] text-[#FDEBD0]">
                  Get your profile verified, configure your funding request, and start meeting aligned investors.
                </p>
              </div>
              <div className="z-10 flex gap-4">
                <Link
                  to="/company/register"
                  className="px-6 py-3 rounded-full bg-[#F4B41A] hover:bg-[#E8A51D] text-[#1F2421] font-bold text-[13.5px] shadow-md inline-flex items-center gap-2"
                >
                  <span>Start Registration</span>
                  <ArrowRight size={15} />
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

