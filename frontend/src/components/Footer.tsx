'use client';
import { useState, useEffect } from 'react';
import { FaXTwitter, FaTiktok } from 'react-icons/fa6';
import { FaInstagram, FaYoutube } from 'react-icons/fa';
import Image from 'next/image';

export default function Footer() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash === '#terms') setShowTerms(true);
    if (hash === '#privacy') setShowPrivacy(true);
  }, []);

  return (
    <>
      <footer style={{
        background: '#000',
        borderTop: '1px solid #1a1310',
        color: '#fff',
        position: 'relative',
        zIndex: 50,
        fontFamily: "'Press Start 2P', monospace",
      }}>
        {/* Scanline overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 32px', position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, alignItems: 'start' }}>

            {/* LEFT — Social Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                fontSize: 11, letterSpacing: 3, color: '#FF3366',
                textShadow: '0 0 10px rgba(255,51,102,0.6)',
                marginBottom: 8,
              }}>
                ▸ CONNECT
              </div>

              <div style={{ display: 'flex', gap: 20 }}>
                <a href="https://x.com/bagsbromusic" target="_blank" rel="noopener noreferrer"
                  style={{ color: '#fff', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FF3366')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#fff')}
                >
                  <FaXTwitter size={28} />
                </a>
                <a href="https://www.instagram.com/bagsbromusic/" target="_blank" rel="noopener noreferrer"
                  style={{ color: '#fff', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FF3366')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#fff')}
                >
                  <FaInstagram size={28} />
                </a>
                <a href="https://www.youtube.com/@BagsBroMusic" target="_blank" rel="noopener noreferrer"
                  style={{ color: '#fff', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FF3366')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#fff')}
                >
                  <FaYoutube size={28} />
                </a>
                <a href="https://tiktok.com/@bagsbromusic" target="_blank" rel="noopener noreferrer"
                  style={{ color: '#fff', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FF3366')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#fff')}
                >
                  <FaTiktok size={28} />
                </a>
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                <button
                  onClick={() => setShowTerms(true)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#888', fontSize: 10, letterSpacing: 1,
                    textDecoration: 'underline', fontFamily: "'Press Start 2P', monospace",
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FF3366')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#888')}
                >
                  TERMS
                </button>
                <span style={{ color: '#333' }}>|</span>
                <button
                  onClick={() => setShowPrivacy(true)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#888', fontSize: 10, letterSpacing: 1,
                    textDecoration: 'underline', fontFamily: "'Press Start 2P', monospace",
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FF3366')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#888')}
                >
                  PRIVACY
                </button>
              </div>
            </div>

            {/* CENTER — Logo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 96, height: 96,
                borderRadius: '50%',
                border: '2px solid #FF3366',
                boxShadow: '0 0 20px rgba(255,51,102,0.4), 0 0 40px rgba(255,51,102,0.15)',
                overflow: 'hidden',
                position: 'relative',
              }}>
                <Image
                  src="/images/bags-bro-logo.jpg"
                  alt="Bags Bro!"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div style={{
                fontSize: 9, letterSpacing: 2, color: '#FF3366',
                textShadow: '0 0 10px rgba(255,51,102,0.6)',
              }}>
                BAGS BRO!
              </div>
              <div style={{ fontSize: 9, color: '#444', letterSpacing: 1, textAlign: 'center' }}>
                © 2025 BAGS BRO!<br />ALL RIGHTS RESERVED
              </div>
            </div>

            {/* RIGHT — Disclaimer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <div style={{
                fontSize: 11, letterSpacing: 3, color: '#FF3366',
                textShadow: '0 0 10px rgba(255,51,102,0.6)',
                marginBottom: 8,
              }}>
                ▸ DISCLAIMER
              </div>
              <div style={{ fontSize: 9, color: '#555', lineHeight: 2.2, textAlign: 'right', letterSpacing: 0.5 }}>
                <p>THIS IS NOT FINANCIAL ADVICE.</p>
                <p>NOT RESPONSIBLE FOR VIBES.</p>
                <p>BAGS SOLD SEPARATELY.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {showTerms && (
        <LegalModal title="TERMS OF SERVICE" onClose={() => setShowTerms(false)}>
          <TermsContent />
        </LegalModal>
      )}
      {showPrivacy && (
        <LegalModal title="PRIVACY POLICY" onClose={() => setShowPrivacy(false)}>
          <PrivacyContent />
        </LegalModal>
      )}
    </>
  );
}

function LegalModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(6px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'relative',
        background: '#0a0a0a',
        border: '2px solid #FF3366',
        boxShadow: '0 0 40px rgba(255,51,102,0.3), 0 0 80px rgba(255,51,102,0.1)',
        maxWidth: 640,
        width: '90vw',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Press Start 2P', monospace",
      }}>
        {/* Scanlines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
        }} />

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid #FF3366',
          background: 'rgba(255,51,102,0.05)',
        }}>
          <div style={{ fontSize: 10, color: '#FF3366', letterSpacing: 2, textShadow: '0 0 10px rgba(255,51,102,0.8)' }}>
            ▸ {title}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: '1px solid #FF3366', color: '#FF3366',
              width: 28, height: 28, cursor: 'pointer', fontSize: 12,
              fontFamily: "'Press Start 2P', monospace",
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: '24px 20px',
          overflowY: 'auto',
          flex: 1,
          fontSize: 11,
          color: '#aaa',
          lineHeight: 2.4,
          letterSpacing: 0.5,
        }}>
          {children}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #FF3366',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'rgba(255,51,102,0.05)',
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,51,102,0.1)',
              border: '1px solid #FF3366',
              color: '#FF3366',
              padding: '8px 20px',
              cursor: 'pointer',
              fontSize: 11,
              fontFamily: "'Press Start 2P', monospace",
              letterSpacing: 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,51,102,0.25)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(255,51,102,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,51,102,0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

function TermsContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: '#FF3366', fontSize: 7 }}>EFFECTIVE DATE: 2025</p>
      <p>Welcome to BAGS BRO! By using our site and applications, you agree to these Terms of Service. BAGS BRO! is a music and entertainment brand. We are not offering financial advice, investment products, or guarantees of any kind.</p>
      <p>You must be 13 years or older to use this site. Content shared must comply with all applicable laws and avoid hate speech, harassment, explicit material, or illegal activity. We reserve the right to moderate or remove any content that violates these rules.</p>
      <p>Any NFTs or digital collectibles are community items with no implied monetary value. You are responsible for your own wallet and private keys.</p>
      <p>By continuing to use BAGS BRO!, you accept that the platform operates "as is," with no warranties or liability for any losses.</p>
      <p>For questions, contact <span style={{ color: '#FF3366' }}>contact@bagsbro.io</span></p>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: '#FF3366', fontSize: 7 }}>EFFECTIVE DATE: 2025</p>
      <p>BAGS BRO! respects your privacy. We collect limited user information necessary to operate our platform, such as email addresses and social media handles.</p>
      <p>OAuth data from X may include your username, avatar, and profile ID — used solely to enable platform features. We do not sell or share your personal data with third parties.</p>
      <p>BAGS BRO! may use analytics and cookies to improve the user experience. You may request data deletion anytime by contacting us.</p>
      <p>For privacy concerns, contact <span style={{ color: '#FF3366' }}>privacy@bagsbro.io</span></p>
    </div>
  );
}
