/**
 * PRD v7.1 Locked Flow Stage Stepper
 * Requirements: Section 3.1 - 3.5, Finite State Machine
 */

import React from 'react';
import { StageId, RunMode, Fidelity } from '../types/wfm';
import { Lock, Check, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

interface StageStepperProps {
  currentStage: StageId;
  onSelectStage: (stage: StageId) => void;
  mode: RunMode;
  setMode: (mode: RunMode) => void;
  fidelity: Fidelity;
  setFidelity: (fidelity: Fidelity) => void;
  completedStages: Set<StageId>;
}

export const StageStepper: React.FC<StageStepperProps> = ({
  currentStage,
  onSelectStage,
  mode,
  setMode,
  fidelity,
  setFidelity,
  completedStages,
}) => {
  const modeAStages: { id: StageId; label: string; num: string }[] = [
    { id: 'S1', label: 'Upload FCT', num: 'S1' },
    { id: 'S2', label: 'History & Cleaning', num: 'S2' },
    { id: 'S3', label: 'Forecast Release', num: 'S3' },
    { id: 'S4', label: 'Run Setup', num: 'S4' },
    { id: 'S5', label: 'Analytic Floor', num: 'S5' },
    { id: 'S6', label: 'Layer 1: Pure Req', num: 'S6' },
    { id: 'S7', label: 'Layer 2: Roster HC', num: 'S7' },
    { id: 'S8', label: 'Layer 3: Gross HC', num: 'S8' },
  ];

  const modeBStages: { id: StageId; label: string; num: string }[] = [
    { id: 'S1', label: 'Upload FCT', num: 'S1' },
    { id: 'S2', label: 'History & Cleaning', num: 'S2' },
    { id: 'S3', label: 'Forecast Release', num: 'S3' },
    { id: 'S4', label: 'Run Setup', num: 'S4' },
    { id: 'S5', label: 'Analytic Floor', num: 'S5' },
    { id: 'S6B', label: 'Fixed HC Roster', num: 'S6B' },
    { id: 'S7B', label: 'KPI Achievements', num: 'S7B' },
  ];

  const stages = mode === 'MODE_A' ? modeAStages : modeBStages;

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Controls: Mode & Fidelity */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Mode Switch */}
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <button
              onClick={() => setMode('MODE_A')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === 'MODE_A'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mode A: Find Min HC
            </button>
            <button
              onClick={() => setMode('MODE_B')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === 'MODE_B'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mode B: Fixed HC
            </button>
          </div>

          {/* Fidelity Switch */}
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <span className="text-[11px] font-medium text-slate-400 px-2 uppercase tracking-wider">Fidelity:</span>
            <button
              onClick={() => setFidelity('QUICK')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                fidelity === 'QUICK'
                  ? 'bg-amber-100 text-amber-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Analytic only, zero simulation, 'Estimated' label"
            >
              Quick (Estimated)
            </button>
            <button
              onClick={() => setFidelity('SCREENED')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                fidelity === 'SCREENED'
                  ? 'bg-blue-100 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Sequential simulation stopping allowed, 'non-certified' label"
            >
              Screened
            </button>
            <button
              onClick={() => setFidelity('CERTIFIED')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                fidelity === 'CERTIFIED'
                  ? 'bg-emerald-100 text-emerald-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Full fixed-sequence descending statistical decision procedure with confidence intervals"
            >
              Certified
            </button>
          </div>
        </div>

        {/* Horizontal Flow Stepper */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {stages.map((st, idx) => {
            const isCurrent = currentStage === st.id;
            const isCompleted = completedStages.has(st.id);
            // In locked flow, a stage is accessible if previous is completed or it is S1
            const isAccessible = idx === 0 || completedStages.has(stages[idx - 1].id) || isCompleted;

            return (
              <React.Fragment key={st.id}>
                {idx > 0 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0 mx-0.5" />
                )}
                <button
                  disabled={!isAccessible}
                  onClick={() => onSelectStage(st.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                    isCurrent
                      ? 'bg-white border-2 border-slate-900 text-slate-900 shadow-xs font-semibold'
                      : isCompleted
                      ? 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-100'
                      : isAccessible
                      ? 'bg-transparent text-slate-600 hover:bg-slate-200/50'
                      : 'bg-transparent text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <span className={`text-[10px] font-mono font-semibold ${
                    isCurrent ? 'text-slate-900' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                  }`}>
                    {st.num}
                  </span>
                  <span>{st.label}</span>
                  {isCompleted && (
                    <Check className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
                  )}
                  {!isAccessible && (
                    <Lock className="w-3 h-3 text-slate-300 ml-0.5" />
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
