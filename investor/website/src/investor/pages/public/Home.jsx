import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  ShieldCheck,
  TrendingUp,
  Coins,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Wallet,
  FileText,
  Lock,
  Headphones,
  CheckCircle2,
  Building2,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { InvestmentCard } from '../../components/investment/InvestmentCard';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { investmentService } from '../../services/investmentService';

const WHY_CHOOSE_FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Transparent Information',
    desc: 'Real-time updates on all investment opportunities with verified disclosures.'
  },
  {
    icon: FileText,
    title: 'Clear Terms & Risk Disclosure',
    desc: 'Know the exact legal terms, security structures, and risks before committing capital.'
  },
  {
    icon: Lock,
    title: 'Secure Payment Processing',
    desc: 'Safe and reliable regulated payment gateway integration with bank-grade encryption.'
  },
  {
    icon: Headphones,
    title: 'Tracking & Support',
    desc: 'Monitor your investments in real-time and get dedicated relationship manager support.'
  }
];

export const Home = () => {
  const [featuredOffers, setFeaturedOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [howItWorksVisible, setHowItWorksVisible] = useState(false);
  const howItWorksRef = useRef(null);
  // Hero vertical roll-up words: Growth -> Success -> Wealth -> Future
  const HERO_WORDS = ['Growth', 'Success', 'Wealth', 'Future', 'Growth'];
  const [heroWordIndex, setHeroWordIndex] = useState(0);
  const [isReelResetting, setIsReelResetting] = useState(false);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setHeroWordIndex((prev) => prev + 1);
    }, 2200);

    return () => clearInterval(wordInterval);
  }, []);

  useEffect(() => {
    // When rolling into duplicate 'Growth' at index 4,
    // wait for 0.65s roll animation to finish, then snap back to index 0 with no transition
    if (heroWordIndex === HERO_WORDS.length - 1) {
      const resetTimer = setTimeout(() => {
        setIsReelResetting(true);
        setHeroWordIndex(0);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsReelResetting(false);
          });
        });
      }, 650);

      return () => clearTimeout(resetTimer);
    }
  }, [heroWordIndex]);

  // Stacked Card Carousel State & Handlers
  const [activeFaqIndex, setActiveFaqIndex] = useState(0);
  const [isFaqPaused, setIsFaqPaused] = useState(false);
  const faqTouchStartX = useRef(null);

  const nextFaq = () => {
    setActiveFaqIndex((prev) => (prev + 1) % 6);
  };

  const prevFaq = () => {
    setActiveFaqIndex((prev) => (prev - 1 + 6) % 6);
  };

  // Auto-play: advance cards one-by-one with slow, smooth glide
  // Holds on touch / hover, and resumes normally when moving to another place
  useEffect(() => {
    if (isFaqPaused) return;

    const interval = setInterval(() => {
      setActiveFaqIndex((prev) => (prev + 1) % 6);
    }, 2200);

    return () => clearInterval(interval);
  }, [isFaqPaused]);

  const handleFaqTouchStart = (e) => {
    setIsFaqPaused(true);
    if (e.touches && e.touches.length > 0) {
      faqTouchStartX.current = e.touches[0].clientX;
    }
  };

  const handleFaqTouchEnd = (e) => {
    if (faqTouchStartX.current !== null && e.changedTouches && e.changedTouches.length > 0) {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = faqTouchStartX.current - touchEndX;
      if (diff > 45) {
        nextFaq();
      } else if (diff < -45) {
        prevFaq();
      }
      faqTouchStartX.current = null;
    }
    setIsFaqPaused(false);
  };

  const getFaqCardStyle = (idx) => {
    const total = 6;
    let diff = (idx - activeFaqIndex) % total;
    if (diff < -Math.floor(total / 2)) diff += total;
    if (diff > Math.floor((total - 1) / 2)) diff -= total;

    // Active Card (Front & Center)
    if (diff === 0) {
      return {
        transform: 'translate3d(0, 0, 0) scale(1)',
        zIndex: 10,
        opacity: 1,
        pointerEvents: 'auto',
        boxShadow: '0 20px 45px rgba(74, 14, 23, 0.12), 0 4px 12px rgba(0, 0, 0, 0.04)',
        borderColor: '#C8963E',
        cursor: 'default'
      };
    }

    // Inner Right Card
    if (diff === 1) {
      return {
        transform: 'translate3d(40%, 0, -35px) scale(0.92)',
        zIndex: 7,
        opacity: 0.80,
        pointerEvents: 'auto',
        cursor: 'pointer',
        boxShadow: '0 10px 24px rgba(0, 0, 0, 0.05)',
        borderColor: '#ECE5DE'
      };
    }

    // Outer Right Card (Added background card on right side)
    if (diff === 2) {
      return {
        transform: 'translate3d(76%, 0, -70px) scale(0.85)',
        zIndex: 4,
        opacity: 0.55,
        pointerEvents: 'auto',
        cursor: 'pointer',
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.03)',
        borderColor: '#ECE5DE'
      };
    }

    // Inner Left Card
    if (diff === -1) {
      return {
        transform: 'translate3d(-40%, 0, -35px) scale(0.92)',
        zIndex: 7,
        opacity: 0.80,
        pointerEvents: 'auto',
        cursor: 'pointer',
        boxShadow: '0 10px 24px rgba(0, 0, 0, 0.05)',
        borderColor: '#ECE5DE'
      };
    }

    // Outer Left Card (Added background card on left side)
    if (diff === -2) {
      return {
        transform: 'translate3d(-76%, 0, -70px) scale(0.85)',
        zIndex: 4,
        opacity: 0.55,
        pointerEvents: 'auto',
        cursor: 'pointer',
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.03)',
        borderColor: '#ECE5DE'
      };
    }

    // Deep Back Card (looping in background)
    return {
      transform: 'translate3d(0, 0, -110px) scale(0.74)',
      zIndex: 1,
      opacity: 0,
      pointerEvents: 'none',
      borderColor: '#ECE5DE'
    };
  };

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHowItWorksVisible(true);
        } else {
          // Reset when scrolled out of view so it animates again whenever scrolling back up or down
          setHowItWorksVisible(false);
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -30px 0px' }
    );

    if (howItWorksRef.current) {
      observer.observe(howItWorksRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  useEffect(() => {
    let isMounted = true;
    const fetchOffers = async () => {
      try {
        const res = await investmentService.getFeaturedOffers();
        if (isMounted && res.success && res.data) {
          setFeaturedOffers(res.data);
        }
      } catch (err) {
        console.error('[Home] Failed to load featured offers:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOffers();
    return () => { isMounted = false; };
  }, []);

  const faqs = [
    {
      id: 1,
      category: 'Onboarding',
      q: 'How to become an investor?',
      a: 'Getting started takes under 2 minutes. Sign up with your full legal name, verified mobile number, and email. Complete a seamless online KYC verification using your PAN and bank details. Once approved, you can immediately explore curated investment opportunities, review institutional-grade audit reports, and commit capital starting from accessible minimums.'
    },
    {
      id: 2,
      category: 'Compliance',
      q: 'Why is KYC verification required?',
      a: 'Under statutory RBI and SEBI Anti-Money Laundering (AML) and PMLA regulations, verifying the legal identity of every investor is mandatory. This protects investors from fraudulent activities, guarantees that all principal repayments and monthly return distributions transfer directly and safely into your verified bank account, and ensures end-to-end statutory compliance across all opportunities.'
    },
    {
      id: 3,
      category: 'Thresholds',
      q: 'What is the minimum investment amount?',
      a: 'Investment thresholds are designed to make high-yield alternative assets accessible. Retail allocations start from ₹2,000 to ₹5,000, while institutional-grade debentures typically range from ₹10,000 to ₹50,000. Each listing clearly specifies minimum commitment thresholds, projected yields, and tenure lengths upfront so you can diversify with confidence.'
    },
    {
      id: 4,
      category: 'Security',
      q: 'How are opportunities secured and vetted?',
      a: 'Every listed opportunity undergoes our forensic 6-layer diligence framework, analyzing corporate governance, cash flow histories, and asset valuations. Investments are backed by tangible collateral, including first-charge mortgages or hypothecation coverage spanning 1.25x to 1.5x of issue size, supervised independently by a SEBI-registered Debenture Trustee.'
    },
    {
      id: 5,
      category: 'Liquidity',
      q: 'How liquid all investments are available?',
      a: 'Offerings feature fixed tenures typically between 12 and 36 months with predictable payout schedules. While capital is designed to compound until maturity, Connect Invest hosts periodic secondary liquidity windows allowing verified investors to transfer allocations to platform participants prior to term completion.'
    },
    {
      id: 6,
      category: 'Distributions',
      q: 'What are returns paid?',
      a: 'Monthly interest distributions and term maturity returns are credited automatically into your verified bank account via direct automated clearing (NEFT/RTGS/IMPS). Real-time distribution receipts, TDS certificates (Form 16A), and historical earnings statements are instantly accessible directly from your investor dashboard.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', color: '#1F2421', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Navbar />

      {/* 1. HERO SECTION - Exact Match to Image 1 */}
      <section
        style={{
          backgroundColor: '#4A0E17',
          color: '#FFFFFF',
          padding: '64px 0 72px',
          overflow: 'hidden',
          position: 'relative',
          minHeight: '460px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* Full-bleed Right Hero Image */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '50%',
            zIndex: 1,
            pointerEvents: 'none',
            overflow: 'hidden'
          }}
          className="hero-bg-cover"
        >
          <img
            src="/images/hero-skyline.jpg"
            alt="Connect Invest Growth Skyline"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center right',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 20%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 20%, black 100%)'
            }}
          />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '620px' }}>
            {/* Gold Subtitle */}
            <div
              style={{
                color: '#D4AF37',
                fontSize: '13.5px',
                fontWeight: '700',
                letterSpacing: '0.04em',
                textTransform: 'capitalize',
                marginBottom: '14px'
              }}
            >
              Build Your Future
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '44px',
                fontWeight: '800',
                lineHeight: 1.18,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
                marginBottom: '16px'
              }}
              className="hero-headline"
            >
              <span style={{ whiteSpace: 'nowrap' }}>
                Invest in{' '}
                <span
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontWeight: '700',
                    color: '#DFB77E',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Opportunities.
                </span>
              </span>
              <br />
              <span style={{ display: 'inline-flex', alignItems: 'baseline', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                <span>Track Your&nbsp;</span>
                <span
                  style={{
                    display: 'inline-block',
                    height: '1.25em',
                    lineHeight: '1.25em',
                    overflow: 'hidden',
                    verticalAlign: 'baseline',
                    position: 'relative'
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      transform: `translateY(-${heroWordIndex * 20}%)`,
                      transition: isReelResetting ? 'none' : 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                  >
                    {HERO_WORDS.map((word, idx) => (
                      <span
                        key={idx}
                        style={{
                          height: '1.25em',
                          lineHeight: '1.25em',
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontStyle: 'italic',
                          fontWeight: '700',
                          color: '#DFB77E',
                          letterSpacing: '0.01em',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {word}
                      </span>
                    ))}
                  </span>
                </span>
              </span>
            </h1>

            {/* Description */}
            <p
              style={{
                fontSize: '15px',
                color: '#E8DEDF',
                lineHeight: 1.6,
                marginBottom: '32px',
                maxWidth: '490px',
                fontWeight: '400'
              }}
            >
              Discover company and project investment opportunities and manage your investments through one simple platform.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => navigate('/opportunities')}
                style={{
                  backgroundColor: '#5E121E',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '6px',
                  padding: '11px 26px',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#741726')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#5E121E')}
              >
                Explore Investments
              </button>

              <button
                type="button"
                onClick={() => navigate('/register')}
                style={{
                  backgroundColor: '#C8963E',
                  color: '#27040A',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '11px 28px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#D4A346')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#C8963E')}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 4 QUICK FEATURE CARDS RIBBON - Exact Match to Image 1 */}
      <section style={{ backgroundColor: '#FAF8F5', padding: '24px 0 32px' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px'
            }}
            className="feature-ribbon-grid"
          >
            {[
              {
                title: 'Explore Investment Opportunities',
                desc: 'Find vetted investments and projects to invest in.',
                icon: Compass,
                link: '/opportunities'
              },
              {
                title: 'Secure KYC Verification',
                desc: "Complete your KYC and unlock investor's access.",
                icon: ShieldCheck,
                link: '/investor/kyc'
              },
              {
                title: 'Track Investments',
                desc: 'Monitor your portfolio in real time.',
                icon: TrendingUp,
                link: '/investor/dashboard'
              },
              {
                title: 'Monitor Returns and Payouts',
                desc: 'Stay updated on your returns and payouts.',
                icon: Coins,
                link: '/investor/returns-payouts'
              }
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  onClick={() => navigate(card.link)}
                  className="quick-feature-card"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '18px 20px',
                    border: '1px solid #ECE5DE',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <div
                    className="quick-feature-icon"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: '#F9EFEB',
                      color: '#4A0E17',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4
                      style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '13.5px',
                        fontWeight: '700',
                        color: '#1F2421',
                        marginBottom: '3px',
                        lineHeight: 1.25
                      }}
                    >
                      {card.title}
                    </h4>
                    <p style={{ fontSize: '11.5px', color: '#64748B', lineHeight: 1.35, margin: 0 }}>
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FEATURED INVESTMENT OPPORTUNITIES - Exact Match to Image 1 */}
      <section style={{ backgroundColor: '#FAF8F5', padding: '16px 0 56px' }}>
        <div className="container">
          {/* Header - Centered */}
          <div
            style={{
              textAlign: 'center',
              position: 'relative',
              marginBottom: '32px'
            }}
          >
            <h2
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '28px',
                fontWeight: '800',
                color: '#1F2421',
                marginBottom: '6px',
                letterSpacing: '-0.02em'
              }}
            >
              Featured Investment Opportunities
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
              Explore our latest company and project investment offers.
            </p>

            <Link
              to="/opportunities"
              style={{
                position: 'absolute',
                right: 0,
                bottom: '2px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13.5px',
                fontWeight: '700',
                color: '#4A0E17',
                textDecoration: 'none'
              }}
              className="featured-view-all"
            >
              <span>View All</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <Loader message="Loading verified offers from backend..." />
          ) : featuredOffers.length === 0 ? (
            <EmptyState
              title="No featured opportunities"
              description="Check back shortly as new investment opportunities are verified and published."
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '20px'
              }}
              className="opportunities-grid"
            >
              {featuredOffers.slice(0, 4).map((offer) => (
                <InvestmentCard key={offer._id} offer={offer} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. HOW IT WORKS - Exact Match to Image 1 */}
      <section
        id="how-it-works"
        ref={howItWorksRef}
        style={{
          backgroundColor: '#FAF8F5',
          padding: '32px 0 56px',
          borderTop: '1px solid #ECE5DE'
        }}
      >
        <div className="container">
          <div
            style={{
              textAlign: 'center',
              marginBottom: '32px',
              opacity: howItWorksVisible ? 1 : 0,
              transform: howItWorksVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: howItWorksVisible
                ? 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                : 'opacity 0.15s ease, transform 0.15s ease'
            }}
          >
            <h2
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '26px',
                fontWeight: '800',
                color: '#1F2421',
                marginBottom: '4px'
              }}
            >
              How It Works
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
              Get started in 4 simple steps and begin your investment journey.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
            className="how-it-works-row"
          >
            {[
              {
                step: '1',
                icon: UserCheck,
                title: 'Create Your Account',
                desc: 'Sign up with your mobile number and email.'
              },
              {
                step: '2',
                icon: ShieldCheck,
                title: 'Complete KYC Verification',
                desc: 'Verify your identity and bank details.'
              },
              {
                step: '3',
                icon: Compass,
                title: 'Explore and Invest',
                desc: 'Choose from available investment opportunities.'
              },
              {
                step: '4',
                icon: TrendingUp,
                title: 'Track Your Investments',
                desc: 'Monitor returns and payouts in real time.'
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={idx}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flex: 1,
                      opacity: howItWorksVisible ? 1 : 0,
                      transform: howItWorksVisible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.95)',
                      transition: howItWorksVisible
                        ? `opacity 0.95s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + idx * 0.42}s, transform 0.95s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + idx * 0.42}s`
                        : 'opacity 0.15s ease, transform 0.15s ease'
                    }}
                  >
                    {/* Gold Step Number Circle */}
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: '#C8963E',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: '800',
                        flexShrink: 0
                      }}
                    >
                      {item.step}
                    </div>

                    {/* Blush Icon Circle */}
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: '#F9EFEB',
                        color: '#4A0E17',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Icon size={18} />
                    </div>

                    {/* Text */}
                    <div>
                      <h4
                        style={{
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '13.5px',
                          fontWeight: '700',
                          color: '#1F2421',
                          marginBottom: '2px',
                          lineHeight: 1.25
                        }}
                      >
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '11.5px', color: '#64748B', lineHeight: 1.35, margin: 0 }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Connecting Chevron */}
                  {idx < 3 && (
                    <div
                      style={{
                        color: '#D4C9BF',
                        flexShrink: 0,
                        padding: '0 4px',
                        opacity: howItWorksVisible ? 1 : 0,
                        transform: howItWorksVisible ? 'translateX(0)' : 'translateX(-8px)',
                        transition: howItWorksVisible
                          ? `opacity 0.6s ease ${0.4 + idx * 0.42}s, transform 0.6s ease ${0.4 + idx * 0.42}s`
                          : 'opacity 0.15s ease, transform 0.15s ease'
                      }}
                      className="step-arrow"
                    >
                      <ChevronRight size={20} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE CONNECT INVEST - Platform Strengths */}
      <section style={{ backgroundColor: '#FAF8F5', padding: '36px 0 60px' }}>
        <div className="container">
          <div
            style={{
              backgroundColor: '#F6ECE6',
              borderRadius: '16px',
              border: '1px solid #ECE0D6',
              padding: '36px 36px 36px',
              boxShadow: '0 6px 20px rgba(74, 14, 23, 0.04)'
            }}
          >
            {/* Header with Centered Title */}
            <div
              style={{
                textAlign: 'center',
                marginBottom: '28px'
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '800',
                  color: '#C8963E',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  display: 'block',
                  marginBottom: '4px'
                }}
              >
                Platform Strengths
              </span>
              <h3
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#1F2421',
                  margin: 0
                }}
              >
                Why Choose Connect Invest?
              </h3>
            </div>

            {/* Continuous Rolling Track (Right to Left) */}
            <div className="rolling-track-wrapper">
              <div className="rolling-track">
                {/* Rolling Group 1 */}
                <div className="rolling-group">
                  {WHY_CHOOSE_FEATURES.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={`roll-1-${idx}`}
                        style={{
                          width: '280px',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '12px',
                          border: '1px solid #ECE0D6',
                          padding: '24px 20px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          flexShrink: 0,
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
                        }}
                        className="why-choose-card"
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(74, 14, 23, 0.09)';
                          e.currentTarget.style.borderColor = '#C8963E';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)';
                          e.currentTarget.style.borderColor = '#ECE0D6';
                        }}
                      >
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: '#4A0E17',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(74, 14, 23, 0.2)'
                          }}
                        >
                          <Icon size={18} />
                        </div>

                        <div>
                          <h4
                            style={{
                              fontFamily: 'Outfit, sans-serif',
                              fontSize: '14.5px',
                              fontWeight: '700',
                              color: '#1F2421',
                              marginBottom: '4px',
                              lineHeight: 1.3
                            }}
                          >
                            {item.title}
                          </h4>
                          <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.45, margin: 0 }}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Rolling Group 2 (Duplicate for Seamless Infinite Marquee) */}
                <div className="rolling-group" aria-hidden="true">
                  {WHY_CHOOSE_FEATURES.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={`roll-2-${idx}`}
                        style={{
                          width: '280px',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '12px',
                          border: '1px solid #ECE0D6',
                          padding: '24px 20px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          flexShrink: 0,
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
                        }}
                        className="why-choose-card"
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(74, 14, 23, 0.09)';
                          e.currentTarget.style.borderColor = '#C8963E';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)';
                          e.currentTarget.style.borderColor = '#ECE0D6';
                        }}
                      >
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: '#4A0E17',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(74, 14, 23, 0.2)'
                          }}
                        >
                          <Icon size={18} />
                        </div>

                        <div>
                          <h4
                            style={{
                              fontFamily: 'Outfit, sans-serif',
                              fontSize: '14.5px',
                              fontWeight: '700',
                              color: '#1F2421',
                              marginBottom: '4px',
                              lineHeight: 1.3
                            }}
                          >
                            {item.title}
                          </h4>
                          <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.45, margin: 0 }}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. GET A SNEAK PEEK OF YOUR DASHBOARD - Exact Match to Image 1 */}
      <section style={{ backgroundColor: '#FAF8F5', padding: '0 0 56px' }}>
        <div className="container">
          <div
            style={{
              background: 'linear-gradient(90deg, #D4A346 0%, #C8963E 50%, #B88530 100%)',
              borderRadius: '12px',
              padding: '24px 32px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              boxShadow: '0 6px 20px rgba(200, 150, 62, 0.25)'
            }}
            className="sneak-peek-banner"
          >
            {/* Left: Mini Dashboard Screen Mockup */}
            <div
              style={{
                width: '240px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.15)',
                color: '#1F2421',
                flexShrink: 0
              }}
              className="dashboard-mini-preview"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#4A0E17' }}>PORTFOLIO OVERVIEW</span>
                <span style={{ fontSize: '9px', fontWeight: '700', color: '#10B981', backgroundColor: '#ECFDF5', padding: '2px 6px', borderRadius: '4px' }}>Live</span>
              </div>
              <div style={{ backgroundColor: '#4A0E17', color: '#FFFFFF', borderRadius: '6px', padding: '8px 10px', marginBottom: '8px' }}>
                <div style={{ fontSize: '9px', color: '#E8DEDF' }}>Total Invested</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#D4AF37' }}>₹ 2,50,000</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '9px' }}>
                <div style={{ backgroundColor: '#FAF8F5', padding: '5px', borderRadius: '4px' }}>
                  <div style={{ color: '#64748B' }}>Returns</div>
                  <div style={{ fontWeight: '700', color: '#10B981' }}>₹ 2,000</div>
                </div>
                <div style={{ backgroundColor: '#FAF8F5', padding: '5px', borderRadius: '4px' }}>
                  <div style={{ color: '#64748B' }}>Active Deals</div>
                  <div style={{ fontWeight: '700', color: '#1F2421' }}>2 Deals</div>
                </div>
              </div>
            </div>

            {/* Center Content */}
            <div style={{ flex: 1, textAlign: 'center', padding: '0 16px' }}>
              <h3
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#FFFFFF',
                  marginBottom: '6px',
                  letterSpacing: '-0.01em'
                }}
              >
                Get a Sneak Peek of Your Dashboard
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: '#FFFFFF',
                  opacity: 0.95,
                  marginBottom: '16px',
                  fontWeight: '400'
                }}
              >
                Track your investments, returns and payouts — all in one place.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  backgroundColor: '#4A0E17',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '9px 24px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(74, 14, 23, 0.35)',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#621320')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4A0E17')}
              >
                View Dashboard Demo
              </button>
            </div>

            {/* Right: Laptop Graph Mini Illustration */}
            <div
              style={{
                width: '180px',
                height: '110px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '8px',
                flexShrink: 0
              }}
              className="dashboard-mini-laptop"
            >
              <TrendingUp size={36} color="#FFFFFF" />
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#FFFFFF' }}>Real-time Analytics</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS - Exact Match to Image 1 */}
      <section id="faqs" style={{ backgroundColor: '#FAF8F5', padding: '16px 0 72px' }}>
        <div className="container">
          {/* Header - Centered */}
          <div
            style={{
              textAlign: 'center',
              position: 'relative',
              marginBottom: '32px'
            }}
          >
            <h2
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '24px',
                fontWeight: '800',
                color: '#1F2421',
                marginBottom: '4px'
              }}
            >
              Frequently Asked Questions
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              Quick answers to common questions about investing with Connect Invest.
            </p>

            <Link
              to="/faqs"
              style={{
                position: 'absolute',
                right: 0,
                bottom: '2px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                fontWeight: '700',
                color: '#4A0E17',
                textDecoration: 'none'
              }}
              className="faq-view-all"
            >
              <span>View All FAQs</span>
              <ChevronRight size={15} />
            </Link>
          </div>

          {/* Stacked Carousel with Left and Right Navigation Arrows */}
          <div
            className="faq-carousel-outer"
            onMouseEnter={() => setIsFaqPaused(true)}
            onMouseLeave={() => setIsFaqPaused(false)}
            onTouchStart={handleFaqTouchStart}
            onTouchEnd={handleFaqTouchEnd}
            onTouchCancel={() => setIsFaqPaused(false)}
          >
            {/* Left Side Arrow Button */}
            <button
              type="button"
              className="faq-nav-btn faq-nav-btn-prev"
              onClick={prevFaq}
              aria-label="Previous question"
              title="Previous question"
            >
              <ChevronLeft size={22} />
            </button>

            {/* 3D Stacked Card Carousel */}
            <div className="faq-stacked-wrapper">
              <div className="faq-stacked-track">
                {faqs.map((faq, idx) => {
                  const cardStyle = getFaqCardStyle(idx);
                  const isActive = idx === activeFaqIndex;

                  return (
                    <div
                      key={idx}
                      className="faq-stacked-card"
                      style={{
                        ...cardStyle,
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        border: `1.5px solid ${isActive ? '#C8963E' : '#ECE5DE'}`,
                        padding: '24px 24px',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      onClick={() => {
                        if (!isActive) setActiveFaqIndex(idx);
                      }}
                    >
                      {/* Card Content */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%'
                        }}
                      >
                        {/* Top Row: Category Tag + Question Index */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '12px'
                          }}
                        >
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '800',
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                              color: '#4A0E17',
                              backgroundColor: '#F9EFEB',
                              padding: '4px 10px',
                              borderRadius: '12px'
                            }}
                          >
                            {faq.category}
                          </span>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: '700',
                              color: isActive ? '#C8963E' : '#94A3B8',
                              letterSpacing: '0.04em'
                            }}
                          >
                            0{faq.id} / 0{faqs.length}
                          </span>
                        </div>

                        {/* Question Title */}
                        <h3
                          style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '17px',
                            fontWeight: '800',
                            color: '#1F2421',
                            margin: '0 0 8px',
                            lineHeight: 1.3
                          }}
                        >
                          {faq.q}
                        </h3>

                        {/* Gold Divider Line */}
                        <div
                          style={{
                            width: '36px',
                            height: '3px',
                            backgroundColor: '#C8963E',
                            borderRadius: '2px',
                            marginBottom: '12px'
                          }}
                        />

                        {/* Full Answer */}
                        <p
                          style={{
                            fontSize: '12.8px',
                            color: '#475569',
                            lineHeight: 1.6,
                            margin: 0
                          }}
                        >
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side Arrow Button */}
            <button
              type="button"
              className="faq-nav-btn faq-nav-btn-next"
              onClick={nextFaq}
              aria-label="Next question"
              title="Next question"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER - Exact Match to Image 1 */}
      <Footer />

      {/* Responsive & Interactive Float Shadow Styles */}
      <style>{`
        /* Float Shadow effect when touched or hovered */
        .quick-feature-card {
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.28s ease !important;
          will-change: transform, box-shadow;
        }

        .quick-feature-card:hover,
        .quick-feature-card:focus-within,
        .quick-feature-card:active {
          transform: translateY(-8px) !important;
          box-shadow: 0 20px 40px rgba(74, 14, 23, 0.12), 0 8px 16px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(200, 150, 62, 0.4) !important;
          border-color: #C8963E !important;
        }

        .quick-feature-icon {
          transition: transform 0.25s ease, background-color 0.25s ease, color 0.25s ease !important;
        }

        .quick-feature-card:hover .quick-feature-icon,
        .quick-feature-card:active .quick-feature-icon {
          transform: scale(1.1) !important;
          background-color: #4A0E17 !important;
          color: #FFFFFF !important;
        }

        /* Investment Cards Float Shadow */
        .investment-card {
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.28s ease !important;
          will-change: transform, box-shadow;
        }

        .investment-card:hover,
        .investment-card:active {
          transform: translateY(-8px) !important;
          box-shadow: 0 22px 42px rgba(74, 14, 23, 0.12), 0 8px 18px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(200, 150, 62, 0.35) !important;
          border-color: #C8963E !important;
        }

        .investment-card:hover img {
          transform: scale(1.04);
        }

        .investment-card img {
          transition: transform 0.4s ease;
        }

        @media (max-width: 1024px) {
          .feature-ribbon-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .opportunities-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .why-choose-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .faq-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        .why-choose-carousel::-webkit-scrollbar {
          display: none !important;
        }
        @media (max-width: 1023px) {
          .why-choose-card {
            flex: 0 0 280px !important;
          }
        }
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .hero-headline {
            font-size: 32px !important;
          }
          .hero-bg-cover {
            width: 100% !important;
            opacity: 0.18 !important;
          }
          .feature-ribbon-grid {
            grid-template-columns: 1fr !important;
          }
          .opportunities-grid {
            grid-template-columns: 1fr !important;
          }
          .featured-view-all,
          .faq-view-all,
          .why-choose-controls {
            position: static !important;
            margin-top: 10px !important;
            justify-content: center !important;
          }
          .how-it-works-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 20px !important;
          }
          .step-arrow {
            display: none !important;
          }
          .sneak-peek-banner {
            flex-direction: column !important;
            text-align: center !important;
          }
          .dashboard-mini-preview,
          .dashboard-mini-laptop {
            display: none !important;
          }
          .faq-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
