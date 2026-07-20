// ============================================
// Blockchain Ballers - Game Constants
// ============================================

// Conferences
export const CONFERENCES = {
  EAST: 'EAST',
  WEST: 'WEST',
} as const;

// 10 Teams (5 per conference)
// WEST = Americas + Europe, EAST = Africa/Asia/Pacific
export const TEAMS = [
  // ---- WEST CONFERENCE (Americas + Europe) ----
  { id: 1, name: 'Bagcouver Goobers',       abbreviation: 'BVG', conference: CONFERENCES.WEST, city: 'Bagcouver, B.C., Canada' },
  { id: 2, name: 'Baglyn Loafers',           abbreviation: 'BKL', conference: CONFERENCES.WEST, city: 'Baglyn, N.Y., USA' },
  { id: 3, name: 'Bagston Ragamuffs',        abbreviation: 'BSR', conference: CONFERENCES.WEST, city: 'Bagston, Jamaica' },
  { id: 4, name: 'Bagota Numbskulls',        abbreviation: 'BGN', conference: CONFERENCES.WEST, city: 'Bagota, Colombia' },
  { id: 5, name: 'Bagcelona Mudbrains',      abbreviation: 'BCM', conference: CONFERENCES.WEST, city: 'Bagcelona, Spain' },
  // ---- EAST CONFERENCE (Africa/Asia/Pacific) ----
  { id: 6, name: 'Baguio City Crackpots',    abbreviation: 'BCC', conference: CONFERENCES.EAST, city: 'Baguio City, Philippines' },
  { id: 7, name: 'Bagnin City Bozos',        abbreviation: 'NCB', conference: CONFERENCES.EAST, city: 'Bagnin City, Nigeria' },
  { id: 8, name: 'Bagaluru Boneheads',       abbreviation: 'BLB', conference: CONFERENCES.EAST, city: 'Bagaluru, India' },
  { id: 9, name: 'Bagjing Fumbletons',       abbreviation: 'BJF', conference: CONFERENCES.EAST, city: 'Bagjing, China' },
  { id: 10, name: 'Bagasaki Clodhoppers',    abbreviation: 'BSC', conference: CONFERENCES.EAST, city: 'Bagasaki, Japan' },
] as const;

// ============================================
// NFT Metadata → Team Mapping
// ============================================
// The "city" trait in the Bags Bro! NFT metadata (on IPFS) maps to teams.
// These are the EXACT trait values from the on-chain metadata.
export const NFT_CITY_TO_TEAM_ID: Record<string, number> = {
  'Bagcouver B.C., Canada': 1,    // Bagcouver Goobers
  'Baglyn, N.Y., USA': 2,         // Baglyn Loafers
  'Bagston, Jamaica': 3,          // Bagston Ragamuffs
  'Bagota, Colombia': 4,          // Bagota Numbskulls
  'Bagcelona, Spain': 5,          // Bagcelona Mudbrains
  'Baguio City, Philippines': 6,  // Baguio City Crackpots
  'Bagnin City, Nigeria': 7,      // Bagnin City Bozos
  'Bagaluru, India': 8,           // Bagaluru Boneheads
  'Bagjing, China': 9,            // Bagjing Fumbletons
  'Bagasaki, Japan': 10,          // Bagasaki Clodhoppers
};

// Bags Bro! NFT contract + metadata
export const BAGS_BRO_NFT = {
  CONTRACT_ADDRESS: '0x972969cE330f384287D8a43ce332107348Fad6e5',
  CHAIN_ID: 8453, // Base mainnet
  METADATA_BASE_URI: 'ipfs://bafybeiexmzgoengjjfi5rmqh75hpnwblmzpskaaqn2zy3yuiug6rq6i6wq/',
  IPFS_GATEWAY: 'https://ipfs.io/ipfs/',
  TOTAL_SUPPLY: 5555,
  TOKENS_PER_TEAM: 'VARIES', // 532–600 per city (not perfectly even)
  CITY_TRAIT_KEY: 'city',
} as const;

// Offensive Schemes
export const OFFENSIVE_SCHEMES = {
  RUN_HEAVY: 'RUN_HEAVY',
  PASS_HEAVY: 'PASS_HEAVY',
  RUN_AND_GUN: 'RUN_AND_GUN',
  BALANCED: 'BALANCED',
} as const;

// Defensive Schemes
export const DEFENSIVE_SCHEMES = {
  STACK_BOX: 'STACK_BOX',
  ZONE: 'ZONE',
  BLITZ: 'BLITZ',
  BALANCED: 'BALANCED',
} as const;

// Scheme vs Scheme effectiveness matrix
// Rows = offense, Columns = defense
// Values = offensive advantage multiplier (>1.0 = offense favored, <1.0 = defense favored)
export const SCHEME_MATRIX: Record<string, Record<string, number>> = {
  //                    STACK_BOX  ZONE    BLITZ   BALANCED
  RUN_HEAVY:     { STACK_BOX: 0.7, ZONE: 1.3, BLITZ: 1.1, BALANCED: 1.0 },
  PASS_HEAVY:    { STACK_BOX: 1.4, ZONE: 0.8, BLITZ: 0.6, BALANCED: 1.0 },
  RUN_AND_GUN:   { STACK_BOX: 1.1, ZONE: 1.0, BLITZ: 0.7, BALANCED: 1.1 },
  BALANCED:      { STACK_BOX: 1.0, ZONE: 1.0, BLITZ: 1.0, BALANCED: 1.0 },
};

// Voting
export const VOTING = {
  DRAFT_WINDOW_SECONDS: 25,       // 20-30 sec range, we use 25
  SCHEME_WINDOW_SECONDS: 10,      // 10s to vote on scheme before drive
  MAX_SCHEME_SWITCHES_PER_GAME: 2, // max times a team can CHANGE scheme during intermissions/timeouts
  MIN_QUORUM_PERCENT: 0.1,        // 10% of eligible voters must vote
} as const;

// Game Flow & Intermissions
// Schemes are SET per drive. They can only be CHANGED during:
//   1. Commercial breaks (between quarters, mid-quarter intermission)
//   2. Team timeouts (each team gets 3 per half)
// If no vote happens during the window, the previous scheme carries forward.
export const GAME_FLOW = {
  // Intermission types & durations (simulated seconds)
  INTERMISSION_MID_QUARTER_SECONDS: 60,    // ~real TV timeout, sim-time 60s
  INTERMISSION_BETWEEN_QUARTERS_SECONDS: 120, // end of Q1/Q3
  INTERMISSION_HALFTIME_SECONDS: 300,      // halftime show
  // Timeouts
  TIMEOUTS_PER_HALF: 3,                   // each team gets 3 per half
  TIMEOUT_DURATION_SECONDS: 60,            // sim-time for a timeout
  // Scheme voting windows open during intermissions/timeouts
  SCHEME_VOTE_WINDOW_SECONDS: 10,          // 10s for fans to vote (same as VOTING)
  // Mid-quarter intermission triggers (simulated game clock thresholds)
  // Triggers once per quarter when gameClock crosses this threshold
  MID_QUARTER_INTERMISSION_CLOCK: 420,     // at ~7:00 remaining in quarter (900 - 420 = 480s elapsed)
  // Default starting schemes (before any votes)
  DEFAULT_OFFENSE_SCHEME: 'BALANCED' as const,
  DEFAULT_DEFENSE_SCHEME: 'ZONE' as const,
} as const;

// Intermission trigger points per quarter (for the orchestrator to know when to pause)
export type IntermissionTrigger =
  | 'MID_QUARTER'            // mid-quarter TV timeout
  | 'END_OF_QUARTER'         // between Q1→Q2, Q3→Q4
  | 'HALFTIME'               // between Q2→Q3
  | 'TEAM_TIMEOUT';          // called by a team (via vote or auto)

// Reputation
export const REPUTATION = {
  MIN_MULTIPLIER: 0.5,
  MAX_MULTIPLIER: 1.5,
  DEFAULT_MULTIPLIER: 1.0,
  WIN_INCREMENT: 0.02,
  LOSS_DECREMENT: 0.01,
} as const;

// Injuries
export const INJURIES = {
  SHORT_TERM_MIN_GAMES: 1,
  SHORT_TERM_MAX_GAMES: 3,
  SEASON_ENDING_PROBABILITY: 0.005,  // 0.5% per snap-eligible play
  CAREER_ENDING_PROBABILITY: 0.0005, // 0.05%
} as const;

// Prediction Markets
export const PREDICTION_MARKETS = {
  MICRO_WINDOW_SECONDS: 90,   // 30-120 sec deposit window
  TREASURY_FEE_PERCENT: 1.5,  // 1-2% range
} as const;

// Boosts
export const BOOSTS = {
  MAX_PERFORMANCE_BOOSTS_PER_TEAM_PER_GAME: 2,
  PERFORMANCE_BOOST_MULTIPLIER: 1.1, // +10% OVR for 1 game
  RECOVERY_BOOST_REDUCTION_GAMES: 1,
} as const;

// Season structure
export const SEASON = {
  REGULAR_SEASON_GAMES: 10,   // per team (8 intra-conference + 2 cross-conference)
  INTRA_CONFERENCE_GAMES: 8,  // play each conf opponent twice (4 opponents × 2)
  CROSS_CONFERENCE_GAMES: 2,  // 2 cross-conference matchups
  PLAYOFF_TEAMS: 4,           // top 2 per conference
  QUARTERS_PER_GAME: 4,
  DRIVES_PER_QUARTER_APPROX: 3,
  // Playoff structure: Conf Championship → Super Bowl
  PLAYOFF_ROUNDS: ['CONFERENCE_CHAMPIONSHIP', 'SUPER_BOWL'] as readonly string[],
} as const;

// NFT Collection
export const NFT = {
  TOTAL_SUPPLY: 5555,
  NFTS_PER_TEAM: 555,         // 5555 / 10 teams
  COLLECTION_NAME: 'Bags Bro!',
} as const;

// Player positions
export const POSITIONS = {
  // Offense
  QB: 'QB',
  RB: 'RB',
  WR: 'WR',
  TE: 'TE',
  OL: 'OL',
  // Defense
  DL: 'DL',
  LB: 'LB',
  CB: 'CB',
  S: 'S',
  // Special
  K: 'K',
  P: 'P',
} as const;

// ============================================
// MUST-ADD #1: Sim Seed / Fairness Verification
// ============================================
// The simulation seed is derived from on-chain data so no one
// (including us) can predict or manipulate outcomes.
export const SIM_FAIRNESS = {
  // Seed = keccak256(gameId + prevBlockHash + seasonSalt)
  // prevBlockHash is captured at game schedule time (immutable)
  // seasonSalt is set once at season start (on-chain, public)
  SEED_COMPONENTS: ['gameId', 'prevBlockHash', 'seasonSalt'] as readonly string[],

  // After game, anyone can re-run the sim with the same seed
  // and verify the result matches the on-chain hash
  VERIFICATION_ENABLED: true,

  // Game result hash: keccak256(gameId + homeScore + awayScore + playCount + seed)
  // Stored on-chain for anyone to verify
  RESULT_HASH_COMPONENTS: ['gameId', 'homeScore', 'awayScore', 'totalPlays', 'seed'] as readonly string[],
} as const;

// ============================================
// MUST-ADD #2: Oracle + Settlement Security
// ============================================
export const ORACLE = {
  // Only the authorized oracle wallet can submit game results
  // This is the backend service's wallet (ORACLE_PRIVATE_KEY in env)
  MAX_RESULT_SUBMISSION_DELAY_SECONDS: 300,  // 5 min after sim completes

  // Settlement requires: oracle submits → timelock → finalized
  // During timelock, anyone can challenge with a re-simulation
  SETTLEMENT_TIMELOCK_SECONDS: 3600, // 1 hour challenge window

  // If challenged: compare result hashes
  // If mismatch: escalate to admin multisig
  CHALLENGE_ENABLED: true,

  // Prediction market settlement waits for game finalization
  PREDICTION_SETTLEMENT_DELAY_SECONDS: 3660, // after timelock + 60s buffer

  // Multi-sig for emergency override (e.g., disputed game)
  ADMIN_MULTISIG_THRESHOLD: 2,  // 2-of-3 signers
} as const;

// ============================================
// MUST-ADD #3: BLICKIES Virtual Currency + Treasury
// ============================================
export const BLICKIES = {
  NAME: 'BLICKIES',
  SYMBOL: '$BLICKIES',
  EXCHANGE_RATE: 1.0,  // $1 USD = 1 BLICKEY

  // Purchase methods
  PURCHASE_METHODS: ['STRIPE', 'CRYPTO'] as readonly string[],

  // Minimum purchase
  MIN_PURCHASE: 5,     // 5 BLICKIES ($5)
  MAX_PURCHASE: 10000, // 10,000 BLICKIES ($10,000)
} as const;

export const SEASONS_ECONOMY = {
  // Free seasons: no ante, prize pool funded by in-game spending
  FREE: {
    ANTE: 0,
    PRIZE_POOL_SOURCE: 'IN_GAME_REVENUE', // % of prediction fees + boost sales
    REVENUE_TO_PRIZE_POOL_PERCENT: 60,     // 60% of in-game revenue → prizes
    REVENUE_TO_OPERATIONS_PERCENT: 40,     // 40% → ops
  },

  // Premium seasons: ante required, bigger prize pools
  PREMIUM: {
    ANTE: 50,  // 50 BLICKIES ($50) per holder to enter
    // Prize pool = sum of all antes + in-game revenue share
    REVENUE_TO_PRIZE_POOL_PERCENT: 75,
    REVENUE_TO_OPERATIONS_PERCENT: 25,
  },

  // Prize distribution (% of prize pool)
  PRIZE_DISTRIBUTION: {
    SUPER_BOWL_WINNER_PERCENT: 40,
    SUPER_BOWL_RUNNER_UP_PERCENT: 20,
    CONF_CHAMPIONSHIP_LOSERS_PERCENT: 15, // split between 2 teams
    REGULAR_SEASON_MVP_PERCENT: 10,
    TOP_FAN_REWARDS_PERCENT: 15,          // split across top fans per team
  },

  // Prizes distributed pro-rata to holders of winning team
  // e.g., Super Bowl winner pot split across all 555 NFT holders of that team
} as const;

// Prediction market fees
export const PREDICTION_FEES = {
  TREASURY_FEE_PERCENT: 5, // 5% of every prediction pot goes to treasury
} as const;

// ============================================
// MUST-ADD #4: Admin Console + Emergency Controls
// ============================================
export const ADMIN = {
  // Circuit breakers — admin can trigger these
  EMERGENCY_ACTIONS: [
    'PAUSE_ALL_GAMES',          // stop all active simulations
    'PAUSE_PREDICTIONS',        // freeze all prediction markets
    'PAUSE_VOTING',             // freeze all vote windows
    'PAUSE_BOOSTS',             // freeze boost purchases
    'VOID_GAME',                // cancel a specific game (refund predictions)
    'FORCE_SETTLE_MARKET',      // manually settle a stuck prediction market
    'BAN_WALLET',               // block a wallet from all participation
    'OVERRIDE_GAME_RESULT',     // emergency multisig override (requires 2-of-3)
  ] as readonly string[],

  // Role-based access
  ROLES: {
    SUPER_ADMIN: 'SUPER_ADMIN',     // full control (multisig)
    GAME_ADMIN: 'GAME_ADMIN',       // manage seasons, games, schedule
    MOD: 'MOD',                     // ban wallets, manage fans
  } as const,

  // Audit log: every admin action is recorded with timestamp + actor
  AUDIT_LOG_ENABLED: true,

  // Rate limits for admin actions (prevent accidental spam)
  MAX_ADMIN_ACTIONS_PER_HOUR: 50,
} as const;

// ============================================
// MUST-ADD #5: Fan Sybil / Anti-Spam Enforcement
// ============================================
export const FAN_ANTI_SPAM = {
  // Registration gates
  MIN_X_ACCOUNT_AGE_DAYS: 30,       // X account must be 30+ days old
  MIN_X_FOLLOWERS: 10,               // minimum follower count
  MAX_WALLETS_PER_X_ACCOUNT: 1,     // 1 wallet per X handle per season
  MAX_X_ACCOUNTS_PER_WALLET: 1,     // 1 X handle per wallet per season

  // Interaction scoring penalties
  DUPLICATE_CONTENT_PENALTY: 0.9,    // 90% score reduction for duplicate text
  RAPID_FIRE_THRESHOLD_SECONDS: 30,  // replies within 30s of each other = suspicious
  RAPID_FIRE_PENALTY: 0.5,           // 50% score reduction
  BOT_PATTERN_ZERO_SCORE: true,      // detected bot patterns = 0 score

  // Bot detection signals
  BOT_SIGNALS: [
    'IDENTICAL_REPLY_TEXT',           // same text across multiple tweets
    'SUB_5_SECOND_REPLIES',           // humanly impossible reply speed
    'TEMPLATE_PATTERN',               // "Go team! #hashtag" repeated verbatim
    'NEW_ACCOUNT_BURST',              // new X account + high volume immediately
    'COORDINATED_TIMING',             // multiple accounts posting at exact same second
  ] as readonly string[],

  // Cooldown: max interactions scored per fan per game
  MAX_SCORED_INTERACTIONS_PER_GAME: 10,

  // Appeal process
  APPEAL_ENABLED: true,
  APPEAL_REVIEW_WINDOW_HOURS: 48,
} as const;

// ============================================
// Bagified Player Name System (scaffold)
// ============================================
// Deterministic rename: bagName = Bagify(hash(sourceId) % nameBank)
// Preserves initials pattern (e.g., "T. Brady" → "T. Bagley")
// Only bagName + playerId stored on-chain; never the real name.
// UI can offer optional off-chain "IRL compare" toggle.
export const BAGIFY = {
  // First name pun bank (keyed by first initial)
  FIRST_NAMES: {
    A: ['Aeron', 'Armani-Bag', 'Attaché'],
    B: ['Briquet', 'Buckle', 'Bindle'],
    C: ['Curtain', 'Clutch', 'Carryall'],
    D: ['Duffel', 'Drawstring', 'Daypack'],
    E: ['Envelope', 'Everyday', 'Express'],
    F: ['Fanny', 'Flap', 'Fold'],
    G: ['Garment', 'Grip', 'Gunny'],
    H: ['Hobo', 'Haul', 'Holdall'],
    I: ['Insulated', 'Iconic', 'Ivy-Bag'],
    J: ['J-Sack', 'Jetpack', 'Jumbo'],
    K: ['Kit', 'Knapsack', 'Keeper'],
    L: ['Luggage', 'Laptop', 'Loot'],
    M: ['Messenger', 'Mini-Bag', 'Manbag'],
    N: ['Napsack', 'Netbag', 'Nomad'],
    O: ['Overnight', 'Oxford', 'Outbag'],
    P: ['Packtrick', 'Pouch', 'Portmanteau'],
    Q: ['Quilted', 'Quick-Zip', 'Quiver'],
    R: ['Rucksack', 'Roller', 'Reusable'],
    S: ['Satchel', 'Sachel', 'Sling'],
    T: ['Toteboy', 'Traveler', 'Trunk'],
    U: ['Utility', 'Uplift', 'Unipack'],
    V: ['Valise', 'Velcro', 'Voyage'],
    W: ['Weekender', 'Waistpack', 'Wallet'],
    X: ['X-Pack', 'XL-Bag', 'Xpress'],
    Y: ['Yoke', 'Yarn-Bag', 'Yeti'],
    Z: ['Zipper', 'Zen-Bag', 'Zone'],
  } as Record<string, string[]>,

  // Last name pun bank
  LAST_NAMES: [
    'Bagley', 'Bagsworth', 'Bagston', 'Bagner', 'Bagcott',
    'Baggers', 'Bagnificent', 'Bagatelle', 'Bagwell', 'Bagman',
    'Duffelson', 'Satchelton', 'Totesworth', 'Carryon', 'Clutchfield',
    'McCarry', 'Dufferson', 'Wearner', 'All-in', 'Packington',
    'Sackville', 'Pouchman', 'Bindle', 'Holdsworthy', 'Zipworth',
    'Strapford', 'Handlebar', 'Buckleby', 'Snapton', 'Clasper',
    'Latchfield', 'Gripsdale', 'Haulington', 'Luggins', 'Portsworth',
    'Briefwell', 'Valiston', 'Rollington', 'Trunksby', 'Rucksdale',
  ],
} as const;

// On-chain data storage strategy
export const ON_CHAIN_STORAGE = {
  // At season start: store IPFS hash of full roster JSON
  // Minimal on-chain: playerId, bagName, position, overallRating, teamId
  ROSTER_STORAGE: 'IPFS_HASH_WITH_MINIMAL_ON_CHAIN',

  // After each game: cumulative season stats on-chain
  // Per-play detail: off-chain with hash reference
  STATS_STORAGE: 'CUMULATIVE_ON_CHAIN_DETAIL_OFF_CHAIN',

  // Game logs: gameId + finalScore + winner + IPFS hash of full log
  GAME_LOG_STORAGE: 'SUMMARY_ON_CHAIN_FULL_OFF_CHAIN',
} as const;

// ============================================
// Draft System
// ============================================
export const DRAFT = {
  // Roster
  ROSTER_SIZE: 30,             // players per team
  TOTAL_PLAYER_POOL: 600,     // ~60 per team, enough for scarcity
  TOTAL_ROUNDS: 30,           // one pick per round per team

  // Salary Cap (Draft Bucks — separate from BLICKIES)
  SALARY_CAP: 500,            // each team gets 500 draft bucks

  // Player cost tiers
  TIERS: {
    ELITE:    { min_rating: 90, max_rating: 99, min_cost: 80, max_cost: 100, pool_size: 30 },
    STAR:     { min_rating: 80, max_rating: 89, min_cost: 40, max_cost: 60,  pool_size: 80 },
    STARTER:  { min_rating: 70, max_rating: 79, min_cost: 15, max_cost: 30,  pool_size: 200 },
    ROTATION: { min_rating: 60, max_rating: 69, min_cost: 5,  max_cost: 10,  pool_size: 200 },
    DEPTH:    { min_rating: 50, max_rating: 59, min_cost: 1,  max_cost: 3,   pool_size: 90 },
  },

  // Position scarcity (max available in draft pool)
  POSITION_CAPS: {
    QB: 20,   // enough for QB1+QB2 per team, still scarce at elite level
    RB: 25,
    WR: 35,
    TE: 20,
    OL: 60,   // 5 starters × 10 teams + depth
    DL: 50,
    LB: 45,
    CB: 30,
    S: 25,
    K: 12,
    P: 12,
    // Remaining slots filled by BVA across positions
  } as Record<string, number>,

  // Draft order
  ORDER: {
    SEASON_1: 'RANDOM',                  // randomized for first season
    SUBSEQUENT: 'INVERSE_STANDINGS',      // worst record picks first
    FORMAT: 'SNAKE',                      // 1→10, 10→1, repeat
  },

  // Timing
  PICK_WINDOW_SECONDS: 180,              // 3 min per pick (rounds 1-15)
  LATE_PICK_WINDOW_SECONDS: 60,          // 1 min per pick (rounds 16-30)
  LATE_ROUND_THRESHOLD: 16,              // when picks speed up
  APPROVE_THRESHOLD: 0.5,                // >50% approval to confirm pick
  OVERRIDE_WINDOW_SECONDS: 60,           // extra time if crowd overrides

  // Pre-draft voting
  PRIORITY_VOTE_DURATION_HOURS: 48,      // how long holders vote on position priorities
  SPENDING_PHILOSOPHIES: [
    'STARS_AND_SCRUBS',   // go big on 1-2 elite, fill with depth
    'BALANCED_BUILD',     // spread cap evenly across starters
    'DEPTH_FIRST',        // lots of solid starters, no superstars
  ] as readonly string[],
} as const;

// ============================================
// Free Agency (Mid-Season Signings)
// ============================================
export const FREE_AGENCY = {
  // Reserve pool: undrafted players available mid-season
  RESERVE_POOL_SIZE: 60,           // ~6 per position group

  // Rating range for free agents (decent backups, not stars)
  MIN_RATING: 50,
  MAX_RATING: 72,

  // Signing costs (in BLICKIES, from team treasury)
  COST_PER_RATING_POINT: 1.5,     // 60 OVR = 90 BLICKIES, 70 OVR = 105 BLICKIES
  MIN_SIGNING_COST: 20,

  // Limits
  MAX_SIGNINGS_PER_SEASON: 5,     // per team
  MAX_ROSTER_SIZE: 35,            // 30 drafted + up to 5 FAs

  // Voting
  SIGNING_VOTE_DURATION_HOURS: 12, // holders vote on proposed signing
  SIGNING_APPROVE_THRESHOLD: 0.5,  // >50% weighted approval

  // When a player is released, they return to FA pool after this delay
  RELEASE_COOLDOWN_HOURS: 24,
} as const;
export type OffensiveScheme = typeof OFFENSIVE_SCHEMES[keyof typeof OFFENSIVE_SCHEMES];
export type DefensiveScheme = typeof DEFENSIVE_SCHEMES[keyof typeof DEFENSIVE_SCHEMES];
export type Position = typeof POSITIONS[keyof typeof POSITIONS];
export type AdminRole = typeof ADMIN.ROLES[keyof typeof ADMIN.ROLES];
