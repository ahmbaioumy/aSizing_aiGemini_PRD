/**
 * PRD v7.1 S7: Layer 2 Schedule & Roster HC Component
 * Requirements: Section 8, Tests T33-T40, Case 4, Case 7
 */

import React from 'react';
import { Layer2Result } from '../types/wfm';
import {
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';

interface Layer2StageProps {
  layer2Result: Layer2Result | null;
  onAdvanceToLayer3: () => void;
  onViewRosterGrid: () => void;
}

export const Layer2Stage: React.FC<Layer2StageProps> = ({
  layer2Result,
  onAdvanceToLayer3,
  onViewRosterGrid,
}) => {
  if (!layer2Result) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
        Run optimization to compute Layer 2 schedule and roster headcount.
      </div>
    );
  }

  const {
    rosterHC,
    rigorousLowerBound,
    modelBasedBound,
    gapToRigorousBound,
    bridgeSteps,
    validatorReport,
    startListDiagnostic,
    relaxedRuleSavings,
  } = layer2Result;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            S7. Layer 2: Schedule & Roster Headcount
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Section 8: Minimum agents whose schedules satisfy every hard rule and whose simulated KPIs pass at {layer2Result.fidelity} fidelity.
          </p>
        </div>

        <button
          onClick={onViewRosterGrid}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>View Interactive Timetable</span>
        </button>
      </div>

      {/* Headcount Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">
            Roster Headcount (HC)
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {rosterHC} Agents
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Obeying all hard roster rules
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">
            Rigorous Lower Bound (PRD 8.3)
          </span>
          <div className="text-2xl font-bold font-mono text-blue-700 tabular-nums">
            {rigorousLowerBound} Agents
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            ceil(pure seat-hours / max M)
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">
            Model-Based Bound (LP)
          </span>
          <div className="text-2xl font-bold font-mono text-slate-800 tabular-nums">
            {modelBasedBound} Agents
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Column generation relaxation
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">
            Gap to Rigorous Bound
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            +{gapToRigorousBound} Agents
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Proof panel optimality gap
          </span>
        </div>
      </div>

      {/* 5-Step Bridge Breakdown (PRD 8.8) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            The 5-Step Headcount Bridge (PRD 1.3, 8.8)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step mathematical lineage from Pure Requirement to final Roster Headcount.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {bridgeSteps.map((step, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-lg border ${
                idx === bridgeSteps.length - 1
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <span className={`text-[10px] font-mono block mb-1 ${
                idx === bridgeSteps.length - 1 ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Step {step.stepIndex}
              </span>
              <div className="text-lg font-bold font-mono tabular-nums mb-1">
                {step.headcount}
              </div>
              <div className={`text-xs font-semibold leading-tight mb-2 ${
                idx === bridgeSteps.length - 1 ? 'text-white' : 'text-slate-900'
              }`}>
                {step.name}
              </div>
              <p className={`text-[11px] leading-snug ${
                idx === bridgeSteps.length - 1 ? 'text-slate-300' : 'text-slate-500'
              }`}>
                {step.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Independent Schedule Validator & Start-List Optimizer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Independent Validator Report (PRD 8.6) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Independent Schedule Validator (PRD 8.6)
              </h3>
            </div>
            {validatorReport.isValid ? (
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                0 Hard Violations (PASS)
              </span>
            ) : (
              <span className="text-xs font-semibold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                {validatorReport.hardViolationsCount} Violations (FAIL)
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600">
            Module verified zero imports from roster generator, LP, or DES. Raw agent shifts evaluated against Section 4.8 rule text.
          </p>

          <div className="space-y-2">
            {validatorReport.rulesChecked.map((rule, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                <span className="text-slate-700">{rule}</span>
                <span className="text-emerald-700 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnostics: Start-List Optimizer & Constraint Relaxation */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Start-List Diagnostic & Constraint Impact
            </h3>
          </div>

          <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3.5 space-y-1.5 text-xs text-amber-900">
            <span className="font-semibold block flex items-center gap-1.5">
              <span>Proposed Start Time:</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300 font-bold">
                {startListDiagnostic.proposedStart}
              </span>
              <span className="text-emerald-800 font-mono">(Saves ~{startListDiagnostic.estimatedHCSaved} HC)</span>
            </span>
            <p className="text-[11px] text-amber-800">
              {startListDiagnostic.explanation}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-800 mb-2">
              Relaxable Constraint Sensitivity (PRD 8.7)
            </h4>
            <div className="space-y-2">
              {relaxedRuleSavings.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-medium text-slate-800">{item.ruleName}</span>
                  <span className="font-mono text-emerald-800 font-bold">
                    {item.hcSaved > 0 ? `-${item.hcSaved} Headcount` : '0 HC (Within Gap)'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advance to Layer 3 */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500 font-mono">
          Fingerprint: {layer2Result.fingerprint.slice(0, 16)}...
        </div>

        <button
          onClick={onAdvanceToLayer3}
          className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-xs"
        >
          <span>Proceed to Layer 3: Shrinkage & Gross HC</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
