/**
 * PRD v7.1 WFM Core Data Types
 * Conforms to Part A Sections 1 - 18
 */

export type RunMode = 'MODE_A' | 'MODE_B'; // Mode A = Find Min HC, Mode B = Fixed HC
export type Fidelity = 'QUICK' | 'SCREENED' | 'CERTIFIED';
export type StageId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S6B' | 'S7B';
export type StageState = 'LOCKED' | 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'STALE' | 'BLOCKED';

export type QueueClass = 'REAL_TIME' | 'DEFERRABLE';
export type QueueType = 'VOICE' | 'CHAT' | 'EMAIL' | 'BACK_OFFICE';
export type SLVariant = 'SL1' | 'SL2' | 'SL3'; // SL1: Ans/Off, SL2: without short abandons, SL3: Ans/Ans

export interface QueueConfig {
  id: string;
  name: string;
  poolId: string;
  queueClass: QueueClass;
  queueType: QueueType;
  targetSL: number; // e.g. 0.80 (80%)
  targetSLTime: number; // e.g. 20 (seconds)
  targetSLVariant: SLVariant;
  targetASA: number; // seconds
  targetAnswerRate: number; // e.g. 0.95
  abandonmentCap: number; // e.g. 0.05
  occupancyCap?: number; // e.g. 0.85
  targetDeadlineHours?: number; // for deferrable
  targetDeadlinePercent?: number; // for deferrable, e.g. 0.95
  meanAHT: number; // seconds
  cvAHT: number; // coefficient of variation (std / mean)
  meanPatience?: number; // seconds (mean of exponential/distribution)
}

export interface PoolConfig {
  id: string;
  name: string;
  queueClass: QueueClass;
  productivityFactor: number; // 1.0 = baseline, 0.9 = 10% faster handle time
  minSeatsWhileOpen: number; // required per pool
  hcCeiling: number; // required search ceiling
  chatConcurrencyMax?: number; // e.g. 3
}

export interface BusinessBlock {
  pools: PoolConfig[];
  queues: QueueConfig[];
  operatingHours: {
    startHour: number; // e.g. 8
    endHour: number; // e.g. 20
    daysOfWeek: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  };
  timeQuantum: number; // seconds, default 1
  warmUpMinutes: number; // default 30
  drainWindowHours: number; // for deferrable
  shortAbandonThreshold: number; // e.g. 5 seconds
}

export interface BreakRule {
  id: string;
  name: string;
  durationMinutes: number;
  earliestHourAfterStart: number;
  latestHourAfterStart: number;
  isPaid: boolean;
  countsTowardContract: boolean;
}

export interface ScheduleBlock {
  allowedShiftStarts: string[]; // e.g. ["07:00", "08:00", "09:00", "12:00"]
  allowedShiftLengthsHours: number[]; // e.g. [8, 8.5]
  breaks: BreakRule[];
  rosterCycleWeeks: number; // e.g. 2 weeks
  minRestHoursBetweenShifts: number; // e.g. 11 hours
  maxConsecutiveWorkDays: number; // e.g. 6 days
  weeklyOffDays: number; // e.g. 2 days
  enforceAdjacentOffDays: boolean; // default true
  minWeeklyHours: number; // e.g. 32
  maxWeeklyHours: number; // e.g. 40
  // Mode B specific:
  givenHC?: number;
  uploadedRosterId?: string;
  // Relaxable rules map
  relaxableRules: {
    adjacentOffDays: boolean;
    restHours: boolean;
    maxConsecutiveDays: boolean;
  };
}

export interface ShrinkageComponent {
  id: string;
  name: string;
  rate: number; // e.g. 0.08 for 8%
  base: 'TOTAL' | 'NET';
  isModeledInRoster: boolean; // if true, excluded from Layer 3 to prevent double counting
}

export interface ShrinkageBlock {
  contractHoursPerWeek: number; // e.g. 40
  paidBreakMinutesPerDay: number; // e.g. 30
  components: ShrinkageComponent[];
}

export interface RunControls {
  fidelity: Fidelity;
  replicationsQuick: number;
  replicationsScreened: number;
  replicationsCertified: number;
  confidenceLevel: number; // e.g. 0.95
  precisionTarget: number; // half-width delta e.g. 0.02
  seedBlock: number;
  maxDescentIterations: number;
  desCalibrationIterations: number;
}

export interface IntervalFCT {
  date: string; // YYYY-MM-DD
  intervalStart: string; // HH:MM
  intervalMinutes: number; // 15, 30, or 60
  queueId: string;
  volume: number; // offered
  aht: number; // seconds
}

export interface CleaningLogEntry {
  originalRowNumber: number;
  date: string;
  intervalStart: string;
  queueId: string;
  reason: 'NEGATIVE_VOLUME' | 'NEGATIVE_AHT' | 'ZERO_AHT_POSITIVE_VOL' | 'EXACT_DUPLICATE' | 'CONFLICTING_DUPLICATE';
  actionTaken: 'REMOVED' | 'RESOLVED_FIRST' | 'RESOLVED_LAST' | 'EXCLUDED';
  originalValues: Record<string, any>;
}

export interface CleaningReport {
  totalRows: number;
  acceptedRows: number;
  rejectedRows: number;
  negativeRows: number;
  zeroAhtRows: number;
  exactDuplicates: number;
  conflictingDuplicates: number;
  gapsDetected: number;
  volumeRemoved: number;
  volumeRemovedPercent: number;
  dataHash: string;
  cleanedHash: string;
  logs: CleaningLogEntry[];
}

export interface Layer1Result {
  pureSeatHours: number;
  peakSeats: number;
  fteEquivalent: number; // contract hours basis
  phiMin: number;
  necessarySeatHoursBound: number;
  concavityCorrectionsCount: number;
  intervalSeats: { intervalKey: string; seats: number; offeredWorkload: number }[];
  analyticExpectedSL: number;
  fidelity: Fidelity;
  fingerprint: string;
}

export interface AgentShift {
  agentId: string;
  dayIndex: number; // 0 to cycleLengthDays - 1
  date: string;
  startHour: number; // 0.0 to 24.0
  lengthHours: number;
  isOff: boolean;
  breaks: { startHour: number; durationMinutes: number }[];
}

export interface ValidatorViolation {
  ruleName: string;
  agentId: string;
  dayOrDate: string;
  severity: 'HARD' | 'RELAXABLE' | 'WARNING';
  description: string;
}

export interface ValidatorReport {
  isValid: boolean;
  hardViolationsCount: number;
  relaxableViolationsCount: number;
  violations: ValidatorViolation[];
  rulesChecked: string[];
}

export interface BridgeStep {
  stepIndex: number;
  name: string;
  headcount: number;
  delta: number;
  reason: string;
  isModelBased: boolean;
}

export interface Layer2Result {
  rosterHC: number;
  rigorousLowerBound: number;
  modelBasedBound: number;
  gapToRigorousBound: number;
  bridgeSteps: BridgeStep[];
  agentSchedules: AgentShift[];
  validatorReport: ValidatorReport;
  coverageVsRequirement: {
    intervalKey: string;
    requiredSeats: number;
    scheduledSeats: number;
    netCoverage: number;
  }[];
  startListDiagnostic: {
    proposedStart: string;
    estimatedHCSaved: number;
    explanation: string;
  };
  relaxedRuleSavings: {
    ruleName: string;
    hcSaved: number;
    notes: string;
  }[];
  fidelity: Fidelity;
  fingerprint: string;
}

export interface Layer3Result {
  grossHC: number;
  rosterHC: number;
  residualShrinkageFactor: number; // e.g. 0.22 (22%)
  effectiveMultiplier: number; // 1 / (1 - residualShrinkage)
  componentDeltas: { componentName: string; rate: number; addedHC: number }[];
  fidelity: Fidelity;
  fingerprint: string;
}

export interface ModeBResult {
  givenHC: number;
  achievedSL: number;
  achievedASA: number;
  achievedAnswerRate: number;
  achievedAbandonment: number;
  achievedOccupancy: number;
  targetPassed: boolean;
  bindingKPI: string;
  shortfallKPIs: string[];
  validatorReport: ValidatorReport;
  gapToMinHC?: number;
  fidelity: Fidelity;
}
