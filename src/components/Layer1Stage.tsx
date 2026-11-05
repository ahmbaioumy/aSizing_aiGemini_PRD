/**
 * PRD v7.1 S6: Layer 1 Pure Requirement Component
 * Requirements: Section 7, Tests T29-T32, Case 2
 */

import React from 'react';
import { Layer1Result } from '../types/wfm';
import { Layers, ArrowRight, TrendingUp, Info } from 'lucide-react';

interface Layer1StageProps {
  layer1Result: Layer1Result | null;
  onAdvanceToLayer2: () => void;
}

export const Layer1Stage: React.FC<Layer1StageProps> = ({
  layer1Result,
  onAdvanceToLayer2,
}) => {
  if (!layer1Result) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
        Run optimization to compute Layer 1 pure requirements.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            S6. Layer 1: Pure Requirement
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Section 7: Pure seat-hours and FTE-equivalent required to meet horizon KPIs when seats can be placed freely by interval with zero schedule rules or shrinkage.
          </p>
        </div>

        <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-md">
          Fidelity: {layer1Result.fidelity}
        </span>
      </div>

      {/* KPI Headline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">
            Pure Seat-Hours
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {layer1Result.pureSeatHours.toFixed(1)}h
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Over full horizon
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">
            Pure FTE-Equivalent
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {layer1Result.fteEquivalent.toFixed(1)} FTE
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Contract-hours basis (40h/wk)
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">
            Peak Interval Seats
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {layer1Result.peakSeats} Seats
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Maximum concurrency required
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">
            Necessary Bound (&phi;<sub>min</sub> &middot; W)
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            {layer1Result.necessarySeatHoursBound.toFixed(1)}h
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            &phi;<sub>min</sub> = {(layer1Result.phiMin * 100).toFixed(0)}% bound
          </span>
        </div>
      </div>

      {/* Interval Seat Breakdown Table & Mini Heatmap */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Interval Workload & Pure Seat Allocation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Seats assigned greedily along marginal gain path P(k) subject to minimum seats while open.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {layer1Result.intervalSeats.length} Active Intervals
          </span>
        </div>

        {/* Bar chart visualization */}
        <div className="h-44 flex items-end gap-1.5 pt-4 pb-2 px-2 border-b border-slate-100 overflow-x-auto">
          {layer1Result.intervalSeats.map((item, idx) => {
            const heightPercent = Math.min(100, Math.round((item.seats / Math.max(1, layer1Result.peakSeats)) * 100));
            return (
              <div key={idx} className="flex-1 min-w-[22px] flex flex-col items-center gap-1 group relative">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full bg-slate-800 rounded-t-sm group-hover:bg-blue-600 transition-colors"
                />
                <span className="text-[9px] font-mono text-slate-400 rotate-90 origin-left mt-2 whitespace-nowrap">
                  {item.intervalKey.split('_')[1]}
                </span>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-[11px] font-mono rounded px-2 py-1 whitespace-nowrap z-20 shadow-md">
                  {item.intervalKey}: {item.seats} seats ({item.offeredWorkload.toFixed(2)}h load)
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Interval Start</th>
                <th className="py-2 px-3">Offered Workload</th>
                <th className="py-2 px-3">Allocated Pure Seats</th>
                <th className="py-2 px-3">Seat-Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {layer1Result.intervalSeats.slice(0, 10).map((row, idx) => {
                const [d, t] = row.intervalKey.split('_');
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono">{d}</td>
                    <td className="py-2 px-3 font-mono font-semibold">{t}</td>
                    <td className="py-2 px-3 font-mono tabular-nums">{row.offeredWorkload.toFixed(2)}h</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900 tabular-nums">{row.seats}</td>
                    <td className="py-2 px-3 font-mono tabular-nums">{(row.seats * 0.5).toFixed(1)}h</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advance Action */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500 font-mono">
          Fingerprint: {layer1Result.fingerprint.slice(0, 16)}...
        </div>

        <button
          onClick={onAdvanceToLayer2}
          className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-xs"
        >
          <span>Proceed to Layer 2: Schedule & Roster HC</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
