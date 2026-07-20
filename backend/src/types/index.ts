// ============================================
// Blockchain Ballers - Core Types
// ============================================

import type { OffensiveScheme, DefensiveScheme, Position } from '../config/constants';
import { CONFERENCES } from '../config/constants';

export type Conference = typeof CONFERENCES[keyof typeof CONFERENCES];

// ---- Season & Game State ----

export type SeasonPhase =
  | 'PRESEASON'
  | 'REGISTRATION'
  | 'DRAFT'
  | 'REGULAR_SEASON'
  | 'PLAYOFFS'
  | 'OFFSEASON';

export type GameState =
  | 'SCHEDULED'
  | 'LIVE'
  | 'INTERMISSION'
  | 'FINAL'
  | 'CANCELLED';

export type DriveResult =
  | 'TOUCHDOWN'
  | 'FIELD_GOAL'
  | 'PUNT'
  | 'TURNOVER_INTERCEPTION'
  | 'TURNOVER_FUMBLE'
  | 'TURNOVER_ON_DOWNS'
  | 'SAFETY'
  | 'END_OF_HALF'
  | 'END_OF_GAME';

// ---- Players ----

export interface PlayerRatings {
  overall: number;        // 1-99
  speed: number;
  strength: number;
  agility: number;
  awareness: number;
  stamina: number;
  // Position-specific
  throwing?: number;      // QB
  catching?: number;      // WR, TE
  blocking?: number;      // OL
  tackling?: number;      // DEF
  coverage?: number;      // CB, S
  kickPower?: number;     // K, P
}

export interface Player {
  id: string;
  bagName: string;           // Bag-themed obfuscated name (only name in system)
  position: Position;
  teamId: number;
  age: number;
  enduranceRating: number;   // 1-99, affects fatigue & injury probability
  ratings: PlayerRatings;
  fatigue: number;           // 0-100 (100 = fully rested)
  snapCount: number;         // total snaps this game
  isInjured: boolean;
  injuryGamesRemaining: number;
  isStarter: boolean;
}

// ---- Simulation ----

// A scheme assignment for a specific drive
// The engine reads this to know what schemes to use each drive.
// Built by the orchestrator from crowd votes, or pre-computed for instant sim.
export interface DriveSchemes {
  offenseScheme: OffensiveScheme;
  defenseScheme: DefensiveScheme;
}

// Per-team scheme state: tracks current schemes + change budget
export interface TeamSchemeState {
  currentOffense: OffensiveScheme;
  currentDefense: DefensiveScheme;
  schemeSwitchesUsed: number;   // how many times changed (max 2 per game)
  timeoutsRemaining: number[];  // [firstHalf, secondHalf] e.g. [3, 3]
}

// A scheme schedule maps driveNumber → schemes for each team.
// If a drive number is NOT in the map, the engine uses the previous drive's schemes.
// This is the key abstraction that decouples voting from simulation:
//   - Live game: orchestrator fills this incrementally as votes come in
//   - Instant sim: pre-computed with defaults (BALANCED/ZONE throughout)
//   - Replay verification: rebuilt from stored SchemeChange records
export interface SchemeSchedule {
  home: Map<number, DriveSchemes>;  // driveNumber → schemes (only entries where scheme CHANGES)
  away: Map<number, DriveSchemes>;
}

// Intermission event emitted by the engine at natural break points
export interface IntermissionEvent {
  type: 'MID_QUARTER' | 'END_OF_QUARTER' | 'HALFTIME' | 'TEAM_TIMEOUT';
  quarter: number;
  gameClock: number;
  driveNumber: number;    // the next drive that will be affected by any scheme change
  homeScore: number;
  awayScore: number;
}

// Timeout request (can be triggered by vote or auto-strategy)
export interface TimeoutEvent {
  teamSide: 'home' | 'away';
  quarter: number;
  gameClock: number;
  driveNumber: number;
  timeoutsRemainingAfter: number;
}

export interface SimulationInput {
  gameId: string;
  homeTeamId: number;
  awayTeamId: number;
  homeRoster: Player[];
  awayRoster: Player[];
  // Initial schemes (used for drive 1 if no schedule entry exists)
  homeOffenseScheme: OffensiveScheme;
  homeDefenseScheme: DefensiveScheme;
  awayOffenseScheme: OffensiveScheme;
  awayDefenseScheme: DefensiveScheme;
  // Dynamic per-drive scheme overrides (populated by orchestrator or pre-computed)
  schemeSchedule?: SchemeSchedule;
  homeBoosts: ActiveBoost[];
  awayBoosts: ActiveBoost[];
  randomSeed: string;      // deterministic seed from chain data + gameId
}

export interface PlayEvent {
  id: string;
  gameId: string;
  quarter: number;
  driveNumber: number;
  playNumber: number;
  playType: 'RUN' | 'PASS' | 'KICK' | 'PUNT' | 'KICKOFF' | 'PENALTY';
  description: string;
  yardsGained: number;
  down: number;
  distance: number;
  fieldPosition: number;   // 0-100 (0 = own endzone)
  gameClock: number;       // seconds remaining in quarter
  result: string;
  involvedPlayers: string[];
  offensePlayerId?: string;  // primary ball carrier / QB
  defensePlayerId?: string;  // primary defender on play
  timestamp: number;
  // Scoring
  homeScore: number;
  awayScore: number;
  isScoring: boolean;
  isTurnover: boolean;
  isInjury: boolean;
  injuredPlayerId?: string;
}

export interface DriveOutcome {
  driveNumber: number;
  quarter: number;
  offenseTeamId: number;
  defenseTeamId: number;
  teamId: number;                  // alias for offenseTeamId (orchestrator compat)
  result: DriveResult;
  plays: number;
  yards: number;
  yardsGained: number;             // alias for yards (orchestrator compat)
  timeOfPossession: number;        // seconds
  timeElapsed: number;             // alias for timeOfPossession (orchestrator compat)
  offenseScheme: OffensiveScheme;
  defenseScheme: DefensiveScheme;
  expectedPointsAdded: number;
  epa: number;                     // alias for expectedPointsAdded (orchestrator compat)
  startFieldPosition: number;      // 0-100, field position at drive start
  endFieldPosition: number;        // 0-100, field position at drive end
  homeScoreAfter: number;          // score after this drive completes
  awayScoreAfter: number;
}

// Recorded scheme change (for replay verification and DB persistence)
export interface SchemeChangeRecord {
  driveNumber: number;       // the drive this change takes effect on
  teamSide: 'home' | 'away';
  trigger: 'MID_QUARTER' | 'END_OF_QUARTER' | 'HALFTIME' | 'TEAM_TIMEOUT' | 'INITIAL';
  offenseScheme: OffensiveScheme;
  defenseScheme: DefensiveScheme;
  quarter: number;
  gameClock: number;
}

export interface GameResult {
  gameId: string;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
  plays: PlayEvent[];
  drives: DriveOutcome[];
  playerStats: PlayerGameStats[];
  injuries: InjuryEvent[];
  schemeChanges: SchemeChangeRecord[];     // full log of every scheme state for replay
  intermissions: IntermissionEvent[];       // all intermission events that occurred
  mvpPlayerId: string;
  gameHash: string;        // for on-chain verification
}

export interface PlayerGameStats {
  playerId: string;
  teamId: number;
  snaps: number;           // total snaps played this game
  // Passing
  passAttempts: number;
  passCompletions: number;
  passYards: number;
  passTouchdowns: number;
  passingYards: number;        // alias for passYards (orchestrator compat)
  passingTouchdowns: number;   // alias for passTouchdowns (orchestrator compat)
  interceptions: number;
  // Rushing
  rushAttempts: number;
  rushYards: number;
  rushTouchdowns: number;
  rushingYards: number;        // alias for rushYards (orchestrator compat)
  rushingTouchdowns: number;   // alias for rushTouchdowns (orchestrator compat)
  fumbles: number;
  // Receiving
  targets: number;
  receptions: number;
  receivingYards: number;
  receivingTouchdowns: number;
  // Defense
  tackles: number;
  sacks: number;
  interceptionsDef: number;
  defensiveInterceptions: number;  // alias for interceptionsDef (orchestrator compat)
  forcedFumbles: number;
  // Kicking
  fieldGoalAttempts: number;
  fieldGoalsMade: number;
}

export interface InjuryEvent {
  playerId: string;
  gameId: string;
  type: 'SHORT_TERM' | 'SEASON_ENDING' | 'CAREER_ENDING';
  gamesOut: number;
  description: string;
}

// ---- Voting ----

export interface VoteWindow {
  id: string;
  gameId: string;
  teamId: number;
  type: 'DRAFT_APPROVAL' | 'DRAFT_PICK' | 'SCHEME_OFFENSE' | 'SCHEME_DEFENSE' | 'CALL_TIMEOUT' | 'PRIORITY_PHILOSOPHY';
  options: string[];
  opensAt: Date | number;
  closesAt: Date | number;
  status: 'PENDING' | 'OPEN' | 'CLOSED' | 'RESOLVED' | 'SETTLED';
}

export interface Vote {
  id: string;
  windowId: string;
  walletAddress: string;
  choice: string;
  weight: number;          // sqrt(staked_tokens) * reputation
  timestamp: number;
}

export interface VoteResult {
  windowId: string;
  teamId?: number;         // optional team context (orchestrator compat)
  type?: string;           // vote type passthrough (orchestrator compat)
  winningChoice: string;
  totalVotes: number;
  totalWeight: number;
  breakdown: Record<string, { votes: number; weight: number }>;
  quorumMet: boolean;
}

// ---- Boosts ----

export interface ActiveBoost {
  id: string;
  type: 'INTEL' | 'PERFORMANCE' | 'RECOVERY';
  teamId: number;
  targetPlayerId?: string;
  gameId: string;
  purchasedBy: string;     // wallet address
  costBlickies: number;
}

// ---- Prediction Markets ----

export interface PredictionMarket {
  id: string;
  gameId: string;
  question: string;
  type: 'MICRO' | 'SEASON_FUTURE';
  yesPool: number;         // $BALLERS
  noPool: number;
  opensAt: Date | number;
  closesAt: Date | number;
  status: 'OPEN' | 'CLOSED' | 'SETTLED';
  outcome?: boolean;
}

// ---- Fan System ----

export interface FanProfile {
  walletAddress: string;
  xHandle: string;
  teamId: number;
  seasonId: string;
  score: number;
  interactions: FanInteraction[];
  isEligibleForMint: boolean;
}

export interface FanInteraction {
  tweetId: string;
  type: 'REPLY' | 'REPOST' | 'QUOTE_TWEET';
  gameId: string;
  timestamp: number;
  score: number;
}

// ---- WebSocket Events ----

export interface WSEvent {
  type: string;
  payload: unknown;
  gameId?: string;
  timestamp: number;
}

export type GameWSEvent =
  | { type: 'PLAY'; payload: PlayEvent }
  | { type: 'SCORE_UPDATE'; payload: { homeScore: number; awayScore: number } }
  | { type: 'DRIVE_END'; payload: DriveOutcome }
  | { type: 'INJURY'; payload: InjuryEvent }
  | { type: 'VOTE_OPEN'; payload: VoteWindow }
  | { type: 'VOTE_RESULT'; payload: VoteResult }
  | { type: 'INTERMISSION_START'; payload: IntermissionEvent }
  | { type: 'INTERMISSION_END'; payload: { nextDriveNumber: number } }
  | { type: 'SCHEME_CHANGE'; payload: SchemeChangeRecord }
  | { type: 'TIMEOUT'; payload: TimeoutEvent }
  | { type: 'COMMENTARY'; payload: { persona: string; text: string; audioUrl?: string } }
  | { type: 'GAME_FINAL'; payload: GameResult }
  | { type: 'MARKET_OPEN'; payload: PredictionMarket }
  | { type: 'MARKET_SETTLED'; payload: PredictionMarket };
