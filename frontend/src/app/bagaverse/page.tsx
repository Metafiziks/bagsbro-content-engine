'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Section = 'lords' | 'origins' | 'language' | 'cards';

// Language Book Component
function LanguageBook() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  // Pages 2-7 (skipping 1 and 8 which are blank covers)
  const pages = [2, 3, 4, 5, 6, 7];
  const totalPairs = Math.ceil(pages.length / 2); // 3 pairs

  const nextPage = () => {
    if (currentPage < totalPairs - 1 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsFlipping(false);
      }, 600);
    }
  };

  const prevPage = () => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsFlipping(false);
      }, 600);
    }
  };

  const leftPageNum = pages[currentPage * 2];
  const rightPageNum = pages[currentPage * 2 + 1];

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Book Display - Two Pages Side by Side */}
      <div className="relative w-full max-w-5xl">
        <div className={`grid grid-cols-2 gap-2 transition-transform duration-600 ${isFlipping ? 'scale-95' : 'scale-100'}`}>
          {/* Left Page */}
          <div className="relative w-full aspect-[3/4]">
            <Image
              src={`/images/language-book/language-page-${leftPageNum}.png`}
              alt={`Language of The Bagaverse - Page ${leftPageNum}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 40vw, 600px"
              className="object-contain drop-shadow-2xl"
            />
          </div>

          {/* Right Page */}
          {rightPageNum && (
            <div className="relative w-full aspect-[3/4]">
              <Image
                src={`/images/language-book/language-page-${rightPageNum}.png`}
                alt={`Language of The Bagaverse - Page ${rightPageNum}`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 40vw, 600px"
                className="object-contain drop-shadow-2xl"
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-4 mt-2">
        <button
          onClick={prevPage}
          disabled={currentPage === 0 || isFlipping}
          className={`font-pixel text-sm px-4 py-2 rounded transition-all duration-300 relative ${
            currentPage === 0 || isFlipping
              ? 'bg-dark-bg text-secondary/50 cursor-not-allowed border-2 border-secondary/50'
              : 'text-white hover:scale-105'
          }`}
          style={
            currentPage === 0 || isFlipping
              ? {}
              : {
                  background: 'linear-gradient(90deg, #1a1a1a, #1a1a1a) padding-box, linear-gradient(90deg, #FF3366, #FFD700, #00F5FF) border-box',
                  border: '2px solid transparent',
                }
          }
        >
          ← PREV
        </button>

        <div className="font-pixel text-lg text-white">
          {currentPage + 1} / {totalPairs}
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage === totalPairs - 1 || isFlipping}
          className={`font-pixel text-sm px-4 py-2 rounded transition-all duration-300 relative ${
            currentPage === totalPairs - 1 || isFlipping
              ? 'bg-dark-bg text-secondary/50 cursor-not-allowed border-2 border-secondary/50'
              : 'text-white hover:scale-105'
          }`}
          style={
            currentPage === totalPairs - 1 || isFlipping
              ? {}
              : {
                  background: 'linear-gradient(90deg, #1a1a1a, #1a1a1a) padding-box, linear-gradient(90deg, #FF3366, #FFD700, #00F5FF) border-box',
                  border: '2px solid transparent',
                }
          }
        >
          NEXT →
        </button>
      </div>
    </div>
  );
}

// City data with coordinates (percentage-based positions on the map)
const cities = [
  { id: 1, name: 'BAGLYN, N.Y., USA', color: '#FF3366', x: 27.2, y: 21 },
  { id: 2, name: 'BAGASAKI, JAPAN', color: '#FFD700', x: 89.4, y: 24.3 },
  { id: 3, name: 'BAGUIO CITY, PHILIPPINES', color: '#00F5FF', x: 85.8, y: 34.7 },
  { id: 4, name: 'BAGJING, CHINA', color: '#FF3366', x: 83.9, y: 20.9 },
  { id: 5, name: 'BAGCOUVER B.C., CANADA', color: '#FF69B4', x: 12, y: 20.5 },
  { id: 6, name: 'BAGNIN CITY, NIGERIA', color: '#FFFFFF', x: 50.4, y: 36.7 },
  { id: 7, name: 'BAGALURU, INDIA', color: '#FFA500', x: 72.4, y: 33.9 },
  { id: 8, name: 'BAGCELONA, SPAIN', color: '#9370DB', x: 49.3, y: 21 },
  { id: 9, name: 'BAGSTON, JAMAICA', color: '#00FF00', x: 28, y: 31.5 },
  { id: 10, name: 'BAGOTA, COLUMBIA', color: '#00F5FF', x: 26.8, y: 38.8 },
];

// NFT character data  
const nftCharacters = [
  {
    cityId: 1,
    name: 'Notorious B.A.G.',
    image: '/images/notorious-bag.png',
    description: `He came up on the stoops of Bagford-Stuyvesant, where every corner had a hustle and every hustle had a stash spot. Before the crown, he was just Chris Bagsley - moving knockoff purses out of corner bodegas and freestyling about bag supremacy.

They say his flow was smoother than Italian leather, heavier than a Louis Vuitton trunk full of gold bricks. The Notorious B.A.G. turned struggle into style, poverty into poetry, and a duffel bag empire into hip-hop immortality. He made it look easy — baby bags to Benzes, corner store to center stage.

"I love it when they call me Bag Poppa."`,
  },
  {
    cityId: 2,
    name: 'Mr. Bagyagi',
    image: '/images/bagyagi.png',
    description: `He walks the Bagaverse with wind at his back and no shadow on the ground. No one's sure if he's man, myth, or retired luggage. His hands smell faintly of cedar, his breath like old rice vinegar and wisdom. He taught Virginia's grandfather the art of tote defense and once defeated an entire rack of fanny packs without lifting a finger.

Mr. Bagyagi doesn't believe in rank or belts. He believes in stillness. In breath. In weight distributed perfectly across the shoulder strap. If you train with him, know this: he will not call you student. You must become the bag.

"Bags on. Bags off."`,
  },
  {
    cityId: 3,
    name: 'Manny Bagquiao',
    image: '/images/manny-bagquiao.png',
    description: `From the streets of General Bagtos City to the world stage, Manny Bagquiao fought his way out of poverty with nothing but his fists, his faith, and a gym bag full of dreams. Eight weight divisions. Twelve world titles. Countless knockouts. They called him Bag-Man — the only fighter fast enough to land a left hook while simultaneously securing the zipper on your emotional baggage.

But boxing was just the beginning. Senator. Congressman. Basketball player. Singer. The man did it all. They say he trained so hard, he once punched a heavy bag clean through the roof of Wild Card Gym. His speed defied physics. His heart defied odds. His legacy defied anyone who said a kid from the slums couldn't carry the bags of a nation on his shoulders.

"I wanted to be a bag champion."`,
  },
  {
    cityId: 4,
    name: 'The Bagdalorian',
    image: '/images/bagdalorian.png',
    description: `He walks the silent corridors of the Bagaverse, cloak zipped, satchel sealed, never late for a drop. His face? Never seen. His bags? Never fumbled. It's said his cross-body harness is made from the discarded straps of ancient MetaMessengers, and his voice sounds like a wallet connect prompt whispered through stardust.

He doesn't chase bounties. He chases balance. Between carry-on and cosmic. If you cross him, remember this...he won't say much. He'll just tap his pouch once and mutter:

"Bags are the way."`,
  },
  {
    cityId: 5,
    name: 'Bagnilla Ice',
    image: '/images/bagnilla-ice.png',
    description: `Back in the day, when baggy pants ruled and hair was frozen solid with Aqua Net, one man emerged from the streets of Dallas with a flow colder than the ice in his name. Bagnilla Ice turned a sample, a bassline, and a passion for oversized carryalls into a cultural phenomenon that had the whole world zipping and unzipping in unison.

They said his style was stolen. They said he was a one-hit wonder. But Bagnilla knew the truth — he wasn't just carrying bags, he was carrying an entire generation's luggage on his back. From music videos to movies, from platinum plaques to punchlines, he survived it all with that trademark smirk and a duffel full of royalty checks.

"Bagnilla, ice ice baby!"`,
  },
  {
    cityId: 6,
    name: 'Baguel Jackson',
    image: '/images/baguel-jackson.png',
    description: `He's been in the bag game long before you were born, and he'll be in it long after you're gone. Baguel Jackson doesn't just carry baggage — he IS baggage. The baddest briefcase enforcer to ever walk through a metal detector. They say his Jheri curl has its own carry-on allowance and his wallet screams "Bag Mother Packer" in hand-stitched leather.

From Bag Fiction to Jackie Bag to Snakes on a Bag Claim, he's done it all with style, intensity, and an unmatched dedication to the craft of looking cool while holding bags. His personal collection includes vintage 1970s attaché cases, a mysterious glowing suitcase, and enough swagger to fill a cargo plane.

"The path of the righteous bag."`,
  },
  {
    cityId: 7,
    name: 'Obi-Wan Bagnobi',
    image: '/images/obiwan.png',
    description: `Chief bagnosticator and administer of the holy bag of eternal life. Double PhD in Bagonomics-Bagsbrophysics and graduated cum laude from the University of Bagladesh.    

Leading authority and civic leader of indigenous bag rights and has championed progressive bag legislation in over 46 countries throughout the world.

Has published over 33 peer reviewed journals on the science of The Big Bag Theory and the origins of The Bagaverse. Has patented over 13 inventions integrating advanced quantum mechanics into the process of accumulating higher orders of bags.

"The bag will be with you. Always."`,
  },
  {
    cityId: 8,
    name: 'Bagsenberg',
    image: '/images/bagsenberg.png',
    description: `He used to teach chemistry to ungrateful teens who couldn't tell a beaker from a Bunsen burner. Then one day, life handed him a terminal diagnosis and a half-empty retirement fund. That's when Walter Bag discovered something pure. Something blue. Something that could be cooked in a Coleman Cooler Bag™ and distributed in a network of hollowed-out luggage compartments.

Now he's the one who knocks—on overhead bins. The architect of the blue sky cartel, manufacturing 99.1% pure Heisen-Bags™ with his former student, Jesse Packman. They say his product is so potent, one whiff and you'll never settle for generic grocery totes again.

Say my name.
"Bagsenberg."
You're goddamn right.`,
  },
  {
    cityId: 9,
    name: 'Bag Marley',
    image: '/images/bag-marley.png',
    description: `He emerged from the sun-soaked streets of Bagston with nothing but a patched-up messenger bag and a message of unity through baggage. They said he could hold more hope in a single tote pocket than most people carry in a lifetime. Legend has it he survived three zipper assassination attempts and still came back singing about One Love, One Bag.

His signature Rasta Rucksack™ was woven from the fabric of revolution — red for the blood of the struggle, gold for the wealth they'd never see, green for the land they'd reclaim. He preached that every bag, no matter how worn, deserved freedom. Emancipation from mental bag-age, ya feel?

"In this great future, you can't forget your bags."`,
  },
  {
    cityId: 10,
    name: 'Tony Bagtana',
    image: '/images/tony-bagtana.png',
    description: `He didn't come to the Bagaverse to make friends — he came to make moves. Born in the cargo hold of a rum-running yacht somewhere between Havana and Miami, Tony clawed his way up from baggage handler to kingpin with nothing but ambition, a Cuban link chain, and a suitcase full of contrabag dreams.

Now he sits atop his empire in a velvet-roped penthouse, surrounded by exotic leather goods and an army of loyal luggage enforciers. His motto is simple: take what's yours, trust no one, and never—ever—check your bags. The world is his, and so is everything in it.

"All I have in this world, is my bags and my word."`,
  },
];

export default function BagaversePage() {
  const [hoveredCity, setHoveredCity] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [autoHoverEnabled, setAutoHoverEnabled] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>('lords');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.5);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const youtubePlayerRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Trigger entry animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setHasEntered(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Start playing background music after entry animation
  useEffect(() => {
    if (hasEntered && audioRef.current && !isVideoPlaying) {
      audioRef.current.volume = audioVolume;
      audioRef.current.play().then(() => {
        setIsAudioPlaying(true);
      }).catch(err => console.log('Audio autoplay failed:', err));
    }
  }, [hasEntered, isVideoPlaying]);

  // Update audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
        setIsManuallyPaused(true); // Track that user manually paused
      } else {
        audioRef.current.play().then(() => {
          setIsAudioPlaying(true);
          setIsManuallyPaused(false); // User manually unpaused
        }).catch(err => console.log('Audio play failed:', err));
      }
    }
  };

  // Handle YouTube player state changes
  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // @ts-ignore
    window.onYouTubeIframeAPIReady = () => {
      // YouTube API is ready
    };
  }, []);

  // Handle video playing state
  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
    if (audioRef.current && activeSection !== 'origins') {
      audioRef.current.play().then(() => {
        setIsAudioPlaying(true);
      }).catch(err => console.log('Audio play failed:', err));
    }
  };

  // Pause music when switching to origins, resume when leaving
  useEffect(() => {
    if (activeSection === 'origins') {
      if (audioRef.current && !isVideoPlaying) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      }
    } else {
      // Stop YouTube video when leaving Origins section
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src; // Reset iframe to stop video
      }
      setIsVideoPlaying(false);
      
      // Only resume audio if user hasn't manually paused it
      if (audioRef.current && !isVideoPlaying && !isManuallyPaused) {
        audioRef.current.play().then(() => {
          setIsAudioPlaying(true);
        }).catch(err => console.log('Audio play failed:', err));
      }
    }
  }, [activeSection, isVideoPlaying]);

  // Auto-hover animation cycling through cities
  useEffect(() => {
    if (!hasEntered || !autoHoverEnabled || activeSection !== 'lords') return;

    let currentIndex = 0;
    const cycleInterval = setInterval(() => {
      setHoveredCity(cities[currentIndex].id);
      currentIndex = (currentIndex + 1) % cities.length;
    }, 1000);

    return () => clearInterval(cycleInterval);
  }, [hasEntered, autoHoverEnabled, activeSection]);

  const handleCityClick = (cityId: number) => {
    setAutoHoverEnabled(false);
    setSelectedCity(cityId);
  };

  const handleMouseEnter = (cityId: number) => {
    setAutoHoverEnabled(false);
    setHoveredCity(cityId);
  };

  const handleCloseModal = () => {
    setSelectedCity(null);
    setAutoHoverEnabled(true);
  };

  const selectedCharacter = nftCharacters.find(char => char.cityId === selectedCity);

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden py-4 px-4 md:px-8">
      {/* Background Audio */}
      <audio ref={audioRef} loop>
        <source src="/audio/the-bagaverse.mp3" type="audio/mpeg" />
      </audio>

      {/* Bagaverse Space Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div 
          className={`absolute inset-0 transition-transform duration-[2000ms] ease-out ${
            hasEntered ? 'scale-100' : 'scale-150'
          }`}
        >
          <Image
            src="/images/bagaverse.webp"
            alt="Bagaverse Space Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      </div>

      {/* Back to Home Link - Top Left */}
      <Link 
        href="/"
        className={`absolute top-8 left-8 z-30 font-pixel text-lg text-secondary hover:text-primary transition-all duration-700 drop-shadow-[0_2px_8px_rgba(0,0,0,1)] ${
          hasEntered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
        }`}
      >
        ← Back to Home
      </Link>

      {/* Side Navigation - Left Side */}
      <div className={`fixed left-12 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4 transition-all duration-700 ${
        hasEntered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
      }`}>
        <button
          onClick={() => setActiveSection('lords')}
          className={`font-pixel text-sm px-4 py-2 rounded transition-all duration-300 ${
            activeSection === 'lords'
              ? 'bg-gradient-to-r from-primary via-accent-yellow to-secondary text-dark-bg'
              : 'bg-dark-bg/80 text-secondary border border-secondary hover:bg-secondary hover:text-dark-bg'
          }`}
        >
          LORDS
        </button>
        <button
          onClick={() => setActiveSection('origins')}
          className={`font-pixel text-sm px-4 py-2 rounded transition-all duration-300 ${
            activeSection === 'origins'
              ? 'bg-gradient-to-r from-primary via-accent-yellow to-secondary text-dark-bg'
              : 'bg-dark-bg/80 text-secondary border border-secondary hover:bg-secondary hover:text-dark-bg'
          }`}
        >
          ORIGINS
        </button>
        <button
          onClick={() => setActiveSection('language')}
          className={`font-pixel text-sm px-4 py-2 rounded transition-all duration-300 ${
            activeSection === 'language'
              ? 'bg-gradient-to-r from-primary via-accent-yellow to-secondary text-dark-bg'
              : 'bg-dark-bg/80 text-secondary border border-secondary hover:bg-secondary hover:text-dark-bg'
          }`}
        >
          LANGUAGE
        </button>
        <button
          onClick={() => setActiveSection('cards')}
          className={`font-pixel text-sm px-4 py-2 rounded transition-all duration-300 ${
            activeSection === 'cards'
              ? 'bg-gradient-to-r from-primary via-accent-yellow to-secondary text-dark-bg'
              : 'bg-dark-bg/80 text-secondary border border-secondary hover:bg-secondary hover:text-dark-bg'
          }`}
        >
          CARDS
        </button>

        {/* Audio Controls - Below Nav */}
        <div className="flex flex-col gap-3 bg-dark-bg/80 border border-secondary rounded-lg p-4 mt-4">
          <div className="font-pixel text-xs text-secondary text-center">AUDIO</div>
          
          {/* Play/Pause Button - Centered */}
          <div className="flex justify-center">
            <button
              onClick={toggleAudio}
              className="w-10 h-10 rounded-full bg-secondary hover:bg-primary transition-all duration-300 flex items-center justify-center"
              aria-label={isAudioPlaying ? 'Pause music' : 'Play music'}
            >
              {isAudioPlaying ? (
                <svg className="w-5 h-5 text-dark-bg" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-dark-bg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Volume Slider - Horizontal */}
          <div className="flex flex-col gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={audioVolume * 100}
              onChange={(e) => setAudioVolume(Number(e.target.value) / 100)}
              className="w-full h-2 bg-dark-bg rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary hover:[&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-secondary [&::-moz-range-thumb]:border-0"
              aria-label="Volume control"
            />
            <div className="flex justify-between items-center">
              <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3z"/>
              </svg>
              <span className="font-pixel text-xs text-secondary">{Math.round(audioVolume * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sliding Sections Container */}
      <div className="relative w-full overflow-hidden h-screen">
        {/* LORDS OF THE BAGAVERSE */}
        <div 
          className={`transition-all duration-700 ease-in-out ${
            activeSection === 'lords' 
              ? 'translate-x-0 opacity-100' 
              : activeSection === 'origins'
              ? '-translate-x-full opacity-0 absolute inset-0'
              : '-translate-x-full opacity-0 absolute inset-0'
          }`}
        >
          <div 
            className={`relative w-full max-w-[70vw] mx-auto mt-8 z-10 transition-all duration-[1500ms] ease-out delay-300 ${
              hasEntered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'
            }`}
          >
            <h2 
              className="font-pixel text-5xl text-center mb-4 bg-gradient-to-r from-primary via-accent-yellow to-secondary bg-clip-text text-transparent"
              style={{
                textShadow: '0 0 20px rgba(255,51,102,0.5), 0 0 40px rgba(255,215,0,0.3)',
              }}
            >
              LORDS OF THE BAGAVERSE
            </h2>

            <div className="relative p-1 rounded-2xl bg-gradient-to-r from-primary via-accent-yellow to-secondary">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary via-accent-yellow to-secondary blur-xl opacity-60" />
              
              <div className="relative rounded-2xl overflow-hidden bg-dark-bg">
                <Image
                  src="/images/bagaverse-map.png"
                  alt="The Bagaverse Map"
                  width={1920}
                  height={1080}
                  className="w-full h-auto"
                  priority
                />

                {cities.map((city) => (
                  <button
                    key={city.id}
                    className={`absolute w-8 h-8 rounded-full border-4 transition-all duration-300 cursor-pointer z-20 ${
                      hoveredCity === city.id
                        ? 'scale-150 animate-pulse opacity-100'
                        : 'scale-100 opacity-0'
                    }`}
                    style={{
                      left: `${city.x}%`,
                      top: `${city.y}%`,
                      borderColor: city.color,
                      backgroundColor: hoveredCity === city.id ? city.color : 'transparent',
                      boxShadow: hoveredCity === city.id 
                        ? `0 0 20px ${city.color}, 0 0 40px ${city.color}`
                        : 'none',
                      transform: `translate(-50%, -50%) ${hoveredCity === city.id ? 'scale(1.5)' : 'scale(1)'}`,
                    }}
                    onMouseEnter={() => handleMouseEnter(city.id)}
                    onMouseLeave={() => setHoveredCity(null)}
                    onClick={() => handleCityClick(city.id)}
                    aria-label={`View ${city.name} character`}
                  >
                    <span className="sr-only">{city.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ORIGINS OF THE BAGAVERSE */}
        <div 
          className={`transition-all duration-700 ease-in-out ${
            activeSection === 'origins' 
              ? 'translate-x-0 opacity-100' 
              : activeSection === 'lords'
              ? 'translate-x-full opacity-0 absolute inset-0'
              : '-translate-x-full opacity-0 absolute inset-0'
          }`}
        >
          <div 
            className={`relative w-full max-w-[70vw] mx-auto mt-8 z-10 transition-all duration-[1500ms] ease-out delay-300 ${
              hasEntered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'
            }`}
          >
            <h2 
              className="font-pixel text-5xl text-center mb-4 bg-gradient-to-r from-primary via-accent-yellow to-secondary bg-clip-text text-transparent"
              style={{
                textShadow: '0 0 20px rgba(255,51,102,0.5), 0 0 40px rgba(255,215,0,0.3)',
              }}
            >
              ORIGINS OF THE BAGAVERSE
            </h2>

            <div className="relative p-1 rounded-2xl bg-gradient-to-r from-primary via-accent-yellow to-secondary">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary via-accent-yellow to-secondary blur-xl opacity-60" />
              
              <div className="relative rounded-2xl overflow-hidden bg-dark-bg">
                <div className="aspect-video w-full">
                  <iframe
                    ref={iframeRef}
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/SdjkbYiu8mw?enablejsapi=1"
                    title="Origins of The Bagaverse"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LANGUAGE OF THE BAGAVERSE */}
        <div 
          className={`transition-all duration-700 ease-in-out ${
            activeSection === 'language' 
              ? 'translate-x-0 opacity-100' 
              : activeSection === 'lords' || activeSection === 'origins'
              ? 'translate-x-full opacity-0 absolute inset-0'
              : '-translate-x-full opacity-0 absolute inset-0'
          }`}
        >
          <div 
            className={`relative w-full max-w-[70vw] mx-auto mt-4 z-10 transition-all duration-[1500ms] ease-out delay-300 ${
              hasEntered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'
            }`}
          >
            <h2 
              className="font-pixel text-5xl text-center mb-4 bg-gradient-to-r from-primary via-accent-yellow to-secondary bg-clip-text text-transparent"
              style={{
                textShadow: '0 0 20px rgba(255,51,102,0.5), 0 0 40px rgba(255,215,0,0.3)',
              }}
            >
              LANGUAGE OF THE BAGAVERSE
            </h2>

            <div className="relative p-1 rounded-2xl bg-gradient-to-r from-primary via-accent-yellow to-secondary">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary via-accent-yellow to-secondary blur-xl opacity-60" />
              
              <div className="relative rounded-2xl overflow-hidden bg-dark-bg">
                <LanguageBook />
              </div>
            </div>
          </div>
        </div>

        {/* CARDS OF THE BAGAVERSE */}
        <div 
          className={`transition-all duration-700 ease-in-out ${
            activeSection === 'cards' 
              ? 'translate-x-0 opacity-100' 
              : 'translate-x-full opacity-0 absolute inset-0'
          }`}
        >
          <div 
            className={`relative w-full max-w-[70vw] mx-auto mt-4 z-10 transition-all duration-[1500ms] ease-out delay-300 ${
              hasEntered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'
            }`}
          >
            <h2 
              className="font-pixel text-5xl text-center mb-4 bg-gradient-to-r from-primary via-accent-yellow to-secondary bg-clip-text text-transparent"
              style={{
                textShadow: '0 0 20px rgba(255,51,102,0.5), 0 0 40px rgba(255,215,0,0.3)',
              }}
            >
              CARDS OF THE BAGAVERSE
            </h2>

            <div className="relative p-1 rounded-2xl bg-gradient-to-r from-primary via-accent-yellow to-secondary">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary via-accent-yellow to-secondary blur-xl opacity-60" />
              
              <div className="relative rounded-2xl overflow-hidden bg-dark-bg p-2 flex flex-col items-center justify-start min-h-[500px]">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src="/images/car-illustration.jpg"
                    alt="Bags Background"
                    fill
                    className="object-cover opacity-20"
                  />
                </div>

                {/* Content - Above Background */}
                <div className="relative z-10 w-full flex flex-col items-center">
                {/* Card Pack and Description - Side by Side - Centered */}
                <div className="flex flex-col md:flex-row gap-4 mb-2">
                  {/* Card Pack Image - Left */}
                  <div className="relative w-80 h-[28rem] flex-shrink-0">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-400 via-yellow-400 to-pink-500 blur-xl opacity-60 animate-pulse" />
                    <Image
                      src="/images/card-pack.png"
                      alt="Bags Bro! Collectible Card Pack"
                      fill
                      className="object-contain drop-shadow-2xl relative z-10"
                    />
                  </div>

                  {/* Description - Right */}
                  <div className="flex-shrink-0 w-[450px] relative top-[45px]">
                    <h3 className="font-pixel text-2xl mb-2 text-secondary">
                      Collectible Card Packs
                    </h3>
                    <p className="font-mono text-base text-white/90 leading-relaxed mb-4">
                      Dive into the Bagaverse with our exclusive NFT Collectible Card Packs! Each pack contains <span className="text-accent-yellow font-bold">5 random cards</span> featuring legendary bag characters, rare items, and epic moments from across the Bagaverse.
                    </p>
                    <p className="font-mono text-base text-white/90 leading-relaxed">
                      Mint a pack, crack it open, and discover what treasures await. With varying levels of rarity, every pull is a chance to snag something truly legendary. Collect them all, trade with friends, or hold onto that ultra-rare pull — the bag is yours!
                    </p>
                  </div>
                </div>

                {/* Card Grid - 5 Cards */}
                <div className="grid grid-cols-5 gap-4 w-[1000px] mb-4">
                  {/* Card 1 - Fox Mulderbag - Cyan glow */}
                  <div className="relative aspect-[2/3]">
                    <div className="absolute -inset-2 bg-secondary rounded-lg blur-lg opacity-60 animate-pulse" />
                    <div className="relative rounded-lg overflow-hidden border-2 border-secondary hover:scale-105 transition-transform duration-300 h-full">
                      <Image
                        src="/images/mulderbag.png"
                        alt="Fox Mulderbag"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Card 2 - Placeholder - Pink glow */}
                  <div className="relative aspect-[2/3]">
                    <div className="absolute -inset-2 bg-primary rounded-lg blur-lg opacity-60 animate-pulse" />
                    <div className="relative rounded-lg overflow-hidden border-2 border-primary hover:scale-105 transition-transform duration-300 h-full">
                      <Image
                        src="/images/pawblo.png"
                        alt="Lil Pawblo"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Card 3 - Placeholder - Yellow glow */}
                  <div className="relative aspect-[2/3]">
                    <div className="absolute -inset-2 bg-accent-yellow rounded-lg blur-lg opacity-60 animate-pulse" />
                    <div className="relative rounded-lg overflow-hidden border-2 border-accent-yellow hover:scale-105 transition-transform duration-300 h-full">
                      <Image
                        src="/images/icebag.png"
                        alt="Icebag Slim"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Card 4 - Placeholder - Cyan glow */}
                  <div className="relative aspect-[2/3]">
                    <div className="absolute -inset-2 bg-secondary rounded-lg blur-lg opacity-60 animate-pulse" />
                    <div className="relative rounded-lg overflow-hidden border-2 border-secondary hover:scale-105 transition-transform duration-300 h-full">
                      <Image
                        src="/images/lundbag.png"
                        alt="Dolph Lundbag"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Card 5 - Placeholder - Pink glow */}
                  <div className="relative aspect-[2/3]">
                    <div className="absolute -inset-2 bg-primary rounded-lg blur-lg opacity-60 animate-pulse" />
                    <div className="relative rounded-lg overflow-hidden border-2 border-primary hover:scale-105 transition-transform duration-300 h-full">
                      <Image
                        src="/images/khan.png"
                        alt="Baggus Khan"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NFT Character Modal */}
      {selectedCharacter && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={handleCloseModal}
        >
          <div className="relative p-1 rounded-xl bg-white max-w-5xl w-full">
            <div className="absolute inset-0 rounded-xl bg-white blur-xl opacity-60" />
            
            <div
              className="relative bg-dark-bg rounded-xl p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-4xl font-bold transition-colors hover:text-white"
                style={{
                  color: cities.find(c => c.id === selectedCharacter.cityId)?.color,
                }}
              >
                ×
              </button>

              <div className="grid md:grid-cols-[400px_1fr] gap-8 items-start">
                <div className="flex flex-col items-center gap-4">
                  <div 
                    className="relative w-full aspect-square rounded-xl overflow-hidden border-4 border-white"
                    style={{
                      boxShadow: '0 0 20px rgba(255, 255, 255, 0.6)',
                    }}
                  >
                    <Image 
                      src={selectedCharacter.image} 
                      alt={selectedCharacter.name} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  
                  <div 
                    className="font-pixel text-sm text-center"
                    style={{
                      color: cities.find(c => c.id === selectedCharacter.cityId)?.color,
                    }}
                  >
                    {cities.find(c => c.id === selectedCharacter.cityId)?.name}
                  </div>
                </div>

                <div className="flex flex-col">
                  <h3 
                    className="font-pixel text-4xl mb-3 bg-gradient-to-r from-primary via-accent-yellow to-secondary bg-clip-text text-transparent"
                  >
                    {selectedCharacter.name}
                  </h3>
                  <p className="font-mono text-base leading-relaxed text-white/90 max-h-[400px] overflow-y-auto whitespace-pre-line">
                    {selectedCharacter.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}