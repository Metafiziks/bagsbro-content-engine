'use client';

import CharacterCard from './CharacterCard';

const characters = [
  {
    image: '/images/harold.png',
    title: 'Harold and Baby Blickey',
    previewText: "Howdy! Name's Harold...proud farmer from the quiet town of Normieville, USA. I've got a lovely wife, Virginia, and two wonderful kids, Michael and Sylvia. We lived a simple life, tending our land with love and hard work. But one day, a brutal storm tore through our fields, leaving everything we built in ruins.",
    fullText: `Howdy! Name's Harold...proud farmer from the quiet town of Normieville, USA. I've got a lovely wife, Virginia, and two wonderful kids, Michael and Sylvia. We lived a simple life, tending our land with love and hard work. But one day, a brutal storm tore through our fields, leaving everything we built in ruins. I didn't know how we'd bounce back.

That's when I met Baby Blickey - a small blue bag with a big heart. He showed up out of nowhere, looked me dead in the eye and said, "Don't worry fam, I gotchou." Then he tore off a piece of himself and gave it to me. Said it'd help rebuild the farm.

In return? He asked if I'd help him become a Cosmic Bag. I said yes without blinking. He saved my farm. Least I could do was help him chase his dreams... and maybe, just maybe, secure a few bigger bags along the way.`
  },
  {
    image: '/images/fam.png',
    title: 'The Fam-Bam',
    previewText: "I'm Virginia, and I've lived my whole life here in Normieville. Raised two wonderful kids, helped Harold run this farm through sunshine and storm. But I've never seen anything like Baby Blickey. He just showed up, all smiles and sparkles, talking about portals and pixel lands.",
    fullText: `I'm Virginia, and I've lived my whole life here in Normieville. Raised two wonderful kids, helped Harold run this farm through sunshine and storm.

But I've never seen anything like Baby Blickey. He just…showed up, all smiles and sparkles, talking about portals to some magic crypto pixel land called The Bagaverse where bags just spawn coins like fertile chickens hatching eggs. Baby Blickey claims his destiny is to become a Cosmic Bag and that Harold is the key.

Harold believes him. He swears The Bagaverse is real, and that it could change our lives. I don't know if I believe in other dimensions. But I believe in Harold. And maybe that's enough.`
  }
];

export default function GallerySection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Video Section */}
      <div className="relative h-screen flex items-start justify-center overflow-hidden pt-24">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/video/car-animation.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/30 via-transparent to-dark-bg" />
        
        <div className="relative z-10 text-center">
          <h2 className="font-pixel text-3xl md:text-5xl font-bold text-accent-yellow drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]" style={{ textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.4), 3px 3px 0 rgba(0,0,0,0.8)' }}>
            Enter The Bagaverse
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-accent-yellow to-[#FFD700] mx-auto mt-8 shadow-[0_0_10px_rgba(255,215,0,0.6)]" />
        </div>
      </div>

      {/* Normieville Section */}
      <div className="relative py-32 px-8 bg-gradient-to-b from-dark-bg to-blue-dark overflow-hidden">
        {/* Animated pixel dust background - 200 randomly dispersed pixels! */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '16.0%', left: '36.8%', animationDuration: '4.3s', animationDelay: '0.9s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '77.2%', left: '33.1%', animationDuration: '4.3s', animationDelay: '2.0s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '6.0%', left: '26.8%', animationDuration: '3.8s', animationDelay: '1.4s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '7.7%', left: '68.2%', animationDuration: '5.5s', animationDelay: '0.4s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '25.0%', left: '57.6%', animationDuration: '4.9s', animationDelay: '1.6s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '96.5%', left: '9.6%', animationDuration: '3.1s', animationDelay: '1.9s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '16.4%', left: '91.9%', animationDuration: '3.8s', animationDelay: '0.6s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '80.2%', left: '61.8%', animationDuration: '4.8s', animationDelay: '0.4s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '58.7%', left: '8.3%', animationDuration: '5.0s', animationDelay: '1.1s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '54.3%', left: '7.2%', animationDuration: '3.4s', animationDelay: '1.6s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '97.0%', left: '73.9%', animationDuration: '5.3s', animationDelay: '0.5s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '26.4%', left: '24.2%', animationDuration: '5.9s', animationDelay: '1.2s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '76.0%', left: '87.9%', animationDuration: '4.5s', animationDelay: '1.7s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '32.3%', left: '84.3%', animationDuration: '4.1s', animationDelay: '1.2s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '53.3%', left: '21.6%', animationDuration: '4.4s', animationDelay: '0.6s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '6.9%', left: '16.5%', animationDuration: '4.8s', animationDelay: '1.1s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '83.5%', left: '8.6%', animationDuration: '3.1s', animationDelay: '0.6s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '97.5%', left: '95.5%', animationDuration: '3.7s', animationDelay: '1.3s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '72.1%', left: '3.3%', animationDuration: '4.2s', animationDelay: '1.7s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '76.6%', left: '67.3%', animationDuration: '4.8s', animationDelay: '0.8s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '29.9%', left: '50.0%', animationDuration: '3.5s', animationDelay: '0.5s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '13.0%', left: '77.9%', animationDuration: '4.3s', animationDelay: '1.7s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '43.4%', left: '8.0%', animationDuration: '4.7s', animationDelay: '1.0s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '80.4%', left: '96.5%', animationDuration: '3.9s', animationDelay: '1.4s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '18.0%', left: '28.6%', animationDuration: '3.5s', animationDelay: '1.8s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '73.8%', left: '4.6%', animationDuration: '3.1s', animationDelay: '1.9s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '52.5%', left: '56.7%', animationDuration: '3.5s', animationDelay: '0.4s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '68.0%', left: '94.7%', animationDuration: '4.3s', animationDelay: '0.8s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '65.8%', left: '54.7%', animationDuration: '5.2s', animationDelay: '0.8s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '34.6%', left: '92.8%', animationDuration: '5.2s', animationDelay: '1.2s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '84.1%', left: '23.9%', animationDuration: '5.4s', animationDelay: '0.1s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '46.9%', left: '34.7%', animationDuration: '5.7s', animationDelay: '0.4s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '55.9%', left: '89.9%', animationDuration: '4.8s', animationDelay: '1.1s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '66.1%', left: '40.2%', animationDuration: '4.0s', animationDelay: '1.7s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '48.8%', left: '28.1%', animationDuration: '5.2s', animationDelay: '0.2s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '6.2%', left: '92.1%', animationDuration: '5.3s', animationDelay: '0.8s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '92.9%', left: '92.5%', animationDuration: '5.8s', animationDelay: '1.0s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '53.6%', left: '24.3%', animationDuration: '3.4s', animationDelay: '1.3s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '92.7%', left: '22.6%', animationDuration: '4.0s', animationDelay: '1.2s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '25.3%', left: '80.3%', animationDuration: '4.6s', animationDelay: '0.1s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '24.6%', left: '49.2%', animationDuration: '4.9s', animationDelay: '0.4s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '21.9%', left: '5.6%', animationDuration: '5.9s', animationDelay: '1.2s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '59.9%', left: '33.4%', animationDuration: '3.7s', animationDelay: '1.3s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '55.3%', left: '64.7%', animationDuration: '3.9s', animationDelay: '1.1s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '84.8%', left: '2.6%', animationDuration: '3.9s', animationDelay: '1.6s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '63.1%', left: '56.1%', animationDuration: '5.1s', animationDelay: '0.1s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '46.6%', left: '59.5%', animationDuration: '4.9s', animationDelay: '1.4s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '65.5%', left: '64.3%', animationDuration: '5.1s', animationDelay: '1.3s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '38.9%', left: '94.5%', animationDuration: '4.4s', animationDelay: '0.7s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '29.4%', left: '29.8%', animationDuration: '5.2s', animationDelay: '1.7s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '8.1%', left: '18.3%', animationDuration: '3.4s', animationDelay: '0.2s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '21.0%', left: '94.2%', animationDuration: '5.2s', animationDelay: '1.0s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '17.5%', left: '55.5%', animationDuration: '5.2s', animationDelay: '1.9s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '8.6%', left: '46.0%', animationDuration: '4.0s', animationDelay: '0.2s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '28.6%', left: '38.9%', animationDuration: '5.1s', animationDelay: '1.1s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '58.6%', left: '39.5%', animationDuration: '4.1s', animationDelay: '1.8s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '70.2%', left: '35.4%', animationDuration: '3.9s', animationDelay: '1.7s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '79.9%', left: '27.3%', animationDuration: '4.1s', animationDelay: '0.8s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '22.8%', left: '92.6%', animationDuration: '5.2s', animationDelay: '1.2s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '16.8%', left: '59.5%', animationDuration: '3.4s', animationDelay: '1.3s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '8.6%', left: '38.5%', animationDuration: '5.6s', animationDelay: '0.5s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '32.9%', left: '7.6%', animationDuration: '5.3s', animationDelay: '0.3s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '29.2%', left: '88.2%', animationDuration: '5.9s', animationDelay: '1.1s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '38.9%', left: '34.5%', animationDuration: '4.8s', animationDelay: '1.2s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '4.5%', left: '75.1%', animationDuration: '5.7s', animationDelay: '0.4s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '41.1%', left: '80.7%', animationDuration: '4.5s', animationDelay: '0.7s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '59.0%', left: '44.9%', animationDuration: '5.5s', animationDelay: '1.8s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '24.4%', left: '48.6%', animationDuration: '4.7s', animationDelay: '0.3s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '61.5%', left: '67.7%', animationDuration: '3.6s', animationDelay: '1.4s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '57.5%', left: '64.8%', animationDuration: '4.0s', animationDelay: '1.2s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '2.9%', left: '3.3%', animationDuration: '5.8s', animationDelay: '0.7s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '11.9%', left: '52.1%', animationDuration: '3.2s', animationDelay: '1.3s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '87.4%', left: '14.2%', animationDuration: '4.5s', animationDelay: '1.6s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '85.9%', left: '4.4%', animationDuration: '4.3s', animationDelay: '1.9s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '10.0%', left: '10.0%', animationDuration: '3.5s', animationDelay: '0.9s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '28.3%', left: '42.9%', animationDuration: '3.5s', animationDelay: '0.9s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '77.7%', left: '22.4%', animationDuration: '4.5s', animationDelay: '1.3s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '68.5%', left: '95.4%', animationDuration: '5.4s', animationDelay: '1.1s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '17.4%', left: '19.6%', animationDuration: '4.7s', animationDelay: '0.0s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '8.5%', left: '67.7%', animationDuration: '5.7s', animationDelay: '1.1s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '53.2%', left: '67.7%', animationDuration: '4.4s', animationDelay: '1.1s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '90.1%', left: '13.2%', animationDuration: '5.1s', animationDelay: '1.0s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '62.7%', left: '97.9%', animationDuration: '4.6s', animationDelay: '0.6s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '27.0%', left: '5.1%', animationDuration: '5.7s', animationDelay: '0.4s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '90.2%', left: '28.9%', animationDuration: '3.6s', animationDelay: '0.4s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '67.9%', left: '64.9%', animationDuration: '4.9s', animationDelay: '0.6s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '84.5%', left: '24.7%', animationDuration: '4.0s', animationDelay: '1.4s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '74.3%', left: '81.4%', animationDuration: '5.6s', animationDelay: '1.5s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '60.5%', left: '62.9%', animationDuration: '3.9s', animationDelay: '1.9s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '11.1%', left: '70.2%', animationDuration: '5.6s', animationDelay: '0.7s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '42.4%', left: '37.2%', animationDuration: '5.5s', animationDelay: '1.1s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '81.9%', left: '27.2%', animationDuration: '4.3s', animationDelay: '1.5s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '5.9%', left: '96.9%', animationDuration: '5.0s', animationDelay: '0.4s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '16.2%', left: '23.1%', animationDuration: '4.1s', animationDelay: '1.8s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '79.1%', left: '61.2%', animationDuration: '5.0s', animationDelay: '0.1s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '95.3%', left: '10.3%', animationDuration: '4.5s', animationDelay: '0.4s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '95.9%', left: '38.4%', animationDuration: '4.6s', animationDelay: '1.8s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '67.1%', left: '59.0%', animationDuration: '5.8s', animationDelay: '1.1s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '44.8%', left: '85.9%', animationDuration: '4.2s', animationDelay: '1.7s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '46.8%', left: '28.8%', animationDuration: '5.0s', animationDelay: '0.5s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '41.9%', left: '48.1%', animationDuration: '5.7s', animationDelay: '1.3s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '28.8%', left: '38.0%', animationDuration: '4.6s', animationDelay: '0.1s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '32.4%', left: '77.9%', animationDuration: '3.4s', animationDelay: '1.8s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '78.5%', left: '43.6%', animationDuration: '4.7s', animationDelay: '1.3s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '74.6%', left: '4.8%', animationDuration: '3.9s', animationDelay: '0.5s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '33.3%', left: '46.9%', animationDuration: '3.8s', animationDelay: '1.0s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '86.2%', left: '78.1%', animationDuration: '3.7s', animationDelay: '0.9s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '7.1%', left: '88.6%', animationDuration: '5.5s', animationDelay: '0.3s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '86.3%', left: '22.5%', animationDuration: '4.3s', animationDelay: '1.4s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '18.8%', left: '46.3%', animationDuration: '3.5s', animationDelay: '0.3s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '65.6%', left: '81.2%', animationDuration: '4.2s', animationDelay: '1.6s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '39.5%', left: '82.8%', animationDuration: '5.0s', animationDelay: '0.6s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '45.7%', left: '31.3%', animationDuration: '4.5s', animationDelay: '1.4s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '9.2%', left: '69.9%', animationDuration: '5.4s', animationDelay: '0.0s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '71.2%', left: '9.5%', animationDuration: '5.6s', animationDelay: '1.2s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '17.6%', left: '15.7%', animationDuration: '3.6s', animationDelay: '0.9s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '90.9%', left: '8.8%', animationDuration: '3.4s', animationDelay: '0.6s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '84.1%', left: '56.1%', animationDuration: '4.9s', animationDelay: '1.5s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '62.7%', left: '71.2%', animationDuration: '3.9s', animationDelay: '1.6s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '19.7%', left: '52.2%', animationDuration: '5.7s', animationDelay: '0.1s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '27.2%', left: '3.4%', animationDuration: '5.5s', animationDelay: '0.4s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '91.9%', left: '39.2%', animationDuration: '4.7s', animationDelay: '1.3s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '67.7%', left: '86.7%', animationDuration: '5.4s', animationDelay: '1.6s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '71.5%', left: '68.6%', animationDuration: '3.2s', animationDelay: '1.1s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '25.4%', left: '14.4%', animationDuration: '4.4s', animationDelay: '1.6s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '24.6%', left: '33.2%', animationDuration: '5.1s', animationDelay: '0.2s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '41.4%', left: '68.5%', animationDuration: '5.0s', animationDelay: '0.2s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '63.2%', left: '85.9%', animationDuration: '5.4s', animationDelay: '1.0s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '41.6%', left: '78.1%', animationDuration: '4.6s', animationDelay: '1.1s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '61.5%', left: '8.4%', animationDuration: '5.9s', animationDelay: '1.2s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '3.9%', left: '2.8%', animationDuration: '4.1s', animationDelay: '0.6s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '53.7%', left: '56.3%', animationDuration: '3.0s', animationDelay: '0.8s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '94.1%', left: '46.5%', animationDuration: '4.4s', animationDelay: '1.0s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '33.8%', left: '56.8%', animationDuration: '3.3s', animationDelay: '0.6s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '68.2%', left: '64.6%', animationDuration: '5.5s', animationDelay: '0.2s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '38.3%', left: '40.5%', animationDuration: '3.1s', animationDelay: '1.4s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '8.8%', left: '74.8%', animationDuration: '5.9s', animationDelay: '1.3s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '96.6%', left: '67.7%', animationDuration: '5.3s', animationDelay: '0.9s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '83.0%', left: '53.0%', animationDuration: '3.7s', animationDelay: '0.5s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '16.9%', left: '41.4%', animationDuration: '4.2s', animationDelay: '0.2s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '42.6%', left: '83.0%', animationDuration: '3.9s', animationDelay: '1.0s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '87.8%', left: '13.8%', animationDuration: '3.2s', animationDelay: '0.9s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '92.0%', left: '64.5%', animationDuration: '3.5s', animationDelay: '0.6s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '38.4%', left: '84.7%', animationDuration: '4.0s', animationDelay: '0.1s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '41.4%', left: '23.2%', animationDuration: '4.7s', animationDelay: '1.6s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '38.3%', left: '65.7%', animationDuration: '5.8s', animationDelay: '1.0s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '52.2%', left: '68.0%', animationDuration: '4.5s', animationDelay: '1.4s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '58.3%', left: '10.2%', animationDuration: '5.8s', animationDelay: '1.1s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '68.1%', left: '90.6%', animationDuration: '4.7s', animationDelay: '1.0s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '23.2%', left: '48.6%', animationDuration: '4.5s', animationDelay: '0.3s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '42.0%', left: '10.7%', animationDuration: '5.9s', animationDelay: '0.5s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '28.9%', left: '24.2%', animationDuration: '4.8s', animationDelay: '0.8s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '82.6%', left: '24.8%', animationDuration: '3.9s', animationDelay: '1.5s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '90.5%', left: '17.4%', animationDuration: '4.0s', animationDelay: '1.6s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '20.4%', left: '2.8%', animationDuration: '3.8s', animationDelay: '1.4s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '77.9%', left: '22.9%', animationDuration: '5.0s', animationDelay: '1.9s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '22.7%', left: '12.4%', animationDuration: '3.4s', animationDelay: '0.4s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '77.9%', left: '12.3%', animationDuration: '5.5s', animationDelay: '0.4s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '28.6%', left: '4.7%', animationDuration: '3.4s', animationDelay: '1.1s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '4.3%', left: '49.5%', animationDuration: '4.5s', animationDelay: '0.8s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '78.9%', left: '87.5%', animationDuration: '5.7s', animationDelay: '1.3s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '27.2%', left: '81.6%', animationDuration: '5.6s', animationDelay: '1.5s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '13.3%', left: '36.1%', animationDuration: '5.5s', animationDelay: '1.8s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '91.6%', left: '80.7%', animationDuration: '5.9s', animationDelay: '1.6s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '24.8%', left: '68.0%', animationDuration: '4.4s', animationDelay: '1.8s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '47.6%', left: '20.4%', animationDuration: '5.2s', animationDelay: '0.5s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '21.8%', left: '21.9%', animationDuration: '4.1s', animationDelay: '1.2s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '47.8%', left: '84.2%', animationDuration: '3.1s', animationDelay: '0.1s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '46.3%', left: '82.6%', animationDuration: '3.3s', animationDelay: '0.9s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '27.6%', left: '24.4%', animationDuration: '5.1s', animationDelay: '0.1s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '49.5%', left: '26.6%', animationDuration: '5.9s', animationDelay: '1.7s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '76.2%', left: '56.3%', animationDuration: '5.6s', animationDelay: '1.3s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '78.7%', left: '95.0%', animationDuration: '4.2s', animationDelay: '1.3s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '77.4%', left: '11.4%', animationDuration: '3.7s', animationDelay: '0.8s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '62.8%', left: '28.0%', animationDuration: '4.8s', animationDelay: '1.8s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '57.1%', left: '74.2%', animationDuration: '5.7s', animationDelay: '0.4s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '65.3%', left: '12.2%', animationDuration: '3.9s', animationDelay: '1.3s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '17.9%', left: '17.7%', animationDuration: '5.4s', animationDelay: '0.2s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '50.1%', left: '59.8%', animationDuration: '5.4s', animationDelay: '0.2s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '43.1%', left: '53.4%', animationDuration: '4.7s', animationDelay: '0.8s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '84.2%', left: '35.8%', animationDuration: '4.7s', animationDelay: '1.6s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '34.2%', left: '3.6%', animationDuration: '5.1s', animationDelay: '0.8s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '93.7%', left: '26.9%', animationDuration: '5.2s', animationDelay: '1.7s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '40.3%', left: '36.9%', animationDuration: '4.9s', animationDelay: '1.9s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '74.9%', left: '89.2%', animationDuration: '5.4s', animationDelay: '0.8s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '86.8%', left: '28.6%', animationDuration: '5.9s', animationDelay: '0.7s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '61.2%', left: '92.6%', animationDuration: '4.0s', animationDelay: '1.1s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '42.3%', left: '24.6%', animationDuration: '4.1s', animationDelay: '1.3s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '47.4%', left: '5.5%', animationDuration: '5.5s', animationDelay: '0.9s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '44.1%', left: '89.4%', animationDuration: '5.1s', animationDelay: '1.6s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '82.6%', left: '21.9%', animationDuration: '5.1s', animationDelay: '1.0s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '15.6%', left: '48.3%', animationDuration: '3.4s', animationDelay: '0.7s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '34.5%', left: '54.4%', animationDuration: '5.1s', animationDelay: '0.6s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '93.8%', left: '91.3%', animationDuration: '5.3s', animationDelay: '1.1s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '57.6%', left: '80.8%', animationDuration: '4.5s', animationDelay: '0.5s' }} />
          <div className="absolute w-2 h-2 bg-accent-yellow rounded-sm animate-float" style={{ top: '43.8%', left: '52.1%', animationDuration: '5.9s', animationDelay: '0.9s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '53.8%', left: '49.3%', animationDuration: '5.5s', animationDelay: '1.6s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '66.8%', left: '73.8%', animationDuration: '3.7s', animationDelay: '0.4s' }} />
          <div className="absolute w-2 h-2 bg-primary rounded-sm animate-float" style={{ top: '51.5%', left: '18.9%', animationDuration: '4.6s', animationDelay: '0.1s' }} />
          <div className="absolute w-2 h-2 bg-secondary rounded-sm animate-float" style={{ top: '4.7%', left: '64.6%', animationDuration: '6.0s', animationDelay: '1.6s' }} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <h3 className="font-pixel text-2xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary via-accent-yellow to-secondary bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.4))' }}>
            Normieville, USA
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {characters.map((character, index) => (
              <CharacterCard
                key={character.title}
                image={character.image}
                title={character.title}
                previewText={character.previewText}
                fullText={character.fullText}
                index={index}
              />
            ))}
          </div>

          <div className="w-full h-1 bg-gradient-to-r from-primary via-accent-yellow to-secondary shadow-[0_0_20px_rgba(255,51,102,0.8)] mb-16 animate-pulse" />

          <div className="relative w-full rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                src="https://player.cloudinary.com/embed/?cloud_name=dbhqbpbfo&public_id=them-bags_zl15z4&profile=cld-default"
                className="absolute top-0 left-0 w-full h-full"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}