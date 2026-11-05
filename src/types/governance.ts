/**
 * PRD v7.1 Governance Data Types (Part B: Sections 19 - 27)
 */

export type RoleId = 
  | 'PO' | 'ORC' | 'ARC' | 'BA' | 'WFM' | 'DOC' 
  | 'COR' | 'ALG' | 'ROS' | 'DAT' | 'FE'
  | 'ORA' | 'VAL' | 'TST' | 'SEC' 
  | 'AUD_C' | 'AUD_P'
  | 'CHL' | 'CH_M' | 'CH_W' | 'CH_S' | 'CH_D' | 'CH_R' | 'CH_X'
  | 'GATE';

export interface AgentCard {
  roleId: RoleId;
  name: string;
  category: 'HUMAN' | 'GOVERNANCE' | 'ENGINEERING' | 'VERIFICATION' | 'AUDIT' | 'CHALLENGER' | 'GATE';
  mission: string;
  authority: string;
  prohibitions: string[];
  allowedInputs: string[];
  forbiddenInputs: string[];
  outputs: string[];
  skills: string[];
  stopConditions: string[];
  procedureSteps: string[];
  qualityChecklist: string[];
}

export type AttackCode = 
  | 'A01' | 'A02' | 'A03' | 'A04' | 'A05' | 'A06' 
  | 'A07' | 'A08' | 'A09' | 'A10' | 'A11' | 'A12';

export interface AttackDefinition {
  code: AttackCode;
  name: string;
  description: string;
  typicalDomains: string[];
}

export interface SkillDefinition {
  id: string; // e.g. "SK-ARCH"
  name: string;
  domain: string;
  proofExercise: string;
}

export type TaskTier = 'TIER_1_CRITICAL' | 'TIER_2_CORE' | 'TIER_3_MINOR';
export type TaskState = 
  | 'DRAFT' | 'SPECIFIED' | 'DESIGNED' | 'TESTS_WRITTEN' 
  | 'IMPLEMENTED' | 'VERIFIED' | 'REVIEWED' | 'GATED' | 'CLOSED' 
  | 'REJECTED' | 'BLOCKED';

export interface TaskCard {
  id: string; // e.g. "P0-T01"
  phase: number;
  title: string;
  tier: TaskTier;
  refs: string[]; // requirement IDs
  needs: string[]; // prerequisite task IDs
  specOwner: string;
  implementer: string;
  verifiers: string[];
  reviewers: string[];
  challengers: { role: string; codes: AttackCode[] }[];
  signOffsRequired: string[];
  skillsRequired: string[];
  inputs: string[];
  outputs: string[];
  acceptance: string;
  attackFocus: string;
  risks: string;
  currentState: TaskState;
}

export interface GateCriterion {
  id: string; // G1 to G15
  name: string;
  description: string;
  evaluationMethod: 'MECHANICAL_PIPELINE' | 'GATE_AGENT_JUDGMENT';
  status: 'PASS' | 'REJECT' | 'PENDING';
  evidenceDetails?: string;
}

export interface FindingReport {
  id: string;
  taskId: string;
  type: 'DEFECT' | 'SPEC_AMBIGUITY' | 'PROCESS' | 'TEST_GAP';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  requirementId: string;
  counterexampleInput: string;
  expectedResult: string;
  observedResult: string;
  suggestedTest: string;
  status: 'OPEN' | 'VALID' | 'FIXED' | 'DISPOSITIONED';
}

export interface AttackLog {
  taskId: string;
  challengerRole: string;
  attackCode: AttackCode;
  attackDescription: string;
  testInput: string;
  expectedBehavior: string;
  observedBehavior: string;
  survived: boolean;
  notes: string;
}
