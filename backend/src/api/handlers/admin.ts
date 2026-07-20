import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../db/client';
import { ADMIN } from '../../config/constants';

// Helper: verify admin role
async function verifyAdmin(wallet: string, requiredRole?: string) {
  const admin = await prisma.adminRole.findUnique({ where: { walletAddress: wallet } });
  if (!admin || !admin.isActive) return null;
  if (requiredRole && admin.role !== requiredRole && admin.role !== 'SUPER_ADMIN') return null;
  return admin;
}

// Helper: log action
async function logAction(action: string, actor: string, role: string, target?: { type: string; id: string }, reason?: string, meta?: unknown) {
  return prisma.adminAuditLog.create({
    data: { action, actorWallet: actor, actorRole: role, targetType: target?.type, targetId: target?.id, reason, metadata: meta as any },
  });
}

export async function getAuditLog(
  req: FastifyRequest<{ Querystring: { limit?: string; action?: string } }>,
  reply: FastifyReply
) {
  const limit = Math.min(parseInt(req.query.limit ?? '50', 10), 200);
  const logs = await prisma.adminAuditLog.findMany({
    where: req.query.action ? { action: req.query.action } : {},
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return reply.send({ logs });
}

export async function emergencyAction(
  req: FastifyRequest<{
    Body: { action: string; actorWallet: string; targetType?: string; targetId?: string; reason: string };
  }>,
  reply: FastifyReply
) {
  const { action, actorWallet, targetType, targetId, reason } = req.body;

  if (!ADMIN.EMERGENCY_ACTIONS.includes(action)) {
    return reply.status(400).send({ error: `Unknown action. Valid: ${ADMIN.EMERGENCY_ACTIONS.join(', ')}` });
  }

  const superOnly = ['OVERRIDE_GAME_RESULT', 'VOID_GAME', 'FORCE_SETTLE_MARKET'];
  const role = superOnly.includes(action) ? 'SUPER_ADMIN' : undefined;
  const admin = await verifyAdmin(actorWallet, role);
  if (!admin) return reply.status(403).send({ error: 'Not authorized' });

  // Execute
  let result: unknown = {};
  switch (action) {
    case 'PAUSE_ALL_GAMES': {
      const r = await prisma.game.updateMany({ where: { state: 'LIVE' }, data: { state: 'CANCELLED' } });
      result = { gamesPaused: r.count };
      break;
    }
    case 'VOID_GAME': {
      if (!targetId) return reply.status(400).send({ error: 'targetId required' });
      await prisma.game.update({ where: { id: targetId }, data: { state: 'VOIDED', settlementState: 'OVERRIDDEN' } });
      result = { voided: targetId };
      break;
    }
    case 'BAN_WALLET': {
      if (!targetId) return reply.status(400).send({ error: 'targetId (wallet address) required' });
      await prisma.walletBan.upsert({
        where: { walletAddress: targetId },
        create: { walletAddress: targetId, reason, bannedBy: actorWallet },
        update: { isActive: true, reason, bannedBy: actorWallet, liftedAt: null },
      });
      result = { banned: targetId };
      break;
    }
    default:
      result = { action, note: 'Action logged but handler not yet implemented' };
  }

  await logAction(action, actorWallet, admin.role, targetType && targetId ? { type: targetType, id: targetId } : undefined, reason, result);

  return reply.send({ success: true, action, result });
}

export async function getTreasuryBalance(req: FastifyRequest, reply: FastifyReply) {
  const revenue = await prisma.treasuryLedger.findMany({ where: { type: 'REVENUE' } });
  const payouts = await prisma.treasuryLedger.findMany({ where: { type: { not: 'REVENUE' } } });

  const totalIn = revenue.reduce((sum, r) => sum + BigInt(r.amount), BigInt(0));
  const totalOut = payouts.reduce((sum, p) => sum + BigInt(p.amount), BigInt(0));

  return reply.send({
    totalRevenue: totalIn.toString(),
    totalPayouts: totalOut.toString(),
    balance: (totalIn - totalOut).toString(),
    recentEntries: await prisma.treasuryLedger.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
  });
}

export async function getBannedWallets(req: FastifyRequest, reply: FastifyReply) {
  const bans = await prisma.walletBan.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
  return reply.send({ bans });
}

export async function banWallet(
  req: FastifyRequest<{ Body: { walletAddress: string; reason: string; actorWallet: string } }>,
  reply: FastifyReply
) {
  const { walletAddress, reason, actorWallet } = req.body;
  const admin = await verifyAdmin(actorWallet);
  if (!admin) return reply.status(403).send({ error: 'Not authorized' });

  const ban = await prisma.walletBan.upsert({
    where: { walletAddress },
    create: { walletAddress, reason, bannedBy: actorWallet },
    update: { isActive: true, reason, bannedBy: actorWallet, liftedAt: null },
  });

  await logAction('BAN_WALLET', actorWallet, admin.role, { type: 'wallet', id: walletAddress }, reason);
  return reply.status(201).send({ ban });
}

export async function unbanWallet(
  req: FastifyRequest<{ Params: { wallet: string }; Body: { actorWallet: string } }>,
  reply: FastifyReply
) {
  const { wallet } = req.params;
  const actorWallet = req.body?.actorWallet ?? '';
  const admin = await verifyAdmin(actorWallet);
  if (!admin) return reply.status(403).send({ error: 'Not authorized' });

  await prisma.walletBan.update({
    where: { walletAddress: wallet },
    data: { isActive: false, liftedAt: new Date() },
  });

  await logAction('UNBAN_WALLET', actorWallet, admin.role, { type: 'wallet', id: wallet }, 'Ban lifted');
  return reply.send({ unbanned: wallet });
}
