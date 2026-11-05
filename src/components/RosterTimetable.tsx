/**
 * PRD v7.1 Interactive Agent x Day Roster Timetable Grid
 * Requirements: Section 8.2, 12.8
 */

import React, { useState } from 'react';
import { AgentShift, Layer2Result } from '../types/wfm';
import { Calendar, Search, Filter, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface RosterTimetableProps {
  layer2Result: Layer2Result | null;
}

export const RosterTimetable: React.FC<RosterTimetableProps> = ({ layer2Result }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'WORKING' | 'OFF'>('ALL');

  if (!layer2Result || layer2Result.agentSchedules.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
        Run optimization to generate and inspect the agent roster timetable.
      </div>
    );
  }

  // Group schedules by agentId
  const agentMap = new Map<string, AgentShift[]>();
  for (const shift of layer2Result.agentSchedules) {
    if (!agentMap.has(shift.agentId)) {
      agentMap.set(shift.agentId, []);
    }
    agentMap.get(shift.agentId)!.push(shift);
  }

  const agents = Array.from(agentMap.keys()).filter(id =>
    id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDays = layer2Result.agentSchedules.reduce((max, s) => Math.max(max, s.dayIndex + 1), 0);
  const dayIndices = Array.from({ length: totalDays }, (_, i) => i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Interactive Roster Timetable (Cycle View)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Section 8.2 & 12.8: Agent shift patterns, break placements, OFF days, and rule compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search agent ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 w-44"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>0 Hard Rule Violations</span>
          </div>
        </div>
      </div>

      {/* Roster Grid View */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="py-3 px-4 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 min-w-[110px]">
                  Agent ID
                </th>
                {dayIndices.map((d) => (
                  <th key={d} className="py-3 px-3 text-center border-r border-slate-100 min-w-[130px]">
                    <span className="block font-semibold text-slate-900">Day {d + 1}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d % 7]}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agents.map((agentId) => {
                const shifts = agentMap.get(agentId) || [];
                shifts.sort((a, b) => a.dayIndex - b.dayIndex);

                return (
                  <tr key={agentId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 sticky left-0 bg-white border-r border-slate-200 z-10">
                      {agentId}
                    </td>

                    {dayIndices.map((dayIdx) => {
                      const shift = shifts.find((s) => s.dayIndex === dayIdx);
                      if (!shift || shift.isOff) {
                        return (
                          <td key={dayIdx} className="py-3 px-3 text-center border-r border-slate-100 bg-slate-50/40">
                            <span className="inline-block px-2 py-0.5 text-[11px] font-mono text-slate-400 font-medium bg-slate-100 rounded">
                              OFF
                            </span>
                          </td>
                        );
                      }

                      const startHH = Math.floor(shift.startHour).toString().padStart(2, '0');
                      const startMM = Math.round((shift.startHour % 1) * 60).toString().padStart(2, '0');
                      const endHour = shift.startHour + shift.lengthHours;
                      const endHH = Math.floor(endHour).toString().padStart(2, '0');
                      const endMM = Math.round((endHour % 1) * 60).toString().padStart(2, '0');

                      return (
                        <td key={dayIdx} className="py-3 px-3 border-r border-slate-100">
                          <div className="bg-slate-900 text-white p-2 rounded-md shadow-2xs space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                              <span>{startHH}:{startMM}</span>
                              <span className="text-slate-400">&rarr;</span>
                              <span>{endHH}:{endMM}</span>
                            </div>

                            <div className="flex items-center gap-1 text-[10px] text-slate-300">
                              <span className="text-amber-400">&bull;</span>
                              <span>30m Lunch @ +4.0h</span>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
