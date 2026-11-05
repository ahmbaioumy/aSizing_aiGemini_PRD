/**
 * PRD v7.1 S4: Run Setup & 3 Configuration Blocks
 * Requirements: Section 3.4, 4.6 to 4.9, Number Policy (Class P parameters)
 */

import React, { useState } from 'react';
import { BusinessBlock, ScheduleBlock, ShrinkageBlock } from '../types/wfm';
import { Briefcase, Calendar, PieChart, CheckCircle2, ArrowRight } from 'lucide-react';

interface ConfigStageProps {
  businessBlock: BusinessBlock;
  setBusinessBlock: (b: BusinessBlock) => void;
  scheduleBlock: ScheduleBlock;
  setScheduleBlock: (s: ScheduleBlock) => void;
  shrinkageBlock: ShrinkageBlock;
  setShrinkageBlock: (sh: ShrinkageBlock) => void;
  onConfirmConfig: () => void;
}

export const ConfigStage: React.FC<ConfigStageProps> = ({
  businessBlock,
  setBusinessBlock,
  scheduleBlock,
  setScheduleBlock,
  shrinkageBlock,
  setShrinkageBlock,
  onConfirmConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'BUSINESS' | 'SCHEDULE' | 'SHRINKAGE'>('BUSINESS');

  const voiceQueue = businessBlock.queues[0];
  const voicePool = businessBlock.pools[0];

  const updateVoiceQueue = (field: string, val: any) => {
    const updated = { ...voiceQueue, [field]: val };
    setBusinessBlock({
      ...businessBlock,
      queues: [updated, ...businessBlock.queues.slice(1)],
    });
  };

  const updateVoicePool = (field: string, val: any) => {
    const updated = { ...voicePool, [field]: val };
    setBusinessBlock({
      ...businessBlock,
      pools: [updated, ...businessBlock.pools.slice(1)],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            S4. Engine Configuration & Governing Blocks
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Section 3.4: Configure Business, Schedule, and Shrinkage parameters. All values are Class P parameters.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('BUSINESS')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'BUSINESS'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>1. Business Block</span>
          </button>
          <button
            onClick={() => setActiveTab('SCHEDULE')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'SCHEDULE'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>2. Schedule Block</span>
          </button>
          <button
            onClick={() => setActiveTab('SHRINKAGE')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'SHRINKAGE'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>3. Shrinkage Block</span>
          </button>
        </div>
      </div>

      {/* 1. Business Block Tab */}
      {activeTab === 'BUSINESS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Horizon KPI Targets & Queue Physics
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configured targets are evaluated once across the full confirmed horizon as a ratio of sums (PRD 1.2, 4.6).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Service Level (SL) %
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="1.0"
                  value={voiceQueue.targetSL}
                  onChange={(e) => updateVoiceQueue('targetSL', parseFloat(e.target.value))}
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">
                  ({(voiceQueue.targetSL * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Time Threshold (T seconds)
              </label>
              <input
                type="number"
                value={voiceQueue.targetSLTime}
                onChange={(e) => updateVoiceQueue('targetSLTime', parseInt(e.target.value))}
                className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                SL Variant (PRD 7.3)
              </label>
              <select
                value={voiceQueue.targetSLVariant}
                onChange={(e) => updateVoiceQueue('targetSLVariant', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="SL1">SL1 (Answered / Offered)</option>
                <option value="SL2">SL2 (Exclude Short Abandons)</option>
                <option value="SL3">SL3 (Answered / Answered)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Max Occupancy Cap (c)
              </label>
              <input
                type="number"
                step="0.01"
                value={voiceQueue.occupancyCap || 0.85}
                onChange={(e) => updateVoiceQueue('occupancyCap', parseFloat(e.target.value))}
                className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Customer Mean Patience (seconds)
              </label>
              <input
                type="number"
                value={voiceQueue.meanPatience || 180}
                onChange={(e) => updateVoiceQueue('meanPatience', parseInt(e.target.value))}
                className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Service Time CV (std / mean)
              </label>
              <input
                type="number"
                step="0.05"
                value={voiceQueue.cvAHT}
                onChange={(e) => updateVoiceQueue('cvAHT', parseFloat(e.target.value))}
                className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Pool Productivity Factor (1.0 = normal)
              </label>
              <input
                type="number"
                step="0.05"
                value={voicePool.productivityFactor}
                onChange={(e) => updateVoicePool('productivityFactor', parseFloat(e.target.value))}
                className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Minimum Seats While Open (Required, PRD 4.8)
              </label>
              <input
                type="number"
                value={voicePool.minSeatsWhileOpen}
                onChange={(e) => updateVoicePool('minSeatsWhileOpen', parseInt(e.target.value))}
                className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                HC Search Ceiling (Required, PRD 4.8)
              </label>
              <input
                type="number"
                value={voicePool.hcCeiling}
                onChange={(e) => updateVoicePool('hcCeiling', parseInt(e.target.value))}
                className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Schedule Block Tab */}
      {activeTab === 'SCHEDULE' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Roster Rules & Shift Constraints
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Allowed start times, shift lengths, break windows, rest gaps, and cycle parameters (PRD 4.8).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Allowed Shift Starts (Comma separated)
              </label>
              <input
                type="text"
                value={scheduleBlock.allowedShiftStarts.join(', ')}
                onChange={(e) =>
                  setScheduleBlock({
                    ...scheduleBlock,
                    allowedShiftStarts: e.target.value.split(',').map((s) => s.trim()),
                  })
                }
                className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Allowed Shift Lengths (Hours)
              </label>
              <input
                type="text"
                value={scheduleBlock.allowedShiftLengthsHours.join(', ')}
                onChange={(e) =>
                  setScheduleBlock({
                    ...scheduleBlock,
                    allowedShiftLengthsHours: e.target.value.split(',').map(Number),
                  })
                }
                className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Roster Cycle Length (Weeks)
              </label>
              <input
                type="number"
                value={scheduleBlock.rosterCycleWeeks}
                onChange={(e) =>
                  setScheduleBlock({ ...scheduleBlock, rosterCycleWeeks: parseInt(e.target.value) })
                }
                className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Min Rest Hours Between Shifts
              </label>
              <input
                type="number"
                value={scheduleBlock.minRestHoursBetweenShifts}
                onChange={(e) =>
                  setScheduleBlock({
                    ...scheduleBlock,
                    minRestHoursBetweenShifts: parseFloat(e.target.value),
                  })
                }
                className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Max Consecutive Working Days
              </label>
              <input
                type="number"
                value={scheduleBlock.maxConsecutiveWorkDays}
                onChange={(e) =>
                  setScheduleBlock({
                    ...scheduleBlock,
                    maxConsecutiveWorkDays: parseInt(e.target.value),
                  })
                }
                className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Weekly OFF Days per Agent
              </label>
              <input
                type="number"
                value={scheduleBlock.weeklyOffDays}
                onChange={(e) =>
                  setScheduleBlock({ ...scheduleBlock, weeklyOffDays: parseInt(e.target.value) })
                }
                className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-900 mb-2">
              Rule Relaxability Policy (PRD 8.7)
            </h4>
            <div className="flex flex-wrap gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduleBlock.relaxableRules.adjacentOffDays}
                  onChange={(e) =>
                    setScheduleBlock({
                      ...scheduleBlock,
                      relaxableRules: {
                        ...scheduleBlock.relaxableRules,
                        adjacentOffDays: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-slate-900 focus:ring-slate-900"
                />
                <span>Allow Split OFF Days (Relax Adjacent OFF)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduleBlock.relaxableRules.restHours}
                  onChange={(e) =>
                    setScheduleBlock({
                      ...scheduleBlock,
                      relaxableRules: {
                        ...scheduleBlock.relaxableRules,
                        restHours: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-slate-900 focus:ring-slate-900"
                />
                <span>Allow 9h Rest Gap (Relax 11h Rest)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduleBlock.relaxableRules.maxConsecutiveDays}
                  onChange={(e) =>
                    setScheduleBlock({
                      ...scheduleBlock,
                      relaxableRules: {
                        ...scheduleBlock.relaxableRules,
                        maxConsecutiveDays: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-slate-900 focus:ring-slate-900"
                />
                <span>Allow 7 Consecutive Days (Relax Max 6)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 3. Shrinkage Block Tab */}
      {activeTab === 'SHRINKAGE' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Shrinkage Components & Productive Hours
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Components already modeled in the roster or simulation are automatically excluded from Layer 3 to prevent double counting (PRD 4.9, 9).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Contract Hours per Week per FTE
              </label>
              <input
                type="number"
                value={shrinkageBlock.contractHoursPerWeek}
                onChange={(e) =>
                  setShrinkageBlock({
                    ...shrinkageBlock,
                    contractHoursPerWeek: parseFloat(e.target.value),
                  })
                }
                className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Component Name</th>
                  <th className="py-2.5 px-4">Shrinkage Rate %</th>
                  <th className="py-2.5 px-4">Base</th>
                  <th className="py-2.5 px-4">Modeled in Roster?</th>
                  <th className="py-2.5 px-4">Layer 3 Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shrinkageBlock.components.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-medium text-slate-800">{c.name}</td>
                    <td className="py-2.5 px-4 font-mono font-semibold tabular-nums">
                      <input
                        type="number"
                        step="0.01"
                        value={c.rate}
                        onChange={(e) => {
                          const updated = [...shrinkageBlock.components];
                          updated[idx] = { ...c, rate: parseFloat(e.target.value) };
                          setShrinkageBlock({ ...shrinkageBlock, components: updated });
                        }}
                        className="w-20 px-2 py-1 text-xs border border-slate-200 rounded font-mono"
                      />
                      <span className="ml-2 text-slate-400">({(c.rate * 100).toFixed(0)}%)</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{c.base}</td>
                    <td className="py-2.5 px-4">
                      {c.isModeledInRoster ? (
                        <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-mono text-[11px]">
                          Yes (Shift Breaks)
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">No</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      {c.isModeledInRoster ? (
                        <span className="text-slate-400 italic">Excluded (No Double Count)</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">Active in Layer 3</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm S4 Configuration */}
      <div className="flex items-center justify-end pt-4 border-t border-slate-200">
        <button
          onClick={onConfirmConfig}
          className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-xs"
        >
          <span>Confirm Configuration & Save S4</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
