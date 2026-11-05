/**
 * PRD v7.1 S1: Upload FCT & Data Cleaning Stage
 * Requirements: Section 4.1 - 4.4, Tests T10, T57-T66, Case 9
 */

import React, { useState } from 'react';
import { CleaningReport, IntervalFCT } from '../types/wfm';
import { cleanAndProcessFCT, ColumnMapping, ConflictingDuplicateRule, GapTreatment } from '../engine/cleaner';
import { CASE_9_RAW_CSV, generateCase2Intervals } from '../engine/sampleData';
import { UploadCloud, CheckCircle2, AlertTriangle, FileSpreadsheet, ArrowRight, Download } from 'lucide-react';

interface UploadStageProps {
  onConfirmCleanedData: (fct: IntervalFCT[], report: CleaningReport) => void;
  initialReport: CleaningReport | null;
}

export const UploadStage: React.FC<UploadStageProps> = ({
  onConfirmCleanedData,
  initialReport,
}) => {
  const [csvContent, setCsvContent] = useState<string>(CASE_9_RAW_CSV);
  const [mapping, setMapping] = useState<ColumnMapping>({
    dateCol: 'CallDate',
    intervalCol: 'SlotStart',
    queueCol: 'QueueName',
    volumeCol: 'OfferedCalls',
    ahtCol: 'HandleTimeSec',
  });
  const [duplicateRule, setDuplicateRule] = useState<ConflictingDuplicateRule>('KEEP_FIRST');
  const [gapTreatment, setGapTreatment] = useState<GapTreatment>('TREAT_AS_ZERO');
  const [cleanResult, setCleanResult] = useState<{
    report: CleaningReport;
    cleanedFCT: IntervalFCT[];
    isBlockedBySafetyLimit: boolean;
  } | null>(() => {
    return cleanAndProcessFCT(CASE_9_RAW_CSV, {
      dateCol: 'CallDate',
      intervalCol: 'SlotStart',
      queueCol: 'QueueName',
      volumeCol: 'OfferedCalls',
      ahtCol: 'HandleTimeSec',
    });
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvContent(text);
        // Try to auto-guess columns
        const firstLine = text.trim().split(/\r\n|\n/)[0] || '';
        const headers = firstLine.split(',').map(h => h.trim());
        setMapping({
          dateCol: headers[0] || 'date',
          intervalCol: headers[1] || 'interval',
          queueCol: headers[2] || 'queue',
          volumeCol: headers[3] || 'volume',
          ahtCol: headers[4] || 'aht',
        });
        const res = cleanAndProcessFCT(text, {
          dateCol: headers[0] || 'date',
          intervalCol: headers[1] || 'interval',
          queueCol: headers[2] || 'queue',
          volumeCol: headers[3] || 'volume',
          ahtCol: headers[4] || 'aht',
        }, duplicateRule, gapTreatment);
        setCleanResult(res);
      };
      reader.readAsText(file);
    }
  };

  const handleRunCleaning = () => {
    const res = cleanAndProcessFCT(csvContent, mapping, duplicateRule, gapTreatment);
    setCleanResult(res);
  };

  const handleLoadCase2 = () => {
    const intervals = generateCase2Intervals();
    // Convert to CSV
    let csv = 'CallDate,SlotStart,QueueName,OfferedCalls,HandleTimeSec\n';
    intervals.forEach(i => {
      csv += `${i.date},${i.intervalStart},${i.queueId},${i.volume},${i.aht}\n`;
    });
    setCsvContent(csv);
    setMapping({
      dateCol: 'CallDate',
      intervalCol: 'SlotStart',
      queueCol: 'QueueName',
      volumeCol: 'OfferedCalls',
      ahtCol: 'HandleTimeSec',
    });
    const res = cleanAndProcessFCT(csv, {
      dateCol: 'CallDate',
      intervalCol: 'SlotStart',
      queueCol: 'QueueName',
      volumeCol: 'OfferedCalls',
      ahtCol: 'HandleTimeSec',
    }, duplicateRule, gapTreatment);
    setCleanResult(res);
  };

  const handleDownloadCleanedCSV = () => {
    if (!cleanResult) return;
    let csv = 'date,intervalStart,queueId,volume,aht\n';
    cleanResult.cleanedFCT.forEach(row => {
      csv += `${row.date},${row.intervalStart},${row.queueId},${row.volume},${row.aht}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleaned_fct_${cleanResult.report.cleanedHash.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            S1. Upload FCT & Explicit Data Cleaning
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Section 4.1–4.4: Ingestion with column mapping, logged removal of negatives and duplicates, and gap treatment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLoadCase2}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Load Case 2 (Clean 2-Day FCT)
          </button>
          <button
            onClick={() => {
              setCsvContent(CASE_9_RAW_CSV);
              handleRunCleaning();
            }}
            className="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
          >
            Load Case 9 (Dirty CSV Benchmark)
          </button>
        </div>
      </div>

      {/* Main Grid: Upload & Column Mapping */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload & CSV Preview Box */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-slate-500" />
            <span>Source CSV Input</span>
          </h3>

          <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-slate-300 transition-colors">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="fct-upload-input"
            />
            <label
              htmlFor="fct-upload-input"
              className="cursor-pointer block text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <span>Click to choose CSV file or drag here</span>
            </label>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Raw CSV Content Preview (RFC 4180)
            </label>
            <textarea
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              rows={8}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <button
            onClick={handleRunCleaning}
            className="w-full py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Reparse & Clean Data
          </button>
        </div>

        {/* Column Mapping & Cleaning Policies */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-5">
          <h3 className="text-sm font-semibold text-slate-900">
            Column Mapping & Explicit Cleaning Policies
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                Date Column *
              </label>
              <input
                type="text"
                value={mapping.dateCol}
                onChange={(e) => setMapping({ ...mapping, dateCol: e.target.value })}
                className="w-full text-xs font-mono px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                Interval Start *
              </label>
              <input
                type="text"
                value={mapping.intervalCol}
                onChange={(e) => setMapping({ ...mapping, intervalCol: e.target.value })}
                className="w-full text-xs font-mono px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                Queue Column
              </label>
              <input
                type="text"
                value={mapping.queueCol}
                onChange={(e) => setMapping({ ...mapping, queueCol: e.target.value })}
                className="w-full text-xs font-mono px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                Offered Volume *
              </label>
              <input
                type="text"
                value={mapping.volumeCol}
                onChange={(e) => setMapping({ ...mapping, volumeCol: e.target.value })}
                className="w-full text-xs font-mono px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                Handle Time (AHT) *
              </label>
              <input
                type="text"
                value={mapping.ahtCol}
                onChange={(e) => setMapping({ ...mapping, ahtCol: e.target.value })}
                className="w-full text-xs font-mono px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Conflicting Duplicate Rule (PRD 4.3 Rule 3)
              </label>
              <select
                value={duplicateRule}
                onChange={(e) => setDuplicateRule(e.target.value as ConflictingDuplicateRule)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="KEEP_FIRST">Keep First Row (Discard newer)</option>
                <option value="KEEP_LAST">Keep Last Row (Overwrite earlier)</option>
                <option value="EXCLUDE_ALL">Exclude Every Conflicting Row</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Operating Gap Treatment (PRD 4.3 Rule 4)
              </label>
              <select
                value={gapTreatment}
                onChange={(e) => setGapTreatment(e.target.value as GapTreatment)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="TREAT_AS_ZERO">Treat Missing Intervals as Zero Volume</option>
                <option value="INTERPOLATE">Linear Interpolation across Adjacent Hours</option>
                <option value="HISTORICAL_AVERAGE">Replace with Historical Analog Average</option>
              </select>
            </div>
          </div>

          {/* Cleaned Metric Summary */}
          {cleanResult && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-900">
                  Cleaning Summary & Lineage Hashes
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Cleaned Hash: {cleanResult.report.cleanedHash.slice(0, 16)}...
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Total Rows</span>
                  <span className="font-semibold text-slate-800 font-mono tabular-nums">{cleanResult.report.totalRows}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Accepted Clean Rows</span>
                  <span className="font-semibold text-emerald-700 font-mono tabular-nums">{cleanResult.report.acceptedRows}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Negatives Removed</span>
                  <span className="font-semibold text-amber-700 font-mono tabular-nums">{cleanResult.report.negativeRows}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Exact / Conflicting Dups</span>
                  <span className="font-semibold text-amber-700 font-mono tabular-nums">
                    {cleanResult.report.exactDuplicates} / {cleanResult.report.conflictingDuplicates}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit Log Table (PRD 4.4: Every removed or rejected row with original row number and reason) */}
      {cleanResult && cleanResult.report.logs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Data Cleaning Audit Log (PRD 4.4)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every removed or modified row is explicitly itemized with original line number and mathematical cause.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              {cleanResult.report.logs.length} Logged Adjustments
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <tr>
                  <th className="py-2 px-3">Row #</th>
                  <th className="py-2 px-3">Timestamp Key</th>
                  <th className="py-2 px-3">Queue</th>
                  <th className="py-2 px-3">Violation Reason</th>
                  <th className="py-2 px-3">Action Taken</th>
                  <th className="py-2 px-3">Raw Values</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {cleanResult.report.logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-slate-500">L{log.originalRowNumber}</td>
                    <td className="py-2 px-3 font-mono">{log.date} {log.intervalStart}</td>
                    <td className="py-2 px-3">{log.queueId}</td>
                    <td className="py-2 px-3 font-semibold text-amber-800">
                      {log.reason}
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {log.actionTaken}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-500">
                      {JSON.stringify(log.originalValues)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation & Stage Advance Action */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={handleDownloadCleanedCSV}
          disabled={!cleanResult}
          className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Cleaned CSV</span>
        </button>

        <button
          onClick={() => {
            if (cleanResult) {
              onConfirmCleanedData(cleanResult.cleanedFCT, cleanResult.report);
            }
          }}
          disabled={!cleanResult || cleanResult.cleanedFCT.length === 0}
          className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
        >
          <span>Confirm Cleaned FCT & Lock S1</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
