/**
 * PRD v7.1 S8: Layer 3 Shrinkage & Gross Headcount Component
 * Requirements: Section 9, Tests T44, Test T56
 */

import React from 'react';
import { Layer1Result, Layer2Result, Layer3Result } from '../types/wfm';
import { Download, CheckCircle2, ShieldCheck, FileSpreadsheet, PieChart, ArrowUpRight } from 'lucide-react';

interface Layer3StageProps {
  layer1Result: Layer1Result | null;
  layer2Result: Layer2Result | null;
  layer3Result: Layer3Result | null;
  onExportJSON: () => void;
  onExportCSV: () => void;
}

export const Layer3Stage: React.FC<Layer3StageProps> = ({
  layer1Result,
  layer2Result,
  layer3Result,
  onExportJSON,
  onExportCSV,
}) => {
  if (!layer3Result || !layer2Result || !layer1Result) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
        Run optimization to view final Layer 3 Gross Headcount results.
      </div>
    );
  }

  const { grossHC, rosterHC, residualShrinkageFactor, effectiveMultiplier, componentDeltas } = layer3Result;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            S8. Layer 3: Final Gross Headcount & Shrinkage Sizing
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Section 9: Roster HC grossed up by residual shrinkage factor with component attribution and export controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onExportJSON}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Container JSON</span>
          </button>
        </div>
      </div>

      {/* The 3-Layer Headline Trilogy (PRD 1.3, 12.1) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Layer 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">Layer 1</span>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Pure Workload</span>
          </div>
          <div className="text-3xl font-bold font-mono text-slate-800 tabular-nums mb-1">
            {layer1Result.fteEquivalent.toFixed(1)} <span className="text-sm font-normal text-slate-500">FTE</span>
          </div>
          <p className="text-xs font-medium text-slate-900 mb-2">Pure Business Requirement</p>
          <p className="text-[11px] text-slate-500 leading-snug">
            {layer1Result.pureSeatHours.toFixed(1)} pure seat-hours over horizon with peak of {layer1Result.peakSeats} concurrent seats.
          </p>
        </div>

        {/* Layer 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">Layer 2</span>
            <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Roster Certified</span>
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums mb-1">
            {rosterHC} <span className="text-sm font-normal text-slate-500">Agents</span>
          </div>
          <p className="text-xs font-medium text-slate-900 mb-2">Roster Headcount</p>
          <p className="text-[11px] text-slate-500 leading-snug">
            Passed all hard shift constraints, rest rules, break windows, and simulated horizon SLAs.
          </p>
        </div>

        {/* Layer 3 */}
        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">Layer 3 (Final)</span>
            <span className="text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
              Gross Sizing
            </span>
          </div>
          <div className="text-4xl font-bold font-mono text-white tabular-nums mb-1">
            {grossHC} <span className="text-base font-normal text-slate-300">Total HC</span>
          </div>
          <p className="text-xs font-semibold text-slate-200 mb-2">Gross Headcount to Recruit</p>
          <p className="text-[11px] text-slate-300 leading-snug">
            Adjusted for {(residualShrinkageFactor * 100).toFixed(1)}% residual shrinkage (multiplier: {effectiveMultiplier.toFixed(3)}x).
          </p>
        </div>
      </div>

      {/* Shrinkage Component Attribution Breakdown (PRD 9) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Residual Shrinkage Attribution Breakdown (PRD Section 9)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact headcount delta added by each unmodeled out-of-adherence and leave component.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-800">
            Total Delta: +{grossHC - rosterHC} Agents
          </span>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="py-2.5 px-4">Shrinkage Component</th>
                <th className="py-2.5 px-4">Configured Rate</th>
                <th className="py-2.5 px-4">Share of Residual</th>
                <th className="py-2.5 px-4">Headcount Added</th>
                <th className="py-2.5 px-4">Operational Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {componentDeltas.map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-medium text-slate-900">{c.componentName}</td>
                  <td className="py-2.5 px-4 font-mono tabular-nums">{(c.rate * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-4 font-mono tabular-nums">
                    {residualShrinkageFactor > 0
                      ? `${((c.rate / residualShrinkageFactor) * 100).toFixed(1)}%`
                      : '0%'}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900 tabular-nums">
                    +{c.addedHC} HC
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">Unmodeled in Roster</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Panel & Traceability Summary (PRD 11.6, 12.4) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-700 space-y-2">
        <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Minimality Evidence & Proof Panel (PRD 11.6)</span>
        </h4>
        <p className="leading-relaxed">
          <strong>Certified Roster HC:</strong> {rosterHC} agents. At {rosterHC - 1} agents, simulated Service Level falls below target (binding constraint: Horizon SL1).
          <br />
          <em>"No roster of {rosterHC - 1} was found that passes. This is not a proof that none exists." (PRD 11.6 required wording)</em>
        </p>
        <div className="pt-2 text-[11px] font-mono text-slate-500 flex flex-wrap gap-4 border-t border-slate-200">
          <span>Rigorous Bound: {layer2Result.rigorousLowerBound}</span>
          <span>Model-Based Bound: {layer2Result.modelBasedBound}</span>
          <span>Optimality Gap: {layer2Result.gapToRigorousBound}</span>
          <span>Engine Hash: {layer3Result.fingerprint.slice(0, 16)}</span>
        </div>
      </div>
    </div>
  );
};
