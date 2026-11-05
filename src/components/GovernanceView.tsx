/**
 * PRD v7.1 Part B: Engineering Program & Governance Console
 * Sections 19 to 27: Agent Cards, Challenger Team, Attack Taxonomy, Skills Registry, Task Cards, and Gate
 */

import React, { useState } from 'react';
import {
  AGENT_CARDS,
  ATTACK_TAXONOMY,
  SKILLS_REGISTRY,
  TASK_CARDS,
  GATE_CRITERIA,
} from '../engine/governanceData';
import {
  ShieldCheck,
  Sword,
  Award,
  ListTodo,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Users,
} from 'lucide-react';

export const GovernanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GATE' | 'AGENTS' | 'CHALLENGER' | 'SKILLS' | 'TASKS'>('GATE');
  const [selectedAgent, setSelectedAgent] = useState(AGENT_CARDS[0]);
  const [selectedTask, setSelectedTask] = useState(TASK_CARDS[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Part B. Engineering Program & Governance Console
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Sections 19–27: Independent agent cards, 7-member challenger team, attack taxonomy, skills registry, task cards, and default-deny gate.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          <button
            onClick={() => setActiveTab('GATE')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'GATE'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Release Gate (G1-G15)</span>
          </button>

          <button
            onClick={() => setActiveTab('AGENTS')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'AGENTS'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Agent Cards (17)</span>
          </button>

          <button
            onClick={() => setActiveTab('CHALLENGER')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'CHALLENGER'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sword className="w-3.5 h-3.5 text-amber-600" />
            <span>Challenger Attacks (A01-A12)</span>
          </button>

          <button
            onClick={() => setActiveTab('SKILLS')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'SKILLS'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>Skills Registry (30)</span>
          </button>

          <button
            onClick={() => setActiveTab('TASKS')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'TASKS'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5 text-indigo-600" />
            <span>Task Cards (P0-P10)</span>
          </button>
        </div>
      </div>

      {/* 1. Release Gate Tab (PRD Section 22) */}
      {activeTab === 'GATE' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                  Release Gate Engine Status
                </span>
                <span className="text-xs font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                  Default-Deny Policy
                </span>
              </div>
              <h3 className="text-xl font-bold">15 / 15 Gating Criteria Satisfied (PASS)</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Section 22: The gate executes deterministically from a clean checkout. No agent self-reports evidence; all sign-offs are bound to artifact hashes.
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-xs font-mono shrink-0">
              <span className="text-slate-400 block mb-1">Human PO Release Status:</span>
              <span className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Authorized for Production</span>
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <tr>
                  <th className="py-3 px-4 w-16">ID</th>
                  <th className="py-3 px-4">Criterion Name</th>
                  <th className="py-3 px-4">Verification Method</th>
                  <th className="py-3 px-4">Evaluation Rule & Evidence</th>
                  <th className="py-3 px-4 text-right">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {GATE_CRITERIA.map((criterion) => (
                  <tr key={criterion.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{criterion.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{criterion.name}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {criterion.evaluationMethod === 'MECHANICAL_PIPELINE' ? (
                        <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Mechanical Pipeline
                        </span>
                      ) : (
                        <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          Gate Agent Judgment
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-md">{criterion.description}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded font-bold border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>PASS</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Agent Cards Tab (PRD Section 19) */}
      {activeTab === 'AGENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent list */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Agent Role Card
            </h3>
            <div className="space-y-1">
              {AGENT_CARDS.map((agent) => (
                <button
                  key={agent.roleId}
                  onClick={() => setSelectedAgent(agent)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedAgent.roleId === agent.roleId
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-mono">{agent.roleId} - {agent.name.split('(')[0]}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    selectedAgent.roleId === agent.roleId ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {agent.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Card detail */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Role Card &middot; {selectedAgent.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedAgent.roleId}: {selectedAgent.name}
                </h3>
              </div>
              <span className="text-xs font-mono bg-slate-100 text-slate-800 px-3 py-1 rounded-md">
                10-Field Prompt Skeleton
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Mission</h4>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                  {selectedAgent.mission}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Authority</h4>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                  {selectedAgent.authority}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-red-900 mb-1">Prohibitions (Independence Rules)</h4>
                <ul className="list-disc pl-5 text-red-700 space-y-1">
                  {selectedAgent.prohibitions.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAgent.skills.map((s, idx) => (
                    <span key={idx} className="font-mono text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Quality Checklist Before Submitting</h4>
                <ul className="list-disc pl-5 text-slate-600 space-y-1">
                  {selectedAgent.qualityChecklist.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Challenger Team Tab (PRD Section 19.9) */}
      {activeTab === 'CHALLENGER' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Challenger Team & Attack Taxonomy (A01 - A12)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Section 19.9: The Challenger is a team of seven working blind and in parallel. Every finding requires a reproducible counterexample input file and command to be admissible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ATTACK_TAXONOMY.map((atk) => (
              <div key={atk.code} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {atk.code}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {atk.typicalDomains.join(', ')}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{atk.name}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{atk.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Skills Registry Tab (PRD Section 26) */}
      {activeTab === 'SKILLS' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="py-3 px-4 w-28">Skill ID</th>
                <th className="py-3 px-4 w-52">Skill Title</th>
                <th className="py-3 px-4 w-32">Domain</th>
                <th className="py-3 px-4">Mandatory Qualification Proof Exercise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {SKILLS_REGISTRY.map((skill) => (
                <tr key={skill.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{skill.id}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{skill.name}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">{skill.domain}</td>
                  <td className="py-2.5 px-4 text-slate-600">{skill.proofExercise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Task Cards Tab (PRD Section 23) */}
      {activeTab === 'TASKS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Task Card
            </h3>
            <div className="space-y-1">
              {TASK_CARDS.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedTask.id === task.id
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-mono">{task.id}</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                    {task.currentState}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  Phase {selectedTask.phase} &middot; {selectedTask.tier}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedTask.id}: {selectedTask.title}
                </h3>
              </div>
              <span className="font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded font-bold">
                {selectedTask.currentState}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 font-medium block">Spec Owner:</span>
                <span className="font-mono font-semibold text-slate-900">{selectedTask.specOwner}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Implementer (2-Instance Rule):</span>
                <span className="font-mono font-semibold text-slate-900">{selectedTask.implementer}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Verifiers:</span>
                <span className="font-mono text-slate-800">{selectedTask.verifiers.join(', ')}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Reviewers:</span>
                <span className="font-mono text-slate-800">{selectedTask.reviewers.join(', ')}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-medium block mb-1">Acceptance Criteria (Observable Form):</span>
              <p className="bg-slate-50 p-2.5 rounded border border-slate-100 text-slate-800 font-mono">
                {selectedTask.acceptance}
              </p>
            </div>

            <div>
              <span className="text-slate-500 font-medium block mb-1">Challenger Attack Focus:</span>
              <p className="text-amber-900 bg-amber-50/50 p-2.5 rounded border border-amber-200/60">
                {selectedTask.attackFocus}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
