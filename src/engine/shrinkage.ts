/**
 * PRD v7.1 Layer 3: Shrinkage and Gross Headcount Engine
 * Requirements: Section 9, Tests T44, Test T3
 * Computes residual shrinkage, Gross HC, component breakdowns, and attribution.
 */

import { ShrinkageBlock, Layer3Result, Fidelity } from '../types/wfm';
import { hash128 } from './prng';

export function solveLayer3(
  rosterHC: number,
  shrinkageConfig: ShrinkageBlock,
  fidelity: Fidelity = 'QUICK'
): Layer3Result {
  // Only include shrinkage components NOT modeled in the roster (PRD 4.9, 9)
  const activeComponents = shrinkageConfig.components.filter(c => !c.isModeledInRoster);

  // Sum active shrinkage rates (e.g., 0.08 + 0.05 + 0.04 + 0.03 = 0.20 = 20%)
  const totalResidualRate = activeComponents.reduce((sum, c) => sum + c.rate, 0);

  // Clamp residual shrinkage to strictly < 1.0 to prevent division by zero or negative
  const safeResidualRate = Math.min(0.85, Math.max(0.0, totalResidualRate));
  const denominator = 1.0 - safeResidualRate;
  const effectiveMultiplier = denominator > 0 ? 1.0 / denominator : 1.0;

  // Gross HC = ceil(Roster HC / (1 - residual shrinkage)) (PRD Section 9)
  const rawGross = rosterHC * effectiveMultiplier;
  const grossHC = Math.ceil(rawGross);

  // Component delta attribution
  const totalAddedHC = grossHC - rosterHC;
  const componentDeltas = activeComponents.map(c => {
    const share = safeResidualRate > 0 ? c.rate / safeResidualRate : 0;
    const addedHC = Math.round(share * totalAddedHC);
    return {
      componentName: c.name,
      rate: c.rate,
      addedHC,
    };
  });

  const fingerprint = hash128(`L3_${rosterHC}_${grossHC}_${safeResidualRate.toFixed(4)}_${fidelity}`);

  return {
    grossHC,
    rosterHC,
    residualShrinkageFactor: safeResidualRate,
    effectiveMultiplier,
    componentDeltas,
    fidelity,
    fingerprint,
  };
}
