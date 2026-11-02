import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  Users,
  TrendingUp,
  Briefcase,
  ShieldCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Rocket,
  Building,
  ShoppingCart,
  Handshake,
  CheckCircle2,
} from 'lucide-react';

import heroCompanyBuildingImg from '../../assets/images/hero-company-building.png';
import heroBuildingImg from '../../assets/images/hero-building-gold.jpg';
import teamMeetingImg from '../../assets/images/team-meeting-gold.jpg';
import laptopGrowthImg from '../../assets/images/laptop-growth-gold.jpg';
import cardStartupsImg from '../../assets/images/card-startups.jpg';
import cardGrowingImg from '../../assets/images/card-growing.jpg';
import cardEstablishedImg from '../../assets/images/card-established.jpg';
import cardEcommerceImg from '../../assets/images/card-ecommerce.jpg';
import bottomBuildingImg from '../../assets/images/bottom-building-gold.jpg';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';

const stepsData = [
  {
    step: '1',
    icon: '👤',
    title: 'Register Your Company',
    desc: 'Create your company account and provide basic business information and authorized contact details.',
  },
  {
    step: '2',
    icon: '📄',
    title: 'Complete Your Business Profile',
    desc: 'Submit company information, business documents, funding requirements, and supporting details.',
  },
  {
    step: '3',
    icon: '🛡️',
    title: 'Verification and Review',
    desc: 'The relevant team reviews your information and updates the status.',
  },
  {
    step: '4',
    icon: '👥',
    title: 'Explore Investor Connections',
    desc: 'Connect with potential investors and follow the applicable funding process.',
  },
];

const HowItWorksSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Fast-triggering scroll tracking: starts as soon as top edge touches viewport bottom
  // and reaches full spread early (by the time the top is 65% down the screen)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'start 55%'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 24,
    mass: 0.6,
  });

  // Calculate horizontal spread offsets
  // Complete full spread quickly as soon as the section enters the viewport
  const spreadX1 = useTransform(smoothProgress, [0, 1], [180, 0]);
  const spreadX2 = useTransform(smoothProgress, [0, 1], [60, 0]);
  const spreadX3 = useTransform(smoothProgress, [0, 1], [-60, 0]);
  const spreadX4 = useTransform(smoothProgress, [0, 1], [-180, 0]);

  // Opacity & vertical entrance
  const cardsOpacity = useTransform(smoothProgress, [0, 0.4], [0.5, 1]);
  const cardsY = useTransform(smoothProgress, [0, 0.8], [20, 0]);

  const xTransforms = [spreadX1, spreadX2, spreadX3, spreadX4];

  return (
    <section id="how-it-works" ref={containerRef} className="py-20 bg-[#FFFDF7] overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-left mb-12">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B37400] block mb-1">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl font-extrabold text-[#1F2421] tracking-tight font-display">
            Your Journey to Funding in 4 Simple Steps
          </h2>
        </div>

        {/* Desktop Interactive Animated Row */}
        <div className="relative">
          {/* Cards Grid: 4 items in a clean single row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10 items-stretch">
            {stepsData.map((st, idx) => (
              <motion.div
                key={idx}
                style={{
                  x: typeof window !== 'undefined' && window.innerWidth >= 1024 ? xTransforms[idx] : 0,
                  y: cardsY,
                  opacity: cardsOpacity,
                }}
                transition={{ duration: 0.4 }}
                className="p-6 rounded-2xl bg-white border border-[#EFE8D8] shadow-sm relative flex flex-col justify-between hover:border-[#F4B41A] hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {/* Numbered Yellow Circle with subtle glow */}
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-[#F4B41A] text-[#1F2421] font-extrabold text-sm flex items-center justify-center shadow-md relative z-10 transition-transform duration-300 group-hover:scale-110">
                        {st.step}
                      </div>
                      <div className="absolute inset-0 rounded-full bg-[#F4B41A]/30 blur-[4px] -z-0"></div>
                    </div>

                    <span className="text-lg opacity-85 group-hover:scale-110 transition-transform">
                      {st.icon}
                    </span>
                  </div>

                  <h4 className="text-[14.5px] font-bold text-[#1F2421] mb-2 font-display">
                    {st.title}
                  </h4>
                  <p className="text-[12px] text-[#6B7280] leading-relaxed">{st.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const CompanyLandingPage: React.FC = () => {
  const [activeFaqIndex, setActiveFaqIndex] = useState(0);
  const [isFaqPaused, setIsFaqPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const faqs = [
    {
      id: 1,
      category: 'ELIGIBILITY',
      q: 'Who can register as a company on Connect Invest?',
      a: 'Incorporated Private Limited companies, Public Limited companies, and Limited Liability Partnerships (LLPs) registered under MCA India can register and raise capital through Connect Invest.'
    },
    {
      id: 2,
      category: 'FUNDING PROCESS',
      q: 'How do I apply for funding?',
      a: 'Complete your 5-step company onboarding, submit corporate statutory documents for MCA verification, configure your funding round terms (Fixed-Term Yield or Equity), and publish to verified accredited investors.'
    },
    {
      id: 3,
      category: 'DOCUMENTATION',
      q: 'What statutory documents are required for onboarding?',
      a: 'Certificate of Incorporation (COI), Company PAN, GST Registration, latest Audited Financial Statements, MOA & AOA, and authorized director identification proofs.'
    },
    {
      id: 4,
      category: 'INSTRUMENTS',
      q: 'What types of fundraising structures are supported?',
      a: 'Companies can issue Fixed-Term Debentures with customized monthly/quarterly coupon returns (typically 12%-18% p.a.) or structured Direct Equity investment tranches.'
    },
    {
      id: 5,
      category: 'DISBURSEMENT',
      q: 'When and how are subscribed funds disbursed?',
      a: 'Upon successful closure of your funding round and escrow verification, funds are directly wired via automated banking clearing to your verified corporate current account.'
    },
    {
      id: 6,
      category: 'COMPLIANCE',
      q: 'Does registration guarantee immediate funding?',
      a: 'Registration connects your company with thousands of accredited investors and streamlines legal diligence, while funding velocity is determined by investor subscription and compliance verification.'
    }
  ];

  const totalFaqs = faqs.length;

  const nextFaq = () => {
    setActiveFaqIndex((prev) => (prev + 1) % totalFaqs);
  };

  const prevFaq = () => {
    setActiveFaqIndex((prev) => (prev - 1 + totalFaqs) % totalFaqs);
  };

  // Auto-slide every 6 seconds when not hovered
  useEffect(() => {
    if (isFaqPaused) return;
    const interval = setInterval(nextFaq, 6000);
    return () => clearInterval(interval);
  }, [isFaqPaused, totalFaqs]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsFaqPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextFaq();
      else prevFaq();
    }
    touchStartXRef.current = null;
    setIsFaqPaused(false);
  };

  const getFaqCardStyle = (idx: number) => {
    let diff = (idx - activeFaqIndex) % totalFaqs;
    if (diff < -Math.floor(totalFaqs / 2)) diff += totalFaqs;
    if (diff > Math.floor((totalFaqs - 1) / 2)) diff -= totalFaqs;

    // Active Card (Front & Center)
    if (diff === 0) {
      return {
        transform: 'translate3d(0, 0, 0) scale(1)',
        zIndex: 10,
        opacity: 1,
        pointerEvents: 'auto' as const,
        boxShadow: '0 20px 45px rgba(222, 142, 10, 0.15), 0 4px 12px rgba(0, 0, 0, 0.04)',
        borderColor: '#DE8E0A',
        cursor: 'default'
      };
    }

    // Inner Right Card
    if (diff === 1) {
      return {
        transform: 'translate3d(42%, 0, -35px) scale(0.92)',
        zIndex: 7,
        opacity: 0.82,
        pointerEvents: 'auto' as const,
        cursor: 'pointer',
        boxShadow: '0 10px 24px rgba(0, 0, 0, 0.05)',
        borderColor: '#ECE5DE'
      };
    }

    // Outer Right Card
    if (diff === 2) {
      return {
        transform: 'translate3d(78%, 0, -70px) scale(0.85)',
        zIndex: 4,
        opacity: 0.55,
        pointerEvents: 'auto' as const,
        cursor: 'pointer',
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.03)',
        borderColor: '#ECE5DE'
      };
    }

    // Inner Left Card
    if (diff === -1) {
      return {
        transform: 'translate3d(-42%, 0, -35px) scale(0.92)',
        zIndex: 7,
        opacity: 0.82,
        pointerEvents: 'auto' as const,
        cursor: 'pointer',
        boxShadow: '0 10px 24px rgba(0, 0, 0, 0.05)',
        borderColor: '#ECE5DE'
      };
    }

    // Outer Left Card
    if (diff === -2) {
      return {
        transform: 'translate3d(-78%, 0, -70px) scale(0.85)',
        zIndex: 4,
        opacity: 0.55,
        pointerEvents: 'auto' as const,
        cursor: 'pointer',
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.03)',
        borderColor: '#ECE5DE'
      };
    }

    // Hidden Card
    return {
      transform: 'translate3d(0, 0, -120px) scale(0.75)',
      zIndex: 1,
      opacity: 0,
      pointerEvents: 'none' as const,
      borderColor: '#ECE5DE'
    };
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1F2421] font-sans antialiased selection:bg-[#E8A51D] selection:text-white">
      {/* 1. TOP NAVBAR (Shared across all pages) */}
      <PublicNavbar />

      {/* 2. HERO SECTION */}
      <section className="relative pt-10 pb-16 overflow-hidden bg-gradient-to-b from-[#FFFDF7] via-[#FFF9ED] to-[#FFFDF7]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-end">
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-5 pb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B37400] block">
                FOR BUSINESSES & STARTUPS
              </span>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1F2421] leading-[1.12] tracking-tight font-display">
                Turn Your Business Vision Into Growth With{' '}
                <span className="text-[#DE8E0A]">Connect Invest.</span>
              </h1>

              <p className="text-[14.5px] text-[#556171] leading-relaxed max-w-[480px]">
                Connect Invest helps businesses connect with potential investors, explore funding opportunities, and build meaningful investment relationships. Present your business ideas, share your funding requirements, and take the next step toward your company’s growth through one centralized platform.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/company/register"
                  className="px-6 py-3 rounded-full bg-[#F4B41A] hover:bg-[#E8A51D] text-[#1F2421] font-bold text-[13.5px] shadow-sm hover:shadow transition-all inline-flex items-center gap-1.5"
                >
                  <span>Register Your Company</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  to="/how-it-works"
                  className="px-5 py-3 rounded-full bg-white hover:bg-[#FFF9ED] text-[#374151] font-semibold text-[13.5px] border border-[#E5E0D0] transition-all inline-flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded-full bg-[#DE8E0A] text-white flex items-center justify-center text-[9px] pl-0.5">
                    ▶
                  </div>
                  <span>How It Works</span>
                </Link>
              </div>
            </div>

            {/* Right Hero Graphic with Modern Architecture and Badges */}
            <div className="lg:col-span-7 relative flex items-center justify-center pt-4 lg:pt-0">
              <div className="relative w-full max-w-[740px]">
                {/* Subtle warm ambient yellow/amber radial glow behind the building */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[85%] bg-[#F4B41A]/15 rounded-full blur-3xl pointer-events-none"></div>

                {/* Main Building Image with natural soft shadow, completely borderless */}
                <div className="relative z-10 flex items-center justify-center pointer-events-none select-none">
                  <img
                    src={heroCompanyBuildingImg}
                    alt="Modern Corporate Headquarters with Verified Investor Network"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    className="w-full h-auto object-contain max-h-[580px] select-none pointer-events-none filter drop-shadow-[0_20px_35px_rgba(31,36,33,0.12)] transition-transform duration-500 hover:scale-[1.01]"
                  />
                </div>

                {/* Floating Badge 1 - Top Right: Funding Opportunities */}
                <div className="absolute -top-2 right-2 sm:right-8 z-20 animate-float-card-1">
                  <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#F4E9CD] shadow-lg flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#F4B41A]/20 text-[#B37400] flex items-center justify-center font-bold">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[12px] font-bold text-[#1F2421] block leading-tight">Funding</span>
                      <span className="text-[10.5px] text-[#78716C] leading-tight">Opportunities</span>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 2 - Mid Left: Investor Connections */}
                <div className="absolute top-1/2 -left-2 sm:-left-4 z-20 animate-float-card-2">
                  <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#F4E9CD] shadow-lg flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#DE8E0A]/20 text-[#B37400] flex items-center justify-center font-bold">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[12px] font-bold text-[#1F2421] block leading-tight">Investor</span>
                      <span className="text-[10.5px] text-[#78716C] leading-tight">Connections</span>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 3 - Mid Right: Your Growth Our Support */}
                <div className="absolute bottom-10 -right-2 sm:-right-4 z-20 animate-float-card-3">
                  <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#F4E9CD] shadow-lg flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#F4B41A]/25 text-[#1F2421] flex items-center justify-center font-bold">
                      <ShieldCheck className="w-4 h-4 text-[#B37400]" />
                    </div>
                    <div>
                      <span className="text-[12px] font-bold text-[#1F2421] block leading-tight">Your Growth</span>
                      <span className="text-[10.5px] text-[#78716C] leading-tight">Our Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Feature Ribbon Badges under Hero */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              {
                icon: Users,
                title: 'Investor Connections',
                desc: 'Build connections with potential investors.',
              },
              {
                icon: TrendingUp,
                title: 'Business Growth',
                desc: 'Present your plans and funding needs.',
              },
              {
                icon: Briefcase,
                title: 'Funding Opportunities',
                desc: 'Explore suitable funding options.',
              },
              {
                icon: ShieldCheck,
                title: 'Structured Verification',
                desc: 'Submit business information for review.',
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white border border-[#EFE8D8] shadow-sm flex items-center gap-3.5 hover:border-[#F4B41A] transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-[#FFF4D6] text-[#B37400] flex items-center justify-center flex-shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-[#1F2421] leading-tight font-display">
                      {card.title}
                    </h4>
                    <p className="text-[11px] text-[#6B7280] leading-snug mt-0.5">{card.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. ABOUT CONNECT INVEST: Empowering Businesses Through Investment Connections */}
      <section id="about" className="py-16 bg-[#FFFDF7]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left Graphic with Team Meeting - Matching height with right side content */}
            <div className="lg:col-span-5 flex">
              <div className="relative w-full rounded-3xl overflow-hidden shadow-md border border-[#F4E9CD] flex flex-col group">
                <img
                  src={teamMeetingImg}
                  alt="Empowering Businesses Through Investment Connections"
                  className="w-full h-full object-cover min-h-[360px]"
                />
              </div>
            </div>

            {/* Right Text Details */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B37400] block">
                ABOUT CONNECT INVEST
              </span>

              <h2 className="text-3xl font-extrabold text-[#1F2421] tracking-tight font-display">
                Empowering Businesses Through{' '}
                <span className="text-[#DE8E0A]">Investment Connections</span>
              </h2>

              <p className="text-[13.5px] text-[#556171] leading-relaxed">
                Connect Invest is a platform designed to bring businesses and investors together. It provides a structured process for companies to submit their details, communicate their funding requirements, and explore potential investment relationships.
              </p>

              <div className="pt-1">
                <span className="text-[13px] font-bold text-[#1F2421] block mb-2">
                  Our platform helps companies to:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[12.5px] text-[#4B5563]">
                  {[
                    'Create and maintain a company profile.',
                    'Share business information and growth plans.',
                    'Submit funding requirements for review.',
                    'Explore relevant investment opportunities.',
                    'Track application and verification progress.',
                    'Manage investor connections and communications.',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-[#DE8E0A] font-bold text-[14px]">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/company/register"
                  className="px-6 py-2.5 rounded-full bg-[#F4B41A] hover:bg-[#E8A51D] text-[#1F2421] font-bold text-[13px] shadow-sm inline-flex items-center gap-1.5"
                >
                  <span>Discover Our Platform</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FUNDING OPPORTUNITIES: Find the Right Path for Your Business */}
      <section id="opportunities" className="py-16 bg-[#FFF9ED] border-y border-[#F2EBD9]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B37400] block mb-1">
              FUNDING OPPORTUNITIES
            </span>
            <h2 className="text-3xl font-extrabold text-[#1F2421] tracking-tight font-display">
              Find the Right Path for Your Business
            </h2>
            <p className="text-[13.5px] text-[#556171] max-w-2xl mt-1">
              Every business has different funding needs. Connect Invest enables companies to present their requirements and explore available opportunities, subject to platform eligibility and review.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* 4 Opportunities Cards (2x2 grid) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Rocket,
                  title: 'Startup Funding',
                  desc: 'Early-stage businesses & innovative ideas seeking angel backing.',
                  highlights: ['Ticket: ₹25L - ₹2 Cr', 'Tenure: 12-24 Mo'],
                  tag: 'Seed & Angels',
                },
                {
                  icon: TrendingUp,
                  title: 'Business Expansion',
                  desc: 'Scale operations, infrastructure, or enter new market domains.',
                  highlights: ['Ticket: ₹1 Cr - ₹10 Cr', 'Yield: 14%-18% p.a.'],
                  tag: 'Growth Capital',
                },
                {
                  icon: ShoppingCart,
                  title: 'E-commerce Growth',
                  desc: 'Scale online operations, inventory stock, and logistics technology.',
                  highlights: ['Ticket: ₹50L - ₹3 Cr', 'Zero Dilution Option'],
                  tag: 'Inventory & Tech',
                },
                {
                  icon: Handshake,
                  title: 'Strategic Investment',
                  desc: 'Long-term equity & advisory syndicates with strategic angels.',
                  highlights: ['Ticket: Custom Rounds', 'Equity Structuring'],
                  tag: 'Syndicate & Equity',
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 rounded-xl bg-white border border-[#EFE8D8] shadow-sm flex flex-col justify-between hover:border-[#F4B41A] hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#FFF4D6] text-[#B37400] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Icon size={16} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-[13px] font-bold text-[#1F2421] font-display leading-tight">
                            {item.title}
                          </h4>
                          <p className="text-[10.5px] text-[#6B7280] leading-snug mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      {/* Compact Highlights Pills */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5 bg-[#FFFDF7] p-2 rounded-lg border border-[#F4E9CD]/70">
                        {item.highlights.map((h, hIdx) => (
                          <div key={hIdx} className="flex items-center text-[10px] text-[#556171] mr-1.5">
                            <CheckCircle2 className="w-3 h-3 text-[#059669] mr-1 shrink-0" />
                            <span className="font-medium">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-[#FBF6EC] flex items-center justify-between text-[10.5px]">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#FFF9ED] text-[#B37400] font-semibold text-[10px]">
                        {item.tag}
                      </span>
                      <span className="font-bold text-[#DE8E0A] group-hover:text-[#B37400] inline-flex items-center gap-1 transition-colors">
                        <span>Details</span>
                        <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Laptop Growth Graphic - Compact and balanced height with the 4 cards */}
            <div className="lg:col-span-5 flex">
              <div className="relative w-full rounded-2xl overflow-hidden shadow-sm border border-[#F4E9CD] flex flex-col">
                <img
                  src={laptopGrowthImg}
                  alt="Business Growth & Financial Scaling on Connect Invest"
                  className="w-full h-full object-cover max-h-[310px] min-h-[220px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS: Your Journey to Funding in 4 Simple Steps */}
      <HowItWorksSection />

      {/* 6. WHO CAN USE CONNECT INVEST? Suitable for a Wide Range of Businesses */}
      <section id="suitable" className="py-16 bg-[#FFF9ED] border-y border-[#F2EBD9]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-10">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B37400] block mb-1">
              WHO CAN USE CONNECT INVEST?
            </span>
            <h2 className="text-3xl font-extrabold text-[#1F2421] tracking-tight font-display">
              Suitable for a Wide Range of Businesses
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                img: cardStartupsImg,
                title: 'Startups',
                desc: 'Bring your ideas to life with funding support.',
              },
              {
                img: cardGrowingImg,
                title: 'Growing Businesses',
                desc: 'Fuel your expansion and reach new markets.',
              },
              {
                img: cardEstablishedImg,
                title: 'Established Companies',
                desc: 'Access capital for new initiatives and innovation.',
              },
              {
                img: cardEcommerceImg,
                title: 'E-commerce Businesses',
                desc: 'Scale your operations and strengthen your digital presence.',
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-[#EFE8D8] overflow-hidden shadow-sm hover:border-[#F4B41A] transition-all flex flex-col"
              >
                <div className="h-28 w-full overflow-hidden bg-slate-100">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-1">
                  <h4 className="text-[14px] font-bold text-[#1F2421] font-display">
                    {card.title}
                  </h4>
                  <p className="text-[11.5px] text-[#6B7280] leading-snug mt-1">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS - Single Continuous Rolling / Moving Cards Line */}
      <section id="faq" className="py-20 bg-[#FAF8F5] overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center relative mb-12">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B37400] block mb-1">
              HELP & SUPPORT
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2421] font-display mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto">
              Quick answers to common questions about raising capital, legal verification, and investor disbursements.
            </p>
          </div>
        </div>

        {/* Continuous Single-Line Moving Cards (Marquee / Carousel Track) */}
        <div className="relative w-full overflow-hidden py-4">
          {/* Soft Left and Right Gradient Fades */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-r from-[#FAF8F5] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-l from-[#FAF8F5] to-transparent z-10" />

          <div className="rolling-track">
            {/* First Set of Cards */}
            <div className="flex gap-5 shrink-0 pr-5">
              {faqs.map((faq) => (
                <div
                  key={`a-${faq.id}`}
                  className="w-[340px] sm:w-[380px] bg-white rounded-2xl border border-[#EFE8D8] p-6 shadow-sm hover:shadow-md hover:border-[#DE8E0A] transition-all flex flex-col justify-between shrink-0"
                >
                  <div>
                    {/* Top: Category Tag + Index */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#B37400] bg-[#FFF9ED] border border-[#F4E9CD] px-2.5 py-0.5 rounded-full">
                        {faq.category}
                      </span>
                      <span className="text-xs font-bold text-[#94A3B8] tracking-wider">
                        0{faq.id} / 0{totalFaqs}
                      </span>
                    </div>

                    {/* Question Title */}
                    <h3 className="text-[15.5px] font-extrabold text-[#1F2421] font-display mb-2.5 leading-snug">
                      {faq.q}
                    </h3>

                    {/* Gold Divider Line */}
                    <div className="w-8 h-1 bg-[#DE8E0A] rounded-full mb-3" />

                    {/* Answer */}
                    <p className="text-[12.5px] text-[#475569] leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Second Duplicate Set for Seamless Infinite Smooth Loop */}
            <div className="flex gap-5 shrink-0 pr-5">
              {faqs.map((faq) => (
                <div
                  key={`b-${faq.id}`}
                  className="w-[340px] sm:w-[380px] bg-white rounded-2xl border border-[#EFE8D8] p-6 shadow-sm hover:shadow-md hover:border-[#DE8E0A] transition-all flex flex-col justify-between shrink-0"
                >
                  <div>
                    {/* Top: Category Tag + Index */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#B37400] bg-[#FFF9ED] border border-[#F4E9CD] px-2.5 py-0.5 rounded-full">
                        {faq.category}
                      </span>
                      <span className="text-xs font-bold text-[#94A3B8] tracking-wider">
                        0{faq.id} / 0{totalFaqs}
                      </span>
                    </div>

                    {/* Question Title */}
                    <h3 className="text-[15.5px] font-extrabold text-[#1F2421] font-display mb-2.5 leading-snug">
                      {faq.q}
                    </h3>

                    {/* Gold Divider Line */}
                    <div className="w-8 h-1 bg-[#DE8E0A] rounded-full mb-3" />

                    {/* Answer */}
                    <p className="text-[12.5px] text-[#475569] leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <PublicFooter />
    </div>
  );
};
