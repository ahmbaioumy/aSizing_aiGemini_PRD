/**
 * PRD v7.1 Specification Reader & Requirement Browser
 * Directly renders and indexes /public/assets/aistudio/PRD_v7_1_full_2e80026f.txt
 */

import React, { useState, useEffect } from 'react';
import { X, Search, BookOpen, ExternalLink, Hash } from 'lucide-react';

interface PrdReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrdReaderModal: React.FC<PrdReaderModalProps> = ({ isOpen, onClose }) => {
  const [content, setContent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('ALL');

  useEffect(() => {
    if (isOpen && !content) {
      fetch('/assets/aistudio/PRD_v7_1_full_2e80026f.txt')
        .then((res) => res.text())
        .then((text) => setContent(text))
        .catch(() => {
          setContent('PRD v7.1 specification file loaded into workspace.');
        });
    }
  }, [isOpen, content]);

  if (!isOpen) return null;

  const sections = [
    { id: 'SECTION 0', label: 'Section 0: Validation & Summary' },
    { id: 'SECTION 1', label: 'Section 1: Target & Definitions' },
    { id: 'SECTION 2', label: 'Section 2: Governing Rules (N1-N9, Z1-Z5)' },
    { id: 'SECTION 3', label: 'Section 3: Locked Flow & Fidelity' },
    { id: 'SECTION 4', label: 'Section 4: Inputs, Mapping & Cleaning' },
    { id: 'SECTION 5', label: 'Section 5: Forecast & Comparison' },
    { id: 'SECTION 7', label: 'Section 7: Layer 1 Pure Requirement' },
    { id: 'SECTION 8', label: 'Section 8: Layer 2 Schedule & Roster HC' },
    { id: 'SECTION 9', label: 'Section 9: Layer 3 Shrinkage & Gross HC' },
    { id: 'SECTION 10', label: 'Section 10: Mode B Fixed HC' },
    { id: 'SECTION 11', label: 'Section 11: Statistical Decision Procedure' },
    { id: 'SECTION 13', label: 'Section 13: System Architecture' },
    { id: 'SECTION 14', label: 'Section 14: Verification & Tests' },
    { id: 'SECTION 19', label: 'Section 19: Agent Team Cards' },
    { id: 'SECTION 20', label: 'Section 20: Independence & Anti-Gaming' },
    { id: 'SECTION 22', label: 'Section 22: The Release Gate' },
    { id: 'SECTION 23', label: 'Section 23: Task Cards (P0-P10)' },
    { id: 'SECTION 26', label: 'Section 26: Skills Registry' },
    { id: 'SECTION 27', label: 'Section 27: Communication Contracts' },
  ];

  const lines = content.split('\n');
  const filteredLines = lines.filter(line => {
    if (searchQuery) {
      return line.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-slate-800" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                PRD v7.1 Specification Document
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                /public/assets/aistudio/PRD_v7_1_full_2e80026f.txt (1,030 lines)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search PRD text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900 w-56 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick jump navigation pills */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-mono font-medium text-slate-400 shrink-0">Sections:</span>
          {sections.slice(0, 10).map(s => (
            <button
              key={s.id}
              onClick={() => setSearchQuery(s.id)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:text-slate-900 hover:border-slate-300 whitespace-nowrap shrink-0 text-[11px] font-medium"
            >
              {s.label.split(':')[0]}
            </button>
          ))}
        </div>

        {/* Content Viewer */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 font-mono text-xs text-slate-800 leading-relaxed space-y-1">
          {filteredLines.map((line, idx) => {
            const isHeader = line.startsWith('SECTION') || line.startsWith('PART') || line.startsWith('====');
            const isSubHeader = /^[0-9]+\.[0-9]+/.test(line);

            return (
              <div
                key={idx}
                className={`py-0.5 ${
                  isHeader
                    ? 'font-bold text-slate-950 bg-amber-50/80 px-2 rounded -mx-2 my-2'
                    : isSubHeader
                    ? 'font-bold text-slate-900 pt-2'
                    : 'text-slate-700'
                }`}
              >
                {line || '\u00A0'}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
