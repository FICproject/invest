import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShieldCheck,
  Users,
  ArrowRight,
  CheckCircle2,
  Lock,
  Headphones,
  Leaf,
  Building2,
  Plus,
  Minus,
  X
} from 'lucide-react';
import './common-landing.css';

export const CommonLandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowRoleModal(false);
        setShowFaqModal(false);
      }
    };
    if (showRoleModal || showFaqModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showRoleModal, showFaqModal]);

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'How do I start investing?',
      a: 'Sign up as an Investor, complete your quick digital KYC verification, browse vetted company and project opportunities, and allocate capital starting from flexible minimum amounts.'
    },
    {
      q: 'What is the minimum investment amount?',
      a: 'Minimum investment amounts vary depending on the chosen project or company tier, with accessible entry tickets designed for retail investors and scaled tiers for accredited HNIs.'
    },
    {
      q: 'How does the funding process work for companies?',
      a: 'Companies submit an online application with business credentials and growth proposals. Once audited and verified by our compliance team, their listing goes live to active investors.'
    },
    {
      q: 'What are the investment durations?',
      a: 'We offer flexible tenures ranging from short-term project-backed investments (minimum 2 years) to long-term equity growth partnerships (5+ years).'
    }
  ];

  return (
    <div className="cl-page">
      {/* ======================================================== */}
      {/* 1. TOP HEADER / NAVBAR                                   */}
      {/* ======================================================== */}
      <header className="cl-header">
        <div className="cl-container cl-header-inner">
          {/* Logo */}
          <Link to="/" className="cl-logo">
            <img
              src="/logo.png"
              alt="Forge India Connect"
              className="cl-logo-img"
            />
            <div className="cl-logo-text">
              <div className="cl-brand-row">
                <span className="cl-brand-blue">Connect</span>
                <span className="cl-brand-gold">Invest</span>
              </div>
              <span className="cl-tagline">INVEST • FUND • GROW</span>
            </div>
          </Link>

          {/* Navigation Menu */}
          <nav className="cl-nav">
            <a href="#home" className="cl-nav-link active">Home</a>
            <a href="#about" className="cl-nav-link">About</a>
            <a href="#opportunities" className="cl-nav-link">Opportunities</a>
            <a href="#how-it-works" className="cl-nav-link">How It Works</a>
            <a href="#faqs" className="cl-nav-link">FAQs</a>
          </nav>

          {/* Auth CTA Buttons */}
          <div className="cl-auth-actions">
            <button
              type="button"
              onClick={() => setShowRoleModal(true)}
              className="cl-btn-getstarted"
              style={{ cursor: 'pointer', border: 'none' }}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Role Selection Modal on Get Started */}
      {showRoleModal && (
        <div
          className="cl-modal-overlay"
          onClick={() => setShowRoleModal(false)}
        >
          <div
            className="cl-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cl-modal-top-accent" />
            <button
              type="button"
              className="cl-modal-close-btn"
              onClick={() => setShowRoleModal(false)}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="cl-modal-body">
              <div className="cl-modal-header">
                <span className="cl-modal-tag">Join Connect Invest</span>
                <h2 className="cl-modal-title">How would you like to get started?</h2>
                <p className="cl-modal-subtitle">
                  Choose your account type to proceed with registration and onboarding
                </p>
              </div>

              <div className="cl-modal-cards-grid">
                {/* Investor Option */}
                <Link
                  to="/register?role=investor"
                  className="cl-modal-role-card"
                  onClick={() => setShowRoleModal(false)}
                >
                  <div>
                    <span className="cl-modal-role-badge investor">For Investors</span>
                    <div className="cl-modal-icon-circle investor">
                      <Users size={24} />
                    </div>
                    <h3 className="cl-modal-role-title">I am an Investor</h3>
                    <p className="cl-modal-role-desc">
                      Invest in vetted private opportunities, earn predictable monthly returns, and build your wealth.
                    </p>
                    <ul className="cl-modal-role-perks">
                      <li><CheckCircle2 size={13} color="#F5B014" /> Minimum ticket from ₹10,000</li>
                      <li><CheckCircle2 size={13} color="#F5B014" /> Fixed-term debentures & equity</li>
                      <li><CheckCircle2 size={13} color="#F5B014" /> Automated verified payouts</li>
                    </ul>
                  </div>
                  <div className="cl-modal-role-btn investor">
                    <span>Register as Investor</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>

                {/* Company Option */}
                <Link
                  to="/register?role=company"
                  className="cl-modal-role-card"
                  onClick={() => setShowRoleModal(false)}
                >
                  <div>
                    <span className="cl-modal-role-badge company">For Companies</span>
                    <div className="cl-modal-icon-circle company">
                      <Building2 size={24} />
                    </div>
                    <h3 className="cl-modal-role-title">I am a Company</h3>
                    <p className="cl-modal-role-desc">
                      Raise growth capital, issue debentures or equity, and access active accredited investor syndicates.
                    </p>
                    <ul className="cl-modal-role-perks">
                      <li><CheckCircle2 size={13} color="#B37400" /> Fast-track fundraising approvals</li>
                      <li><CheckCircle2 size={13} color="#B37400" /> Flexible capital structuring</li>
                      <li><CheckCircle2 size={13} color="#B37400" /> Complete corporate governance tools</li>
                    </ul>
                  </div>
                  <div className="cl-modal-role-btn company">
                    <span>Register as Company</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>
              </div>

              <div className="cl-modal-footer">
                Already have an account? <Link to="/login" onClick={() => setShowRoleModal(false)}>Sign In</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Choice Modal (Investor FAQs vs Company FAQs) */}
      {showFaqModal && (
        <div
          className="cl-modal-overlay"
          onClick={() => setShowFaqModal(false)}
        >
          <div
            className="cl-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cl-modal-top-accent" />
            <button
              type="button"
              className="cl-modal-close-btn"
              onClick={() => setShowFaqModal(false)}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="cl-modal-body">
              <div className="cl-modal-header">
                <span className="cl-modal-tag">Help & Knowledge Base</span>
                <h2 className="cl-modal-title">Which FAQs would you like to explore?</h2>
                <p className="cl-modal-subtitle">
                  Select your topic of interest to view comprehensive questions & answers
                </p>
              </div>

              <div className="cl-modal-cards-grid">
                {/* Investor FAQs */}
                <Link
                  to="/faqs"
                  className="cl-modal-role-card"
                  onClick={() => setShowFaqModal(false)}
                >
                  <div>
                    <span className="cl-modal-role-badge investor">Investor Knowledge Base</span>
                    <div className="cl-modal-icon-circle investor">
                      <Users size={24} />
                    </div>
                    <h3 className="cl-modal-role-title">Investor FAQs</h3>
                    <p className="cl-modal-role-desc">
                      Questions on returns, liquidity, secondary windows, KYC, tax certificates, and risk management.
                    </p>
                    <ul className="cl-modal-role-perks">
                      <li><CheckCircle2 size={13} color="#F5B014" /> Payout dates & taxation</li>
                      <li><CheckCircle2 size={13} color="#F5B014" /> Minimum investment rules</li>
                      <li><CheckCircle2 size={13} color="#F5B014" /> Security & legal remedies</li>
                    </ul>
                  </div>
                  <div className="cl-modal-role-btn investor">
                    <span>View Investor FAQs</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>

                {/* Company FAQs */}
                <Link
                  to="/company#faq"
                  className="cl-modal-role-card"
                  onClick={() => setShowFaqModal(false)}
                >
                  <div>
                    <span className="cl-modal-role-badge company">Corporate Knowledge Base</span>
                    <div className="cl-modal-icon-circle company">
                      <Building2 size={24} />
                    </div>
                    <h3 className="cl-modal-role-title">Company FAQs</h3>
                    <p className="cl-modal-role-desc">
                      Questions on raising capital, statutory filings, MCA verification, debenture issuances, and disbursals.
                    </p>
                    <ul className="cl-modal-role-perks">
                      <li><CheckCircle2 size={13} color="#B37400" /> Eligibility & criteria</li>
                      <li><CheckCircle2 size={13} color="#B37400" /> Required corporate documents</li>
                      <li><CheckCircle2 size={13} color="#B37400" /> Fundraising timeframes</li>
                    </ul>
                  </div>
                  <div className="cl-modal-role-btn company">
                    <span>View Company FAQs</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. HERO SECTION                                          */}
      {/* ======================================================== */}
      <section id="home" className="cl-hero-section">
        <div className="cl-container cl-hero-grid">
          {/* Left Text Column */}
          <div className="cl-hero-content">
            <div className="cl-badge-growth">
              <Leaf size={14} className="cl-badge-icon" />
              <span>Your Growth Partner</span>
            </div>

            <h1 className="cl-hero-title">
              <span className="cl-title-dark">Connect </span>
              <span className="cl-title-gold">Invest</span><br />
              Bridging <span className="cl-title-gold">Investors</span><br />
              and Growing <span className="cl-title-gold">Companies</span>
            </h1>

            <p className="cl-hero-subtitle">
              A trusted platform that connects investors with promising companies and projects,
              creating opportunities for mutual growth and long-term success.
            </p>

            <div className="cl-hero-buttons">
              <Link to="/investor" className="cl-btn-hero-investor">
                <Users size={17} />
                <span>I'm an Investor</span>
                <ArrowRight size={16} />
              </Link>

              <Link to="/company" className="cl-btn-hero-company">
                <Building2 size={17} />
                <span>I'm a Company</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Right Hero Visual Column with Growth Coins Graphic */}
          <div className="cl-hero-visual-wrapper">
            <div className="cl-hero-art">
              <img
                src="/hero-coins-blended.png"
                alt="Connect Invest Wealth Growth with City Skyline and Coins"
                className="cl-hero-img"
              />
            </div>
          </div>
        </div>

        {/* Decorative Wave Bottom Sweep */}
        <div className="cl-hero-blue-wave"></div>
      </section>

      {/* ======================================================== */}
      {/* 3. ABOUT CONNECT INVEST (FULL WIDTH 4 FEATURE CARDS)      */}
      {/* ======================================================== */}
      <section id="about" className="cl-section cl-about-how-section" style={{ padding: '48px 0 28px' }}>
        <div className="cl-container">
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 16px' }}>
            <span className="cl-pill-category">About Connect Invest</span>
            <h2 className="cl-section-h2" style={{ fontSize: '32px', margin: '6px 0 10px' }}>
              A Smarter Way to Invest and Get Funded
            </h2>
            <p className="cl-section-body" style={{ margin: '0 auto' }}>
              Connect Invest is a secure and transparent platform that brings together investors and growing enterprises,
              managing the entire funding lifecycle with end-to-end institutional diligence and regulatory compliance.
            </p>
          </div>

          {/* 4 Feature Cards Grid across Full Width */}
          <div className="cl-pillars-row">
            <div className="cl-pillar-item">
              <div className="cl-pillar-circle">
                <ShieldCheck size={24} />
              </div>
              <h4 className="cl-pillar-title">Secure & Trusted</h4>
              <p className="cl-pillar-desc">
                Institutional-grade underwriting, legal diligence, and regulated escrow custody for every transaction.
              </p>
            </div>

            <div className="cl-pillar-item">
              <div className="cl-pillar-circle">
                <Users size={24} />
              </div>
              <h4 className="cl-pillar-title">Transparent Process</h4>
              <p className="cl-pillar-desc">
                Direct portfolio visibility, clear yield distributions, and zero hidden intermediaries or surprises.
              </p>
            </div>

            <div className="cl-pillar-item">
              <div className="cl-pillar-circle">
                <Leaf size={24} />
              </div>
              <h4 className="cl-pillar-title">Sustainable Growth</h4>
              <p className="cl-pillar-desc">
                Empowering viable businesses to scale while delivering dependable, fixed-tenure wealth returns.
              </p>
            </div>

            <div className="cl-pillar-item">
              <div className="cl-pillar-circle">
                <TrendingUp size={24} />
              </div>
              <h4 className="cl-pillar-title">Win-Win Opportunities</h4>
              <p className="cl-pillar-desc">
                Balanced capital structures aligned for mutual value creation between investors and founders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. DUAL VALUE PROPOSITIONS (FOR INVESTORS & FOR COMPANIES)*/}
      {/* ======================================================== */}
      <section className="cl-section cl-dual-section">
        <div className="cl-container cl-dual-grid">
          {/* Card 1: For Investors (Royal Blue Card with Plant Image) */}
          <div className="cl-card-investor-blue">
            <div className="cl-card-blue-content">
              <div className="cl-pill-tag-yellow">
                <Users size={14} />
                <span>For Investors</span>
              </div>

              <h3 className="cl-card-blue-title">
                Build Your Wealth with Meaningful Investments
              </h3>
              <p className="cl-card-blue-sub">
                Discover curated investment opportunities in companies and projects with attractive returns and transparent terms.
              </p>

              <ul className="cl-check-list-white">
                <li>
                  <CheckCircle2 size={16} className="cl-check-icon" />
                  <span>Company & Project Investments</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="cl-check-icon" />
                  <span>Minimum Investment: Flexible Options</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="cl-check-icon" />
                  <span>Investment Duration: 2 - 5+ Years</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="cl-check-icon" />
                  <span>Expected Returns: Competitive Rates</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="cl-check-icon" />
                  <span>Secure & Transparent Process</span>
                </li>
              </ul>

              <Link to="/investor" className="cl-btn-yellow-cta">
                <span>Explore Investment Opportunities</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="cl-card-blue-image">
              <img
                src="/plant-in-hands.jpg"
                alt="Hands holding growing plant in soil"
              />
            </div>
          </div>

          {/* Card 2: For Companies (Clean White Card with Glass Buildings) */}
          <div className="cl-card-company-white">
            <div className="cl-card-white-content">
              <div className="cl-pill-tag-yellow">
                <Building2 size={14} />
                <span>For Companies</span>
              </div>

              <h3 className="cl-card-white-title">
                Unlock Funding for Your Next Big Step
              </h3>
              <p className="cl-card-white-sub">
                Access flexible funding options to help your business grow and achieve its goals.
              </p>

              <ul className="cl-check-list-blue">
                <li>
                  <CheckCircle2 size={16} className="cl-check-icon-blue" />
                  <span>Company & Project Investment</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="cl-check-icon-blue" />
                  <span>Short-Term & Long-Term Funding</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="cl-check-icon-blue" />
                  <span>Minimum 2 Years (Project) | 5 Years (Company)</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="cl-check-icon-blue" />
                  <span>Simple Funding Request Process</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="cl-check-icon-blue" />
                  <span>Trusted & Reliable Partner</span>
                </li>
              </ul>

              <Link to="/company" className="cl-btn-yellow-cta">
                <span>Explore Funding Opportunities</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="cl-card-white-image">
              <img
                src="/modern-glass-buildings.jpg"
                alt="Modern corporate glass skyscrapers"
              />
              <div className="cl-card-wave-corner"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. HOW IT WORKS (STEP-BY-STEP INTERACTIVE CARDS)         */}
      {/* ======================================================== */}
      <section id="how-it-works" className="cl-section" style={{ padding: '48px 0 32px' }}>
        <div className="cl-container">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span className="cl-pill-category">How It Works</span>
            <h3 className="cl-section-h2" style={{ fontSize: '30px', margin: '4px 0 8px' }}>A Simple 3-Step Process</h3>
            <p className="cl-section-body" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Clear, transparent, and structured process connecting investors and high-growth companies seamlessly.
            </p>
          </div>

          <div className="cl-steps-horizontal">
            {/* Step 1 */}
            <div className="cl-step-card">
              <div className="cl-step-card-header">
                <div className="cl-step-circle cl-step-blue">
                  <Users size={24} />
                </div>
                <span className="cl-step-num-badge">STEP 01</span>
              </div>
              <h4 className="cl-step-title">Investors Explore & Commit</h4>
              <p className="cl-step-text">
                Accredited investors browse verified company & project issuances, review diligence reports, and commit capital online.
              </p>
              <ul className="cl-step-points">
                <li><CheckCircle2 size={14} /> ₹10,000 Accessible Entry</li>
                <li><CheckCircle2 size={14} /> Full Legal Due Diligence</li>
                <li><CheckCircle2 size={14} /> 100% Paperless KYC & Allotment</li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="cl-step-card">
              <div className="cl-step-card-header">
                <div className="cl-step-circle cl-step-gold">
                  <ShieldCheck size={24} />
                </div>
                <span className="cl-step-num-badge">STEP 02</span>
              </div>
              <h4 className="cl-step-title">Connect Invest Manages</h4>
              <p className="cl-step-text">
                Connect Invest acts as the trusted intermediary: managing subscriptions, escrow escrow settlements, and corporate compliance.
              </p>
              <ul className="cl-step-points">
                <li><CheckCircle2 size={14} /> Escrow Account Routing</li>
                <li><CheckCircle2 size={14} /> Regulatory & MCA Compliance</li>
                <li><CheckCircle2 size={14} /> Automated Monthly Interest/Yield</li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="cl-step-card">
              <div className="cl-step-card-header">
                <div className="cl-step-circle cl-step-blue">
                  <Building2 size={24} />
                </div>
                <span className="cl-step-num-badge">STEP 03</span>
              </div>
              <h4 className="cl-step-title">Companies Accelerate Growth</h4>
              <p className="cl-step-text">
                Enterprises receive disbursals to scale operations, execute infrastructure projects, and report quarterly milestones.
              </p>
              <ul className="cl-step-points">
                <li><CheckCircle2 size={14} /> Direct Capital Disbursal</li>
                <li><CheckCircle2 size={14} /> Investor Dashboard & Reporting</li>
                <li><CheckCircle2 size={14} /> Timely Structured Redemption</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. INVESTMENT OPPORTUNITIES PREVIEW                      */}
      {/* ======================================================== */}
      <section id="opportunities" className="cl-section cl-opps-section">
        <div className="cl-container">
          <div className="cl-opps-box">
            <div className="cl-opps-left">
              <div className="cl-pill-tag-yellow" style={{ marginBottom: '12px' }}>
                <TrendingUp size={14} />
                <span>Investment Opportunities</span>
              </div>
              <h2 className="cl-section-h2" style={{ marginBottom: '8px' }}>
                Investment Opportunities
              </h2>
              <p className="cl-section-body" style={{ maxWidth: '480px', marginBottom: '20px' }}>
                Explore a range of verified company and project opportunities with attractive returns and flexible investment options.
              </p>
              <Link to="/opportunities" className="cl-btn-yellow-cta" style={{ width: 'fit-content' }}>
                <span>View All Opportunities</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="cl-opps-cards-row">
              {/* Card 1: Company Investments */}
              <div className="cl-opp-type-card">
                <div className="cl-opp-thumb">
                  <img
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80"
                    alt="Corporate Business Office"
                  />
                </div>
                <div className="cl-opp-info">
                  <h4>Company Investments</h4>
                  <p>Invest in established and growing companies.</p>
                  <Link to="/opportunities" className="cl-link-arrow">
                    <span>View Opportunities</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Card 2: Project Investments */}
              <div className="cl-opp-type-card">
                <div className="cl-opp-thumb">
                  <img
                    src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80"
                    alt="Sustainable Plant Projects"
                  />
                </div>
                <div className="cl-opp-info">
                  <h4>Project Investments</h4>
                  <p>Support innovative projects with high-growth potential.</p>
                  <Link to="/opportunities" className="cl-link-arrow">
                    <span>View Opportunities</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. WHY CHOOSE CONNECT INVEST                             */}
      {/* ======================================================== */}
      <section className="cl-section cl-why-section">
        <div className="cl-container">
          <div className="cl-why-header">
            <h2 className="cl-section-h2">Why Choose Connect Invest</h2>
            <p className="cl-section-body">Built for Trust. Designed for Growth.</p>
          </div>

          <div className="cl-why-pill-row">
            {/* 1 */}
            <div className="cl-why-pill">
              <div className="cl-why-icon-round cl-bg-darkblue">
                <ShieldCheck size={20} color="#ffffff" />
              </div>
              <div className="cl-why-text">
                <h5>Transparent Process</h5>
                <p>Complete visibility at every step.</p>
              </div>
            </div>

            {/* 2 */}
            <div className="cl-why-pill">
              <div className="cl-why-icon-round cl-bg-gold">
                <Lock size={20} color="#ffffff" />
              </div>
              <div className="cl-why-text">
                <h5>Secure Platform</h5>
                <p>Your data and transactions are protected.</p>
              </div>
            </div>

            {/* 3 */}
            <div className="cl-why-pill">
              <div className="cl-why-icon-round cl-bg-darkblue">
                <TrendingUp size={20} color="#ffffff" />
              </div>
              <div className="cl-why-text">
                <h5>Flexible Investments</h5>
                <p>Multiple options to match your goals.</p>
              </div>
            </div>

            {/* 4 */}
            <div className="cl-why-pill">
              <div className="cl-why-icon-round cl-bg-gold">
                <Headphones size={20} color="#ffffff" />
              </div>
              <div className="cl-why-text">
                <h5>Expert Support</h5>
                <p>Dedicated support for investors and companies.</p>
              </div>
            </div>

            {/* 5 */}
            <div className="cl-why-pill">
              <div className="cl-why-icon-round cl-bg-darkblue">
                <Leaf size={20} color="#ffffff" />
              </div>
              <div className="cl-why-text">
                <h5>Sustainable Impact</h5>
                <p>Building a stronger future together.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. FREQUENTLY ASKED QUESTIONS                            */}
      {/* ======================================================== */}
      <section id="faqs" className="cl-section cl-faq-section">
        <div className="cl-container">
          <div className="cl-faq-box">
            {/* Left FAQ Banner with Mountain Backdrop */}
            <div className="cl-faq-banner">
              <div className="cl-faq-banner-content">
                <h3>Frequently Asked Questions</h3>
                <p>Find answers to common questions from both investors and companies.</p>
                <button
                  type="button"
                  onClick={() => setShowFaqModal(true)}
                  className="cl-btn-banner-faq"
                >
                  <span>View All FAQs</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Right Accordion List */}
            <div className="cl-faq-accordion-col">
              {faqs.map((faq, idx) => (
                <div key={idx} className="cl-faq-row" onClick={() => toggleFaq(idx)}>
                  <div className="cl-faq-question-bar">
                    <span>{faq.q}</span>
                    <button type="button" className="cl-faq-toggle-btn" aria-label="Toggle FAQ">
                      {activeFaq === idx ? <Minus size={15} /> : <Plus size={15} />}
                    </button>
                  </div>
                  {activeFaq === idx && (
                    <div className="cl-faq-answer-body">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. FOOTER CALL-TO-ACTION BANNER (READY TO CREATE...)      */}
      {/* ======================================================== */}
      <section className="cl-bottom-cta-section">
        <div className="cl-container">
          <div className="cl-cta-banner-row">
            <div className="cl-cta-banner-left">
              <div className="cl-cta-leaves-icon">
                <Leaf size={28} />
              </div>
              <div>
                <h3>Ready to Create Your Future?</h3>
                <p>Join Connect Invest today and be part of a growing community of investors and innovative companies.</p>
              </div>
            </div>

            <div className="cl-cta-banner-right">
              <Link to="/investor" className="cl-btn-yellow-cta">
                <span>I'm an Investor</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/company" className="cl-btn-blue-outline-cta">
                <span>I'm a Company</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. BOTTOM FOOTER                                         */}
      {/* ======================================================== */}
      <footer className="cl-footer">
        <div className="cl-container cl-footer-inner">
          <Link to="/" className="cl-logo">
            <img
              src="/logo.png"
              alt="Forge India Connect"
              className="cl-logo-img"
            />
            <div className="cl-logo-text">
              <div className="cl-brand-row">
                <span className="cl-brand-blue">Connect</span>
                <span className="cl-brand-gold">Invest</span>
              </div>
              <span className="cl-tagline">INVEST • FUND • GROW</span>
            </div>
          </Link>

          <div className="cl-footer-links">
            <a href="#privacy">Privacy Policy</a>
            <span className="cl-sep">|</span>
            <a href="#terms">Terms & Conditions</a>
            <span className="cl-sep">|</span>
            <a href="#contact">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CommonLandingPage;
