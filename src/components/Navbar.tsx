/**
 * Top Bar adhering to Universal Frontend Design 3-Zone Contract
 * Zone 1: Single text element wordmark
 * Zone 2: Clean single-line text navigation links
 * Zone 3: Primary action / fidelity indicator
 */

import React from 'react';
import { Fidelity } from '../types/wfm';
import { ShieldCheck, FileText, CheckCircle2, Sliders } from 'lucide-react';

export type ActiveTab = 'WORKBENCH' | 'ROSTER' | 'SIMULATION' | 'GOVERNANCE' | 'SELF_TEST';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  fidelity: Fidelity;
  onOpenPrd: () => void;
  onOpenConstants: () => void;
  onRunEngine: () => void;
  isRunning: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  fidelity,
  onOpenPrd,
  onOpenConstants,
  onRunEngine,
  isRunning,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Zone 1: Single text element brand wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); setActiveTab('WORKBENCH'); }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-slate-800 transition-colors"
        >
          WFM Minimum-HC Engine
        </a>
        <span className="text-xs font-mono text-slate-400">PRD v7.1</span>
      </div>

      {/* Zone 2: Concise single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('WORKBENCH')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
            activeTab === 'WORKBENCH'
              ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          Planner Flow
        </button>
        <button
          onClick={() => setActiveTab('ROSTER')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
            activeTab === 'ROSTER'
              ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          Roster Timetable
        </button>
        <button
          onClick={() => setActiveTab('SIMULATION')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
            activeTab === 'SIMULATION'
              ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          DES Simulation
        </button>
        <button
          onClick={() => setActiveTab('GOVERNANCE')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
            activeTab === 'GOVERNANCE'
              ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-slate-500" />
          <span>Governance & Gate</span>
        </button>
        <button
          onClick={() => setActiveTab('SELF_TEST')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
            activeTab === 'SELF_TEST'
              ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Self-Test (T1-T66)</span>
        </button>
      </nav>

      {/* Zone 3: Utility actions & Primary Run Engine action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenConstants}
          title="Number Policy & Class K Constants Register"
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
        >
          <Sliders className="w-4 h-4" />
        </button>
        <button
          onClick={onOpenPrd}
          title="Read full PRD v7.1 Specification"
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">PRD Spec</span>
        </button>

        <button
          onClick={onRunEngine}
          disabled={isRunning}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:bg-slate-950 transition-colors whitespace-nowrap shrink-0 shadow-sm disabled:opacity-50"
        >
          {isRunning ? 'Optimizing...' : 'Run Optimization'}
        </button>
      </div>
    </header>
  );
};
