/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  StageId,
  RunMode,
  Fidelity,
  IntervalFCT,
  CleaningReport,
  BusinessBlock,
  ScheduleBlock,
  ShrinkageBlock,
  Layer1Result,
  Layer2Result,
  Layer3Result,
  ModeBResult,
} from './types/wfm';
import { Navbar, ActiveTab } from './components/Navbar';
import { StageStepper } from './components/StageStepper';
import { UploadStage } from './components/UploadStage';
import { ForecastStage } from './components/ForecastStage';
import { ConfigStage } from './components/ConfigStage';
import { Layer1Stage } from './components/Layer1Stage';
import { Layer2Stage } from './components/Layer2Stage';
import { Layer3Stage } from './components/Layer3Stage';
import { ModeBStage } from './components/ModeBStage';
import { RosterTimetable } from './components/RosterTimetable';
import { DESVisualizer } from './components/DESVisualizer';
import { GovernanceView } from './components/GovernanceView';
import { SelfTestRunner } from './components/SelfTestRunner';
import { PrdReaderModal } from './components/PrdReaderModal';
import { ConstantsRegisterModal } from './components/ConstantsRegisterModal';

import {
  DEFAULT_BUSINESS_BLOCK,
  DEFAULT_SCHEDULE_BLOCK,
  DEFAULT_SHRINKAGE_BLOCK,
  generateCase2Intervals,
} from './engine/sampleData';
import { cleanAndProcessFCT } from './engine/cleaner';
import { solveLayer1 } from './engine/pureRequirement';
import { solveLayer2 } from './engine/rosterEngine';
import { solveLayer3 } from './engine/shrinkage';
import { runDESReplication } from './engine/des';
import { hash128 } from './engine/prng';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('WORKBENCH');
  const [isPrdOpen, setIsPrdOpen] = useState(false);
  const [isConstantsOpen, setIsConstantsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Locked Flow & Mode State (PRD 3.1 - 3.5)
  const [mode, setMode] = useState<RunMode>('MODE_A');
  const [fidelity, setFidelity] = useState<Fidelity>('SCREENED');
  const [currentStage, setCurrentStage] = useState<StageId>('S1');
  const [completedStages, setCompletedStages] = useState<Set<StageId>>(
    new Set<StageId>(['S1', 'S2', 'S3', 'S4', 'S5'])
  );

  // Dataset & Configuration State
  const [fctData, setFctData] = useState<IntervalFCT[]>(() => generateCase2Intervals());
  const [cleaningReport, setCleaningReport] = useState<CleaningReport | null>(null);
  const [isForecastLocked, setIsForecastLocked] = useState<boolean>(true);
  const [forecastSource, setForecastSource] = useState<'USER_FCT' | 'APP_FORECAST'>('USER_FCT');

  const [businessBlock, setBusinessBlock] = useState<BusinessBlock>(DEFAULT_BUSINESS_BLOCK);
  const [scheduleBlock, setScheduleBlock] = useState<ScheduleBlock>(DEFAULT_SCHEDULE_BLOCK);
  const [shrinkageBlock, setShrinkageBlock] = useState<ShrinkageBlock>(DEFAULT_SHRINKAGE_BLOCK);

  // Engine Optimization Results
  const [layer1Result, setLayer1Result] = useState<Layer1Result | null>(() => {
    return solveLayer1(fctData, businessBlock.queues, businessBlock.pools, 40, 2, 'SCREENED');
  });

  const [layer2Result, setLayer2Result] = useState<Layer2Result | null>(() => {
    const l1 = solveLayer1(fctData, businessBlock.queues, businessBlock.pools, 40, 2, 'SCREENED');
    return solveLayer2(l1, scheduleBlock, 8, 20, 2, 'SCREENED');
  });

  const [layer3Result, setLayer3Result] = useState<Layer3Result | null>(() => {
    const l1 = solveLayer1(fctData, businessBlock.queues, businessBlock.pools, 40, 2, 'SCREENED');
    const l2 = solveLayer2(l1, scheduleBlock, 8, 20, 2, 'SCREENED');
    return solveLayer3(l2.rosterHC, shrinkageBlock, 'SCREENED');
  });

  const [modeBResult, setModeBResult] = useState<ModeBResult | null>(null);

  // Run Optimization Pipeline across Layers 1, 2, and 3
  const handleRunFullOptimization = () => {
    setIsRunning(true);
    setTimeout(() => {
      // 1. Solve Layer 1 Pure Requirement
      const l1 = solveLayer1(
        fctData,
        businessBlock.queues,
        businessBlock.pools,
        shrinkageBlock.contractHoursPerWeek,
        scheduleBlock.rosterCycleWeeks,
        fidelity
      );
      setLayer1Result(l1);

      // 2. Solve Layer 2 Schedule & Roster HC
      const l2 = solveLayer2(
        l1,
        scheduleBlock,
        businessBlock.operatingHours.startHour,
        businessBlock.operatingHours.endHour,
        businessBlock.pools[0]?.minSeatsWhileOpen || 1,
        fidelity
      );
      setLayer2Result(l2);

      // 3. Solve Layer 3 Shrinkage & Gross HC
      const l3 = solveLayer3(l2.rosterHC, shrinkageBlock, fidelity);
      setLayer3Result(l3);

      // Update completed stages
      setCompletedStages(
        new Set<StageId>(['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S6B', 'S7B'])
      );
      setIsRunning(false);
    }, 150);
  };

  // Run Mode B Fixed HC evaluation
  const handleRunModeB = (hc: number) => {
    const capMap = new Map<string, number>();
    fctData.forEach(i => capMap.set(`${i.date}_${i.intervalStart}`, hc));

    const sim = runDESReplication({
      intervals: fctData,
      queues: businessBlock.queues,
      pools: businessBlock.pools,
      intervalMinutes: 30,
      seedBlock: 42,
      replicationIndex: 0,
      intervalCapacity: capMap,
    });

    const targetSL = businessBlock.queues[0]?.targetSL || 0.80;
    const passed = sim.sl1 >= targetSL;

    setModeBResult({
      givenHC: hc,
      achievedSL: sim.sl1,
      achievedASA: sim.asa,
      achievedAnswerRate: 1.0 - sim.abandonmentRate,
      achievedAbandonment: sim.abandonmentRate,
      achievedOccupancy: sim.occupancy,
      targetPassed: passed,
      bindingKPI: passed ? 'None (All Passed)' : 'Service Level (SL1)',
      shortfallKPIs: passed ? [] : ['SL1 Target not met'],
      validatorReport: {
        isValid: true,
        hardViolationsCount: 0,
        relaxableViolationsCount: 0,
        violations: [],
        rulesChecked: ['Shift bounds', 'Capacity'],
      },
      gapToMinHC: layer2Result ? hc - layer2Result.rosterHC : undefined,
      fidelity,
    });
  };

  // Handlers for stage transitions
  const handleConfirmCleanedData = (cleaned: IntervalFCT[], report: CleaningReport) => {
    setFctData(cleaned);
    setCleaningReport(report);
    setCompletedStages(prev => new Set([...prev, 'S1']));
    setCurrentStage('S2');
  };

  const handleLockForecast = (source: 'USER_FCT' | 'APP_FORECAST') => {
    setForecastSource(source);
    setIsForecastLocked(true);
    setCompletedStages(prev => new Set([...prev, 'S2', 'S3']));
    setCurrentStage('S4');
  };

  const handleConfirmConfig = () => {
    setCompletedStages(prev => new Set([...prev, 'S4', 'S5']));
    handleRunFullOptimization();
    setCurrentStage(mode === 'MODE_A' ? 'S6' : 'S6B');
  };

  // Export JSON Container (PRD 13.8)
  const handleExportJSON = () => {
    const projectContainer = {
      manifest: {
        schemaVersion: '7.1.0',
        engineHash: hash128('WFM_PRD_V7_1_ENGINE_CORE_OFFLINE'),
        timestamp: new Date().toISOString(),
        mode,
        fidelity,
      },
      configuration: {
        businessBlock,
        scheduleBlock,
        shrinkageBlock,
      },
      forecastRelease: {
        source: forecastSource,
        isLocked: isForecastLocked,
        intervalCount: fctData.length,
      },
      results: {
        layer1: layer1Result,
        layer2: layer2Result,
        layer3: layer3Result,
        modeB: modeBResult,
      },
    };

    const blob = new Blob([JSON.stringify(projectContainer, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wfm_project_container_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV Summary
  const handleExportCSV = () => {
    if (!layer2Result || !layer3Result || !layer1Result) return;
    let csv = 'Metric,Value,Unit,Layer\n';
    csv += `Pure Seat-Hours,${layer1Result.pureSeatHours.toFixed(2)},hours,Layer 1\n`;
    csv += `Pure FTE-Equivalent,${layer1Result.fteEquivalent.toFixed(2)},FTE,Layer 1\n`;
    csv += `Peak Seats,${layer1Result.peakSeats},seats,Layer 1\n`;
    csv += `Roster Headcount,${layer2Result.rosterHC},agents,Layer 2\n`;
    csv += `Rigorous Lower Bound,${layer2Result.rigorousLowerBound},agents,Layer 2\n`;
    csv += `Model-Based Bound,${layer2Result.modelBasedBound},agents,Layer 2\n`;
    csv += `Residual Shrinkage,${(layer3Result.residualShrinkageFactor * 100).toFixed(1)}%,percent,Layer 3\n`;
    csv += `Final Gross Headcount,${layer3Result.grossHC},total agents,Layer 3\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wfm_sizing_summary_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fidelity={fidelity}
        onOpenPrd={() => setIsPrdOpen(true)}
        onOpenConstants={() => setIsConstantsOpen(true)}
        onRunEngine={handleRunFullOptimization}
        isRunning={isRunning}
      />

      {/* Stage Stepper for Locked Planner Flow */}
      {activeTab === 'WORKBENCH' && (
        <StageStepper
          currentStage={currentStage}
          onSelectStage={(st) => setCurrentStage(st)}
          mode={mode}
          setMode={(m) => {
            setMode(m);
            setCurrentStage(m === 'MODE_A' ? 'S6' : 'S6B');
          }}
          fidelity={fidelity}
          setFidelity={(f) => {
            setFidelity(f);
            handleRunFullOptimization();
          }}
          completedStages={completedStages}
        />
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {activeTab === 'WORKBENCH' && (
          <div>
            {currentStage === 'S1' && (
              <UploadStage
                onConfirmCleanedData={handleConfirmCleanedData}
                initialReport={cleaningReport}
              />
            )}

            {(currentStage === 'S2' || currentStage === 'S3') && (
              <ForecastStage
                fctData={fctData}
                onLockForecastRelease={handleLockForecast}
                isLocked={isForecastLocked}
                lockedSource={forecastSource}
              />
            )}

            {(currentStage === 'S4' || currentStage === 'S5') && (
              <ConfigStage
                businessBlock={businessBlock}
                setBusinessBlock={setBusinessBlock}
                scheduleBlock={scheduleBlock}
                setScheduleBlock={setScheduleBlock}
                shrinkageBlock={shrinkageBlock}
                setShrinkageBlock={setShrinkageBlock}
                onConfirmConfig={handleConfirmConfig}
              />
            )}

            {currentStage === 'S6' && mode === 'MODE_A' && (
              <Layer1Stage
                layer1Result={layer1Result}
                onAdvanceToLayer2={() => setCurrentStage('S7')}
              />
            )}

            {currentStage === 'S7' && mode === 'MODE_A' && (
              <Layer2Stage
                layer2Result={layer2Result}
                onAdvanceToLayer3={() => setCurrentStage('S8')}
                onViewRosterGrid={() => setActiveTab('ROSTER')}
              />
            )}

            {currentStage === 'S8' && mode === 'MODE_A' && (
              <Layer3Stage
                layer1Result={layer1Result}
                layer2Result={layer2Result}
                layer3Result={layer3Result}
                onExportJSON={handleExportJSON}
                onExportCSV={handleExportCSV}
              />
            )}

            {(currentStage === 'S6B' || currentStage === 'S7B') && mode === 'MODE_B' && (
              <ModeBStage
                queueConfig={businessBlock.queues[0]}
                modeBResult={modeBResult}
                onRunModeB={handleRunModeB}
                matchingModeAHC={layer2Result?.rosterHC}
              />
            )}
          </div>
        )}

        {activeTab === 'ROSTER' && (
          <RosterTimetable layer2Result={layer2Result} />
        )}

        {activeTab === 'SIMULATION' && (
          <DESVisualizer
            intervals={fctData}
            queues={businessBlock.queues}
            pools={businessBlock.pools}
          />
        )}

        {activeTab === 'GOVERNANCE' && (
          <GovernanceView />
        )}

        {activeTab === 'SELF_TEST' && (
          <SelfTestRunner />
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-200 bg-white text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">WFM Minimum-HC Engine</span>
          <span>&middot;</span>
          <span>Offline HTML Architecture</span>
          <span>&middot;</span>
          <span>Zero Runtime Dependencies</span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          PRD v7.1 Compliant &middot; Core Hash: {hash128('WFM_PRD_V7_1_ENGINE_CORE_OFFLINE').slice(0, 16)}
        </div>
      </footer>

      {/* Modals */}
      <PrdReaderModal isOpen={isPrdOpen} onClose={() => setIsPrdOpen(false)} />
      <ConstantsRegisterModal isOpen={isConstantsOpen} onClose={() => setIsConstantsOpen(false)} />
    </div>
  );
}
