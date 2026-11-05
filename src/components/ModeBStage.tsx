/**
 * PRD v7.1 Mode B: Fixed Headcount Evaluation Component
 * Requirements: Section 10, Tests T41-T44, Case 5
 */

import React, { useState } from 'react';
import { ModeBResult, Layer2Result, QueueConfig } from '../types/wfm';
import { CheckCircle2, XCircle, ArrowRight, ShieldCheck, Gauge } from 'lucide-react';

interface ModeBStageProps {
  queueConfig: QueueConfig;
  modeBResult: ModeBResult | null;
  onRunModeB: (hc: number) => void;
  matchingModeAHC?: number;
}

export const ModeBStage: React.FC<ModeBStageProps> = ({
  queueConfig,
  modeBResult,
  onRunModeB,
  matchingModeAHC,
}) => {
  const [inputHC, setInputHC] = useState<number>(14);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Mode B: Fixed Headcount & Roster Evaluation
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Section 10: Evaluate a specific fixed headcount or uploaded roster against horizon targets and report achieved KPIs and shortfalls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="number"
            min="1"
            max="200"
            value={inputHC}
            onChange={(e) => setInputHC(parseInt(e.target.value) || 1)}
            className="w-24 px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          <button
            onClick={() => onRunModeB(inputHC)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs"
          >
            Evaluate Fixed HC ({inputHC})
          </button>
        </div>
      </div>

      {modeBResult && (
        <div className="space-y-6">
          {/* Headline Status */}
          <div className={`p-5 rounded-xl border flex items-center justify-between ${
            modeBResult.targetPassed
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-red-50/70 border-red-200 text-red-950'
          }`}>
            <div className="flex items-center gap-3">
              {modeBResult.targetPassed ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 shrink-0" />
              )}
              <div>
                <h3 className="text-base font-bold">
                  {modeBResult.targetPassed
                    ? `Fixed Headcount (${modeBResult.givenHC}) PASSED All Target Constraints`
                    : `Fixed Headcount (${modeBResult.givenHC}) FAILED: Binding KPI is ${modeBResult.bindingKPI}`}
                </h3>
                <p className="text-xs opacity-80 mt-0.5">
                  Fidelity: {modeBResult.fidelity} &middot; Evaluated over full confirmed horizon
                </p>
              </div>
            </div>

            {matchingModeAHC && (
              <div className="text-right">
                <span className="text-xs font-mono block opacity-75">Optimal Min HC:</span>
                <span className="text-lg font-bold font-mono">{matchingModeAHC} Agents</span>
              </div>
            )}
          </div>

          {/* Achieved KPIs Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Achieved Horizon KPIs vs. Configured Targets (PRD 10.4)
            </h3>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="py-2.5 px-4">Metric</th>
                    <th className="py-2.5 px-4">Achieved Value</th>
                    <th className="py-2.5 px-4">Target Threshold</th>
                    <th className="py-2.5 px-4">Margin</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-medium text-slate-900">Service Level (SL1)</td>
                    <td className="py-2.5 px-4 font-mono font-bold tabular-nums">
                      {(modeBResult.achievedSL * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500 tabular-nums">
                      {(queueConfig.targetSL * 100).toFixed(0)}% within {queueConfig.targetSLTime}s
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums">
                      {((modeBResult.achievedSL - queueConfig.targetSL) * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4">
                      {modeBResult.achievedSL >= queueConfig.targetSL ? (
                        <span className="text-emerald-700 font-semibold">PASS</span>
                      ) : (
                        <span className="text-red-700 font-semibold">FAIL</span>
                      )}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-medium text-slate-900">Average Speed of Answer (ASA)</td>
                    <td className="py-2.5 px-4 font-mono font-bold tabular-nums">
                      {modeBResult.achievedASA.toFixed(1)}s
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500 tabular-nums">
                      &le; {queueConfig.targetASA}s
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums">
                      {(queueConfig.targetASA - modeBResult.achievedASA).toFixed(1)}s
                    </td>
                    <td className="py-2.5 px-4">
                      {modeBResult.achievedASA <= queueConfig.targetASA ? (
                        <span className="text-emerald-700 font-semibold">PASS</span>
                      ) : (
                        <span className="text-red-700 font-semibold">FAIL</span>
                      )}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-medium text-slate-900">Abandonment Rate</td>
                    <td className="py-2.5 px-4 font-mono font-bold tabular-nums">
                      {(modeBResult.achievedAbandonment * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500 tabular-nums">
                      &le; {(queueConfig.abandonmentCap * 100).toFixed(0)}%
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums">
                      {((queueConfig.abandonmentCap - modeBResult.achievedAbandonment) * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4">
                      {modeBResult.achievedAbandonment <= queueConfig.abandonmentCap ? (
                        <span className="text-emerald-700 font-semibold">PASS</span>
                      ) : (
                        <span className="text-red-700 font-semibold">FAIL</span>
                      )}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-medium text-slate-900">Agent Occupancy</td>
                    <td className="py-2.5 px-4 font-mono font-bold tabular-nums">
                      {(modeBResult.achievedOccupancy * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500 tabular-nums">
                      &le; {((queueConfig.occupancyCap || 0.85) * 100).toFixed(0)}%
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums">
                      {(((queueConfig.occupancyCap || 0.85) - modeBResult.achievedOccupancy) * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4">
                      {modeBResult.achievedOccupancy <= (queueConfig.occupancyCap || 0.85) ? (
                        <span className="text-emerald-700 font-semibold">PASS</span>
                      ) : (
                        <span className="text-red-700 font-semibold">FAIL</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
