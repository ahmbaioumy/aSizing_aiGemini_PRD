/**
 * PRD v7.1 Keyed Deterministic PRNG and 128-bit Fingerprint Hash
 * Requirements: Z3, 6.3, 13.7, Test T25, T12
 * Zero dependencies, no Math.random, strict (0, 1) float64 uniform.
 */

// 32-bit integer mixing function (Murmur3 style finalizer)
function mix32(h: number): number {
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * Keyed Deterministic Random Generator (PRD 6.3)
 * Takes a structured key (seedBlock, replication, queueIndex, kind, intervalOrDay, rank, attempt)
 * and generates deterministic 53-bit floating point uniforms in (0, 1).
 */
export class KeyedPRNG {
  private state0: number;
  private state1: number;

  constructor(
    seedBlock: number,
    replication: number = 0,
    queueIndex: number = 0,
    kind: number = 0,
    intervalOrDay: number = 0,
    rank: number = 0,
    attempt: number = 0
  ) {
    // Combine 7 key components into two 32-bit seed states
    let h1 = 0x9e3779b9;
    h1 = mix32(h1 ^ seedBlock);
    h1 = mix32(h1 ^ (replication * 0x1b873593));
    h1 = mix32(h1 ^ (queueIndex * 0x85ebca6b));
    h1 = mix32(h1 ^ (kind * 0xc2b2ae35));

    let h2 = 0x85ebca6b;
    h2 = mix32(h2 ^ (intervalOrDay * 0xcc9e2d51));
    h2 = mix32(h2 ^ (rank * 0x1b873593));
    h2 = mix32(h2 ^ (attempt * 0x9e3779b9));

    // Ensure non-zero state
    this.state0 = h1 === 0 ? 0x12345678 : h1;
    this.state1 = h2 === 0 ? 0x87654321 : h2;
  }

  /**
   * Generates next 32-bit unsigned integer using xoroshiro64*
   */
  public nextUint32(): number {
    const s0 = this.state0;
    let s1 = this.state1;
    const result = Math.imul(s0 + s1, 0x9e3779b9) >>> 0;

    s1 ^= s0;
    this.state0 = ((s0 << 26) | (s0 >>> 6)) ^ s1 ^ (s1 << 9);
    this.state1 = (s1 << 13) | (s1 >>> 19);

    return result;
  }

  /**
   * Generates a 53-bit Float64 uniform strictly inside (0, 1) (PRD 6.3, Test T25)
   * Built from two mixed 32-bit words: 21 bits from top + 32 bits from bottom.
   */
  public nextUniform(): number {
    const u1 = this.nextUint32() >>> 11; // 21 bits
    const u2 = this.nextUint32();        // 32 bits
    // (u1 * 2^32 + u2 + 0.5) / 2^53 guarantees (0, 1) strictly
    const uniform = (u1 * 4294967296 + u2 + 0.5) / 9007199254740992;
    return uniform;
  }

  /**
   * Exponential distribution with parameter lambda (mean = 1/lambda)
   */
  public nextExponential(lambda: number): number {
    const u = this.nextUniform();
    return -Math.log(1 - u) / lambda;
  }

  /**
   * Standard Normal distribution using Box-Muller transformation
   */
  public nextStandardNormal(): number {
    const u1 = this.nextUniform();
    const u2 = this.nextUniform();
    const r = Math.sqrt(-2.0 * Math.log(u1));
    const theta = 2.0 * Math.PI * u2;
    return r * Math.cos(theta);
  }

  /**
   * Lognormal distribution with specified mean and CV (Test T21)
   */
  public nextLognormal(mean: number, cv: number): number {
    const sigma2 = Math.log(1 + cv * cv);
    const sigma = Math.sqrt(sigma2);
    const mu = Math.log(mean) - 0.5 * sigma2;
    const z = this.nextStandardNormal();
    return Math.exp(mu + sigma * z);
  }
}

/**
 * 128-bit Non-Cryptographic Fast Deterministic Hash (PRD 13.7)
 * Produces a hex string representation of two 64-bit halves.
 */
export function hash128(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  let h3 = 0x85ebca6b;
  let h4 = 0xc2b2ae35;

  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 0x01000193);
    h2 = Math.imul(h2 ^ (code * 31), 0x85ebca6b);
    h3 = Math.imul(h3 ^ (code * 17), 0xc2b2ae35);
    h4 = Math.imul(h4 ^ (code * 13), 0x9e3779b9);
  }

  h1 = mix32(h1 ^ h3);
  h2 = mix32(h2 ^ h4);

  const hex1 = ('00000000' + (h1 >>> 0).toString(16)).slice(-8);
  const hex2 = ('00000000' + (h2 >>> 0).toString(16)).slice(-8);
  const hex3 = ('00000000' + (mix32(h3) >>> 0).toString(16)).slice(-8);
  const hex4 = ('00000000' + (mix32(h4) >>> 0).toString(16)).slice(-8);

  return `${hex1}${hex2}${hex3}${hex4}`;
}

/**
 * Canonical serialization (PRD 13.7)
 * Serializes objects with sorted keys and normalized numbers to ensure identical hashes.
 */
export function canonicalStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalStringify).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  const pairs = keys.map(k => `${JSON.stringify(k)}:${canonicalStringify(obj[k])}`);
  return '{' + pairs.join(',') + '}';
}
