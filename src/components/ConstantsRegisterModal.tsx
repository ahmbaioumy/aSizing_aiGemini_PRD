/**
 * PRD v7.1 Constants Register & Engine Parameters Modal
 * Requirements: Section 2.1 Number Policy (N1 to N9) & Appendix A
 */

import React from 'react';
import { X, Sliders, Hash, ShieldCheck } from 'lucide-react';

interface ConstantsRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConstantsRegisterModal: React.FC<ConstantsRegisterModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const classKConstants = [
    { name: 'K_FLOAT64_SAFE_INTEGER', value: '9,007,199,254,740,992 (2^53)', provenance: 'IEEE 754 exact integer limit', test: 'Test T25' },
    { name: 'K_PRNG_TOP_BITS', value: '2^21', provenance: '53-bit uniform upper word shift', test: 'Test T25' },
    { name: 'K_SECONDS_PER_HOUR', value: '3,600', provenance: 'Unit conversion standard', test: 'Test T30' },
    { name: 'K_SECONDS_PER_MINUTE', value: '60', provenance: 'Unit conversion standard', test: 'Test T21' },
    { name: 'K_HOURS_PER_DAY', value: '24', provenance: 'Civil calendar day length', test: 'Test T11' },
    { name: 'K_DAYS_PER_WEEK', value: '7', provenance: 'Weekly shift schedule cycle', test: 'Test T33' },
    { name: 'K_MURMUR3_C1', value: '0x85ebca6b', provenance: 'MurmurHash3 32-bit finalizer constant 1', test: 'Test T12' },
    { name: 'K_MURMUR3_C2', value: '0xc2b2ae35', provenance: 'MurmurHash3 32-bit finalizer constant 2', test: 'Test T12' },
    { name: 'K_GOLDEN_RATIO', value: '1.618033988749895', provenance: 'Golden-section search ratio', test: 'Test T32' },
  ];

  const classPParameters = [
    { name: 'P_TARGET_SL', value: '0.80 (80%)', stage: 'S4 Business', unit: 'ratio', range: '[0.01, 1.0]' },
    { name: 'P_TARGET_TIME_T', value: '20', stage: 'S4 Business', unit: 'seconds', range: '[1, 600]' },
    { name: 'P_OCCUPANCY_CAP', value: '0.85 (85%)', stage: 'S4 Business', unit: 'ratio', range: '[0.50, 0.99]' },
    { name: 'P_MIN_SEATS_WHILE_OPEN', value: '2', stage: 'S4 Business', unit: 'seats', range: '[1, 100]' },
    { name: 'P_HC_SEARCH_CEILING', value: '45', stage: 'S4 Business', unit: 'agents', range: '[1, 500]' },
    { name: 'P_ROSTER_CYCLE_WEEKS', value: '2', stage: 'S4 Schedule', unit: 'weeks', range: '[1, 8]' },
    { name: 'P_MIN_REST_HOURS', value: '11', stage: 'S4 Schedule', unit: 'hours', range: '[8, 24]' },
    { name: 'P_MAX_CONSECUTIVE_DAYS', value: '6', stage: 'S4 Schedule', unit: 'days', range: '[4, 14]' },
    { name: 'P_CONFIDENCE_LEVEL', value: '0.95 (95%)', stage: 'S4 Controls', unit: 'confidence', range: '[0.80, 0.999]' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-slate-800" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Number Policy: Constants & Parameters Register
              </h3>
              <span className="text-xs text-slate-500">
                PRD Section 2.1 (N1 - N9): Every number belongs strictly to Class U, P, D, K, or R.
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Class K Register */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-slate-500" />
                <span>Class K Named Constants Register (PRD N2)</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-500">
                Strict build scan: zero unclassed literals
              </span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Constant Identifier</th>
                    <th className="py-2.5 px-3">Fixed Value</th>
                    <th className="py-2.5 px-3">Provenance / Authority</th>
                    <th className="py-2.5 px-3">Pinning Test</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                  {classKConstants.map((k) => (
                    <tr key={k.name} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-900">{k.name}</td>
                      <td className="py-2 px-3 text-blue-700">{k.value}</td>
                      <td className="py-2 px-3 font-sans text-slate-600">{k.provenance}</td>
                      <td className="py-2 px-3 text-emerald-700">{k.test}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Class P Register */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-slate-500" />
              <span>Class P Engine Parameters Panel (PRD N4)</span>
            </h4>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Parameter Name</th>
                    <th className="py-2.5 px-3">Current Value</th>
                    <th className="py-2.5 px-3">Stage Owner</th>
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3">Allowed Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                  {classPParameters.map((p) => (
                    <tr key={p.name} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-900">{p.name}</td>
                      <td className="py-2 px-3 text-slate-900 font-semibold">{p.value}</td>
                      <td className="py-2 px-3 font-sans text-slate-600">{p.stage}</td>
                      <td className="py-2 px-3 text-slate-500">{p.unit}</td>
                      <td className="py-2 px-3 text-slate-500">{p.range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
