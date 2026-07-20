// scripts/seed-lingo.ts
// Run with: npx ts-node scripts/seed-lingo.ts
// Seeds the full Bags Bro lingo lexicon from the language pages

import { getDb } from '../db/mongodb';

const LINGO_SEED = [
  // ── From Language Pages (images) ──────────────────────────────────────
  {
    term: "BM - Bag Morning",
    definition: "Because every morning is a great opportunity to get to another bag.",
    examples: ["GM is for normies. Real ones say BM."],
    usageContext: ["post", "reply"],
    weight: 7,
  },
  {
    term: "Blickey",
    definition: "The unit of currency most commonly traded in the bagaverse. (formerly Baby Bag)",
    examples: ["this NFT is worth at least 3 blickeys", "sending blickeys your way fam"],
    usageContext: ["both"],
    weight: 9,
  },
  {
    term: "Bagonomics",
    definition: "A branch of knowledge concerned with the production, distribution, and acquisition of bags.",
    examples: ["this is just bagonomics at work ngl", "basic bagonomics right here"],
    usageContext: ["both"],
    weight: 10,
  },
  {
    term: "Bagsbrophysics",
    definition: "A branch of space science that applies the laws of physics and bagonometry to understand the bagaverse and all bag-like phenomena within it. Explores the birth, life and death of bags, bag holes, atomic bags, baganovas, bagulae, and other objects of the bagaverse.",
    examples: ["the bagsbrophysics checks out on this one"],
    usageContext: ["post"],
    weight: 5,
  },
  {
    term: "Baggadocious",
    definition: "Boastful or arrogant about the contents of one's bags or one's ability to secure copious amounts of bags.",
    examples: ["I know it may sound baggadocious, but I don't think I've ever fumbled a bag before."],
    usageContext: ["both"],
    weight: 8,
  },
  {
    term: "Baggish",
    definition: "Optimistic that the value of one's bag holdings will increase considerably over time.",
    examples: ["Yo, did you know that this blickey opens doors to even bigger bags?", "That makes me ever more baggish!"],
    usageContext: ["both"],
    weight: 9,
  },
  {
    term: "Baggamistic",
    definition: "The opposite of being baggish. The belief that the value of bags will decrease. A person may hold baggamistic beliefs about a specific type of bag or about a broad range of bags.",
    examples: ["Ever since Bag Gates stepped down as CEO of Bagsosoft, I've become very baggamistic about the sustainability of their bags."],
    usageContext: ["both"],
    weight: 8,
  },
  {
    term: "Bag Magic",
    definition: "Involves the invocation of supernatural forces or dark spirits in order to gain possession of bags. Bag magic is strictly forbidden; practitioners conduct their work in secrecy, using spells, incantations and charms to summon large quantities of bags away from unsuspecting victims.",
    examples: ["Damn bro, sounds like you got hit with a heavy dose of Bag Magic.", "Next thing you know, I was handing over my seed phrase."],
    usageContext: ["post", "reply"],
    weight: 7,
  },
  {
    term: "Bagsplaining",
    definition: "A unique style of verbal communication in which all phenomena is described through the lens of procuring bags.",
    examples: ["Real bags don't die, they just multiply.", "Hey bro, what do you think happens after we die? / Real bags don't die, they just multiply."],
    usageContext: ["post"],
    weight: 6,
  },
  {
    term: "Bag Blocking",
    definition: "The process in which individuals holding depreciating bags or those unable to accumulate appreciable bag holdings use slander, gaslighting, intimidation, fear, and in some cases acts of violence, to prevent others from securing higher magnitudes of bags.",
    examples: ["I dunno, it sounds like he's probably just bag blocking.", "Did you hear how crazy Chauncy was talking about Sharonda's GoFundMe campaign?"],
    usageContext: ["both"],
    weight: 9,
  },
  {
    term: "Begen",
    definition: "A member of the NFT/Crypto community that is willing to wager considerable quantities of bags for some perceived gain or benefit. Begens are some of the most loyal supporters on the planet; however, begens are highly volatile and loyalty can quickly turn to vitriol if their ever changing needs are not carefully attended to.",
    examples: ["Once a begen, always a begen."],
    usageContext: ["both"],
    weight: 10,
  },
  {
    term: "Lollybagging",
    definition: "To pursue bags nonchalantly, without any sense of urgency, often times in a carefree or frolicky manner.",
    examples: ["Don't be lollybagging or you'll miss the bag!"],
    usageContext: ["both"],
    weight: 8,
  },
  {
    term: "Mind Ya Bagness",
    definition: "A phrase used to thwart others who have become meddlesome into how one acquires bags.",
    examples: ["Bitch, mind ya bagness!", "I performed an analysis of Etherscan transactions... / Mind ya bagness!"],
    usageContext: ["reply"],
    weight: 8,
  },
  {
    term: "The Bagaverse",
    definition: "The sum total of all that exists, including the most minute atomic bags, super-lit baganovas, and densely rich bag holes.",
    examples: ["the bagaverse predicted this", "welcome to the bagaverse anon"],
    usageContext: ["both"],
    weight: 10,
  },
  {
    term: "The Big Bag Theory",
    definition: "A scientific postulate which explains the origins of the bagaverse.",
    examples: ["the big bag theory has entered the chat"],
    usageContext: ["post"],
    weight: 6,
  },

  // ── Extended Bagaverse Lingo ───────────────────────────────────────────
  {
    term: "Bag szn",
    definition: "Accumulation season / bullish period in the bagaverse.",
    examples: ["it's officially bag szn anon", "bag szn don't wait for nobody"],
    usageContext: ["both"],
    weight: 9,
  },
  {
    term: "Bag theory",
    definition: "An elaborate justification for a degen position. Also shorthand for bagaverse philosophy.",
    examples: ["bag theory would agree with this", "the bags predicted this tbh"],
    usageContext: ["both"],
    weight: 10,
  },
  {
    term: "Bag secured",
    definition: "Successfully acquired something valuable.",
    examples: ["bag secured. ngmi if you missed this.", "we made it bro. bags all but secured."],
    usageContext: ["both"],
    weight: 9,
  },
  {
    term: "Full bag mode",
    definition: "All-in on a position or fully committed to the bagaverse worldview.",
    examples: ["currently in full bag mode ngl", "this is full bag mode behavior"],
    usageContext: ["both"],
    weight: 8,
  },
  {
    term: "Bagpilled",
    definition: "Convinced or converted to the Bagaverse worldview.",
    examples: ["anon you need to get bagpilled asap", "once you're bagpilled there's no going back"],
    usageContext: ["post", "reply"],
    weight: 8,
  },
  {
    term: "The bags don't lie",
    definition: "Data/results speak for themselves through the lens of bag theory.",
    examples: ["say what you want. the bags don't lie.", "told you. the bags don't lie."],
    usageContext: ["both"],
    weight: 9,
  },
  {
    term: "Get bagged",
    definition: "To be outsmarted, rekt, or lose your bags.",
    examples: ["bro got bagged lmaooo", "don't sleep or you'll get bagged"],
    usageContext: ["both"],
    weight: 7,
  },
  {
    term: "Bag energy",
    definition: "The vibe or aura of someone committed to securing bags.",
    examples: ["bag energy detected 🛍️", "this is certified bag energy"],
    usageContext: ["reply"],
    weight: 9,
  },
  {
    term: "Certified bagger",
    definition: "Someone who consistently secures bags and knows what they're doing in the bagaverse.",
    examples: ["certified bagger behavior right here", "real certified bagger hours"],
    usageContext: ["both"],
    weight: 10,
  },
  {
    term: "Bag check",
    definition: "Asking about someone's portfolio or current holdings.",
    examples: ["bag check anyone?", "dropping a bag check on this thread"],
    usageContext: ["post"],
    weight: 7,
  },
  {
    term: "Baganova",
    definition: "A massive, explosive bag event — the bag equivalent of a supernova.",
    examples: ["this is a full baganova situation", "baganova incoming for early holders"],
    usageContext: ["post"],
    weight: 5,
  },
  {
    term: "Bag hole",
    definition: "A position so deep you can't get out — the event horizon of bag holding.",
    examples: ["bro fell into a bag hole again", "this is a bag hole and I am at peace with it"],
    usageContext: ["both"],
    weight: 6,
  },
  {
    term: "Blickey",
    definition: "Unit of currency in the bagaverse. Worth exactly one bag's worth of vibes.",
    examples: ["costs about 2 blickeys", "sending blickeys to all baggies"],
    usageContext: ["both"],
    weight: 9,
  },
  {
    term: "Baggies",
    definition: "Bags Bro NFT holders and community members. The citizens of the bagaverse.",
    examples: ["shoutout to all my baggies holding strong", "the baggies knew first"],
    usageContext: ["post"],
    weight: 10,
  },
  {
    term: "Floor sweep incoming",
    definition: "Bullish signal that the NFT floor price is about to be swept up.",
    examples: ["floor sweep incoming. bag accordingly.", "the charts say floor sweep incoming"],
    usageContext: ["post"],
    weight: 7,
  },
];

async function seed() {
  const db = await getDb();
  console.log('Connected to MongoDB...');

  let added = 0;
  let skipped = 0;

  const collection = db.collection('lingo');

  for (const entry of LINGO_SEED) {
    try {
      const result = await collection.updateOne(
        { term: entry.term },
        { $setOnInsert: { ...entry, active: true, usageCount: 0, createdAt: new Date() } },
        { upsert: true }
      );
      if (result.upsertedCount > 0) added++;
      else skipped++;
    } catch (err) {
      console.error(`Failed to seed "${entry.term}":`, err);
      skipped++;
    }
  }

  console.log(`✅ Seeded ${added} lingo entries. Skipped ${skipped} duplicates.`);
  process.exit(0);
}

seed().catch(console.error);
