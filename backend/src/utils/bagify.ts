// ============================================
// Bagify - Deterministic Player Name System
// ============================================
// Transforms source player data into Bag-themed identities.
// Algorithm: bagName = Bagify(hash(sourceId), initials)
//
// Rules:
// - Only bagName + internal playerId stored on-chain
// - Never store real names anywhere in the system
// - Preserves initial pattern (e.g., "T. Brady" → "T. Bagley")
// - Deterministic: same sourceId always produces same bagName
// - UI can offer optional off-chain "IRL compare" toggle
// ============================================

import { createHash } from 'crypto';
import { BAGIFY } from '../config/constants';

/**
 * Generate a Bag-themed player name from a source identifier.
 *
 * @param sourceId - Internal identifier (e.g., NFL player ID, never a real name)
 * @param firstInitial - First letter of original first name (e.g., 'T')
 * @param lastInitial - First letter of original last name (e.g., 'B')
 * @returns Bagified name like "Toteboy Bagley"
 */
export function bagifyName(
  sourceId: string,
  firstInitial: string,
  lastInitial?: string
): string {
  const hash = createHash('sha256').update(sourceId).digest('hex');

  // Pick first name from initial-keyed bank
  const initial = firstInitial.toUpperCase();
  const firstNameBank = BAGIFY.FIRST_NAMES[initial] ?? BAGIFY.FIRST_NAMES['B'];
  const firstIndex = parseInt(hash.substring(0, 8), 16) % firstNameBank.length;
  const firstName = firstNameBank[firstIndex];

  // Pick last name from global bank
  const lastIndex = parseInt(hash.substring(8, 16), 16) % BAGIFY.LAST_NAMES.length;
  const lastName = BAGIFY.LAST_NAMES[lastIndex];

  return `${firstName} ${lastName}`;
}

/**
 * Hash a source identifier for storage.
 * This is stored in Player.sourceIdHash for re-mapping purposes.
 * The original name/ID is NEVER stored.
 */
export function hashSourceId(sourceId: string): string {
  return createHash('sha256').update(sourceId).digest('hex');
}

/**
 * Generate a batch of unique Bagified names for a roster.
 * Ensures no duplicates within the batch.
 *
 * @param sources - Array of { sourceId, firstInitial, lastInitial? }
 * @returns Array of { sourceIdHash, bagName }
 */
export function bagifyRoster(
  sources: { sourceId: string; firstInitial: string; lastInitial?: string }[]
): { sourceIdHash: string; bagName: string }[] {
  const usedNames = new Set<string>();
  const results: { sourceIdHash: string; bagName: string }[] = [];

  for (const source of sources) {
    let name = bagifyName(source.sourceId, source.firstInitial, source.lastInitial);
    let attempt = 0;

    // Handle collisions by appending suffix
    while (usedNames.has(name)) {
      attempt++;
      const suffixedId = `${source.sourceId}-${attempt}`;
      name = bagifyName(suffixedId, source.firstInitial, source.lastInitial);
    }

    usedNames.add(name);
    results.push({
      sourceIdHash: hashSourceId(source.sourceId),
      bagName: name,
    });
  }

  return results;
}

/**
 * Quick test: generate sample Bagified names.
 * Run with: npx tsx src/utils/bagify.ts
 */
if (require.main === module) {
  const samples = [
    { sourceId: 'player-001', firstInitial: 'T' },
    { sourceId: 'player-002', firstInitial: 'P' },
    { sourceId: 'player-003', firstInitial: 'J' },
    { sourceId: 'player-004', firstInitial: 'A' },
    { sourceId: 'player-005', firstInitial: 'L' },
    { sourceId: 'player-006', firstInitial: 'D' },
    { sourceId: 'player-007', firstInitial: 'M' },
    { sourceId: 'player-008', firstInitial: 'K' },
  ];

  console.log('🎒 Sample Bagified Names:\n');
  for (const s of samples) {
    const name = bagifyName(s.sourceId, s.firstInitial);
    const hash = hashSourceId(s.sourceId);
    console.log(`  ${s.firstInitial}. ??? → ${name}  (hash: ${hash.substring(0, 12)}...)`);
  }
}
