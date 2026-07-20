import { FastifyInstance } from 'fastify';
import * as seasonHandlers from '../handlers/season';
import * as teamHandlers from '../handlers/team';
import * as gameHandlers from '../handlers/game';
import * as voteHandlers from '../handlers/vote';
import * as playerHandlers from '../handlers/player';
import * as adminHandlers from '../handlers/admin';

import * as walletHandlers from '../handlers/wallet';
import * as draftHandlers from '../handlers/draft';
import * as faHandlers from '../handlers/free-agency';
import * as rosterHandlers from '../handlers/roster';
import * as liveHandlers from '../handlers/live';
import * as marketHandlers from '../handlers/market';

// ============================================
// API Routes
// ============================================

export async function registerRoutes(app: FastifyInstance) {
  // Health check
  app.get('/health', async () => ({
    status: 'ok',
    service: 'blockchain-ballers-backend',
    timestamp: new Date().toISOString(),
  }));

  // ---- Season ----
  app.get('/api/seasons', seasonHandlers.listSeasons);
  app.get('/api/seasons/current', seasonHandlers.getCurrentSeason);
  app.post('/api/seasons', seasonHandlers.createSeason);
  app.patch('/api/seasons/:id/phase', seasonHandlers.advancePhase);
  app.post('/api/seasons/:id/generate-schedule', seasonHandlers.generateSeasonSchedule);

  // ---- Teams ----
  app.get('/api/teams', teamHandlers.listTeams);
  app.get('/api/teams/:id', teamHandlers.getTeam);
  app.get('/api/teams/:id/roster', teamHandlers.getTeamRoster);
  app.get('/api/teams/:id/standings', teamHandlers.getTeamStandings);

  // ---- Players ----
  app.get('/api/players', playerHandlers.listPlayers);
  app.get('/api/players/:id', playerHandlers.getPlayer);
  app.get('/api/players/:id/stats', playerHandlers.getPlayerStats);
  app.get('/api/players/:id/cumulative', playerHandlers.getPlayerCumulativeStats);

  // ---- Games ----
  app.get('/api/games', gameHandlers.listGames);
  app.get('/api/games/:id', gameHandlers.getGame);
  app.get('/api/games/:id/plays', gameHandlers.getGamePlays);
  app.get('/api/games/:id/stats', gameHandlers.getGameStats);
  app.post('/api/games/:id/simulate', gameHandlers.simulateGame);
  app.post('/api/games/:id/challenge', gameHandlers.challengeResult);

  // ---- Live Games ----
  app.post('/api/games/:id/live', liveHandlers.startLiveGame);
  app.get('/api/games/:id/live/status', liveHandlers.getLiveGameStatus);
  app.get('/api/games/live', liveHandlers.listLiveGames);

  // ---- Voting ----
  app.get('/api/games/:gameId/votes', voteHandlers.getActiveVoteWindows);
  app.post('/api/games/:gameId/votes/:windowId', voteHandlers.castVote);
  app.get('/api/games/:gameId/votes/:windowId/results', voteHandlers.getVoteResults);

  // ---- Admin Console ----
  app.get('/api/admin/audit-log', adminHandlers.getAuditLog);
  app.post('/api/admin/emergency', adminHandlers.emergencyAction);
  app.get('/api/admin/treasury', adminHandlers.getTreasuryBalance);
  app.get('/api/admin/bans', adminHandlers.getBannedWallets);
  app.post('/api/admin/ban', adminHandlers.banWallet);
  app.delete('/api/admin/ban/:wallet', adminHandlers.unbanWallet);

  // ---- BLICKIES Wallet ----
  app.get('/api/wallet/:address', walletHandlers.getWallet);
  app.post('/api/wallet/register', walletHandlers.registerWallet);
  app.post('/api/wallet/refresh', walletHandlers.refreshWallet);
  app.get('/api/wallet/:address/balance', walletHandlers.getBalance);
  app.get('/api/wallet/:address/transactions', walletHandlers.getTransactions);
  app.post('/api/wallet/purchase', walletHandlers.purchaseBlickies);

  // ---- Season Entry ----
  app.post('/api/seasons/:id/join', walletHandlers.joinSeason);
  app.get('/api/seasons/:id/entries', walletHandlers.getSeasonEntries);

  // ---- Draft System ----
  app.post('/api/draft/:seasonId/initialize', draftHandlers.initializeDraft);
  app.get('/api/draft/:seasonId', draftHandlers.getDraftState);
  app.get('/api/draft/:seasonId/pool', draftHandlers.getPool);
  app.post('/api/draft/:seasonId/start', draftHandlers.startDraft);
  app.post('/api/draft/:seasonId/vote', draftHandlers.votePick);
  app.get('/api/draft/:seasonId/picks', draftHandlers.getDraftBoard);
  app.get('/api/draft/:seasonId/budget/:teamId', draftHandlers.getTeamBudget);
  app.post('/api/draft/:seasonId/priority-vote', draftHandlers.votePriority);

  // ---- Free Agency ----
  app.post('/api/free-agency/:seasonId/generate', faHandlers.generatePool);
  app.get('/api/free-agency/:seasonId/pool', faHandlers.getPool);
  app.post('/api/free-agency/:seasonId/propose', faHandlers.propose);
  app.post('/api/free-agency/:seasonId/vote', faHandlers.vote);
  app.get('/api/free-agency/:seasonId/signings', faHandlers.getSignings);
  app.post('/api/free-agency/:seasonId/release', faHandlers.release);

  // ---- Roster Management ----
  app.post('/api/rosters/:seasonId/finalize', rosterHandlers.finalize);
  app.get('/api/rosters/:seasonId/:teamId', rosterHandlers.getTeamRoster);
  app.get('/api/rosters/:seasonId/overview', rosterHandlers.getRosterOverview);

  // ---- Prediction Markets ----
  app.get('/api/markets', marketHandlers.listMarkets);
  app.get('/api/markets/:id', marketHandlers.getMarket);
  app.post('/api/markets/:id/bet', marketHandlers.takePosition);
  app.get('/api/markets/:id/position', marketHandlers.getMyPosition);
  app.get('/api/markets/positions', marketHandlers.getMyPositions);
  app.post('/api/games/:gameId/markets/generate', marketHandlers.createGameMarkets);
  app.post('/api/markets/custom', marketHandlers.createCustomMarket);
  app.post('/api/markets/:id/settle', marketHandlers.settleMarketManual);
  app.post('/api/games/:gameId/markets/settle', marketHandlers.settleGameMarketsHandler);

  // ---- Boosts (Phase 7) ----
  // app.get('/api/boosts/available', boostHandlers.getAvailable);
  // app.post('/api/boosts/purchase', boostHandlers.purchase);

  // ---- Fan System (Phase 5) ----
  // app.post('/api/fans/register', fanHandlers.register);
  // app.get('/api/fans/leaderboard/:teamId', fanHandlers.getLeaderboard);
  // app.get('/api/fans/:wallet', fanHandlers.getProfile);
}
