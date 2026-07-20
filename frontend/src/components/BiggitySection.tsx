'use client';

import { FaSpotify, FaApple, FaYoutube } from 'react-icons/fa';

export default function BiggitySection() {
  return (
    <section className="relative py-20 px-8 bg-gradient-to-b from-dark-bg to-blue-dark overflow-hidden">
      {/* Pixel-dust scanline overlay tint */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, rgba(255,255,255,.01) 0 1px, transparent 1px 3px)' }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="glass rounded-2xl border border-white/10 p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center hover:border-primary/50 transition-all duration-400">

          {/* Album cover */}
          <div className="w-full max-w-[280px] md:w-64 lg:w-72 flex-shrink-0">
            <img
              src="/images/biggity.jpg"
              alt="Biggity Baggity Boo album cover"
              className="w-full rounded-xl border-4 border-primary shadow-[0_0_40px_rgba(255,51,102,0.5),0_0_80px_rgba(0,245,255,0.2)]"
            />
          </div>

          {/* Song info */}
          <div className="flex-1 text-center md:text-left">
            <p className="font-pixel text-xs text-accent-yellow tracking-widest uppercase mb-3">
              Now Streaming
            </p>

            <h2
              className="font-pixel text-2xl md:text-3xl font-bold text-white mb-2 leading-snug"
              style={{ textShadow: '0 0 20px rgba(255,51,102,0.7), 0 0 40px rgba(0,245,255,0.4)' }}
            >
              Biggity Baggity Boo
            </h2>

            <p className="font-pixel text-sm text-secondary mb-5" style={{ textShadow: '0 0 10px rgba(0,245,255,0.5)' }}>
              Bags Bro!
            </p>

            <p className="text-base opacity-75 mb-8 font-mono">
              Listen to the official Bags Bro! animated music experience.
            </p>

            {/* Platform links */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <a
                href="https://open.spotify.com/track/05T3GBubw1G9zfVDHgCwNX"
                target="_blank"
                rel="noopener noreferrer"
                className="biggity-platform-btn biggity-spotify"
                aria-label="Listen on Spotify"
              >
                <FaSpotify className="text-lg" />
                <span>Spotify</span>
              </a>

              <a
                href="https://music.apple.com/us/album/biggity-baggity-boo-feat-monlee-mane-single/1825494890"
                target="_blank"
                rel="noopener noreferrer"
                className="biggity-platform-btn biggity-apple"
                aria-label="Listen on Apple Music"
              >
                <FaApple className="text-lg" />
                <span>Apple Music</span>
              </a>

              <a
                href="https://youtu.be/sMd1DIgFX9k?si=RouPcDBBYLa5kJQz"
                target="_blank"
                rel="noopener noreferrer"
                className="biggity-platform-btn biggity-youtube"
                aria-label="Watch on YouTube"
              >
                <FaYoutube className="text-lg" />
                <span>YouTube</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .biggity-platform-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          font-family: "Press Start 2P", monospace;
          font-size: 11px;
          letter-spacing: 0.06em;
          border-radius: 6px;
          border: 2px solid;
          transition: transform 0.15s, box-shadow 0.2s, background 0.2s;
          text-decoration: none;
        }
        .biggity-platform-btn:hover {
          transform: translateY(-3px);
        }
        .biggity-spotify {
          color: #1DB954;
          border-color: #1DB954;
          background: transparent;
        }
        .biggity-spotify:hover {
          background: rgba(29, 185, 84, 0.15);
          box-shadow: 0 0 20px rgba(29, 185, 84, 0.4);
        }
        .biggity-apple {
          color: #fc3c44;
          border-color: #fc3c44;
          background: transparent;
        }
        .biggity-apple:hover {
          background: rgba(252, 60, 68, 0.15);
          box-shadow: 0 0 20px rgba(252, 60, 68, 0.4);
        }
        .biggity-youtube {
          color: #FF0000;
          border-color: #FF0000;
          background: transparent;
        }
        .biggity-youtube:hover {
          background: rgba(255, 0, 0, 0.12);
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.4);
        }
      `}</style>
    </section>
  );
}
