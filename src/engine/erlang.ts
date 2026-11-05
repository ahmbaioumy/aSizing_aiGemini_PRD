/**
 * PRD v7.1 Queueing Math and Analytic Erlang Models
 * Requirements: Section 7.2, Test T21
 * Erlang B, Erlang C, Erlang A approximation, and SLA/ASA formulas.
 */

export interface ErlangResult {
  trafficIntensity: number; // Offered load A = lambda * AHT (Erlangs)
  servers: number; // N
  erlangB: number; // Blocking probability
  erlangC: number; // Probability of waiting P(W > 0)
  serviceLevel: number; // Fraction answered within threshold T
  asa: number; // Average Speed of Answer in seconds
  occupancy: number; // Raw traffic occupancy A / N
  abandonmentRate?: number; // Estimated abandonment (Erlang A)
}

/**
 * Erlang B by stable numerical recurrence (PRD 7.2)
 * B(0) = 1
 * B(n) = (A * B(n-1)) / (n + A * B(n-1))
 */
export function calculateErlangB(trafficA: number, serversN: number): number {
  if (serversN <= 0) return 1.0;
  if (trafficA <= 0) return 0.0;

  let b = 1.0;
  for (let n = 1; n <= serversN; n++) {
    const ab = trafficA * b;
    b = ab / (n + ab);
  }
  return Math.min(1.0, Math.max(0.0, b));
}

/**
 * Erlang C formula (PRD 7.2)
 * C(A, N) = [N * B(A, N)] / [N - A * (1 - B(A, N))] for N > A
 */
export function calculateErlangC(trafficA: number, serversN: number): number {
  if (serversN <= trafficA) {
    return 1.0; // Saturated system: probability of queueing is 1
  }
  if (trafficA <= 0 || serversN <= 0) {
    return 0.0;
  }

  const b = calculateErlangB(trafficA, serversN);
  const denominator = serversN - trafficA * (1.0 - b);

  if (denominator <= 0) return 1.0;

  const c = (serversN * b) / denominator;
  return Math.min(1.0, Math.max(0.0, c));
}

/**
 * Erlang C Full Calculations for SLA and ASA (PRD 7.2)
 * SL = 1 - C * exp(-(N - A) * T / AHT)
 * ASA = (C * AHT) / (N - A)
 */
export function solveErlangC(
  offeredVolume: number,
  intervalSeconds: number,
  ahtSeconds: number,
  serversN: number,
  targetTimeSeconds: number = 20
): ErlangResult {
  const arrivalRate = offeredVolume / intervalSeconds; // lambda
  const trafficA = arrivalRate * ahtSeconds; // Erlangs
  const occupancy = serversN > 0 ? trafficA / serversN : 1.0;

  if (serversN <= trafficA) {
    const b = calculateErlangB(trafficA, serversN);
    return {
      trafficIntensity: trafficA,
      servers: serversN,
      erlangB: b,
      erlangC: 1.0,
      serviceLevel: 0.0,
      asa: ahtSeconds * 2, // Large delayed wait
      occupancy: Math.min(1.0, occupancy),
    };
  }

  const b = calculateErlangB(trafficA, serversN);
  const c = calculateErlangC(trafficA, serversN);

  const delta = (serversN - trafficA) * (targetTimeSeconds / ahtSeconds);
  const sl = Math.max(0.0, Math.min(1.0, 1.0 - c * Math.exp(-delta)));
  const asa = (c * ahtSeconds) / (serversN - trafficA);

  return {
    trafficIntensity: trafficA,
    servers: serversN,
    erlangB: b,
    erlangC: c,
    serviceLevel: sl,
    asa,
    occupancy: Math.min(1.0, occupancy),
  };
}

/**
 * Erlang A approximation with customer patience (abandonment)
 * When callers have finite patience with mean theta (seconds), abandonment rate is approximately C / (1 + theta / ASA_C)
 */
export function solveErlangA(
  offeredVolume: number,
  intervalSeconds: number,
  ahtSeconds: number,
  serversN: number,
  meanPatienceSeconds: number,
  targetTimeSeconds: number = 20
): ErlangResult {
  const base = solveErlangC(offeredVolume, intervalSeconds, ahtSeconds, serversN, targetTimeSeconds);
  if (meanPatienceSeconds <= 0) return base;

  // Erlang A modification: abandonment relieves the queue
  const patienceRate = 1.0 / meanPatienceSeconds;
  const effectiveQueuing = base.erlangC / (1.0 + (patienceRate * base.asa));
  const estimatedAbandonment = Math.min(1.0, effectiveQueuing * Math.exp(-targetTimeSeconds / meanPatienceSeconds));
  const effectiveSL = Math.max(0.0, Math.min(1.0, 1.0 - effectiveQueuing * Math.exp(-(Math.max(1, serversN - base.trafficIntensity) * targetTimeSeconds) / ahtSeconds)));

  return {
    ...base,
    erlangC: effectiveQueuing,
    serviceLevel: effectiveSL,
    abandonmentRate: estimatedAbandonment,
  };
}

/**
 * Finds minimum seats for a single interval meeting target SL and max occupancy
 */
export function findMinSeatsForInterval(
  offeredVolume: number,
  intervalSeconds: number,
  ahtSeconds: number,
  targetSL: number,
  targetSLTimeSeconds: number,
  minSeatsWhileOpen: number = 1,
  occupancyCap: number = 0.85,
  meanPatience?: number
): number {
  if (offeredVolume <= 0) return minSeatsWhileOpen;

  const arrivalRate = offeredVolume / intervalSeconds;
  const trafficA = arrivalRate * ahtSeconds;

  // Lower bound on seats: strictly above traffic load and meeting occupancy cap
  let n = Math.max(minSeatsWhileOpen, Math.ceil(trafficA / occupancyCap));

  // Search upward until target SL is met
  for (let s = n; s <= n + 300; s++) {
    const res = meanPatience && meanPatience > 0
      ? solveErlangA(offeredVolume, intervalSeconds, ahtSeconds, s, meanPatience, targetSLTimeSeconds)
      : solveErlangC(offeredVolume, intervalSeconds, ahtSeconds, s, targetSLTimeSeconds);

    if (res.serviceLevel >= targetSL && res.occupancy <= occupancyCap) {
      return s;
    }
  }

  return n + 10;
}
