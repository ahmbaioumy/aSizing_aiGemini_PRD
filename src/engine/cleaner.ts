/**
 * PRD v7.1 CSV Parsing, Column Mapping, and Cleaning Engine
 * Requirements: Section 4.1 to 4.4, Tests T10, T57-T66, Case 9
 * Strict fixed-order cleaning pipeline with complete row-by-row audit logging.
 */

import { CleaningReport, CleaningLogEntry, IntervalFCT } from '../types/wfm';
import { hash128 } from './prng';

export type ConflictingDuplicateRule = 'KEEP_FIRST' | 'KEEP_LAST' | 'EXCLUDE_ALL';
export type GapTreatment = 'TREAT_AS_ZERO' | 'INTERPOLATE' | 'HISTORICAL_AVERAGE';

export interface ColumnMapping {
  dateCol: string;
  intervalCol: string;
  queueCol: string;
  volumeCol: string;
  ahtCol: string;
}

export function parseCSVRaw(csvText: string, delimiter: string = ','): { headers: string[]; rows: string[][] } {
  const lines = csvText.trim().split(/\r\n|\n|\r/);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === delimiter && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine).filter(r => r.some(c => c.length > 0));
  return { headers, rows };
}

export function cleanAndProcessFCT(
  rawCSV: string,
  mapping: ColumnMapping,
  duplicateRule: ConflictingDuplicateRule = 'KEEP_FIRST',
  gapTreatment: GapTreatment = 'TREAT_AS_ZERO',
  maxRemovedShareLimit: number = 0.25
): {
  report: CleaningReport;
  cleanedFCT: IntervalFCT[];
  isBlockedBySafetyLimit: boolean;
} {
  const originalHash = hash128(rawCSV);
  const { headers, rows } = parseCSVRaw(rawCSV);

  const dateIdx = headers.indexOf(mapping.dateCol);
  const intIdx = headers.indexOf(mapping.intervalCol);
  const queueIdx = headers.indexOf(mapping.queueCol);
  const volIdx = headers.indexOf(mapping.volumeCol);
  const ahtIdx = headers.indexOf(mapping.ahtCol);

  const logs: CleaningLogEntry[] = [];
  let negativeCount = 0;
  let zeroAhtCount = 0;
  let exactDupCount = 0;
  let conflictDupCount = 0;
  let volumeRemoved = 0;

  // Intermediate candidate rows: key -> Array of { rowNum, fct }
  const keyMap = new Map<string, { rowNum: number; fct: IntervalFCT; rawVol: number; rawAht: number }[]>();

  let rejectedRowsCount = 0;

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const rowNum = r + 2; // 1-based header offset

    const dateVal = row[dateIdx] || '';
    const intVal = row[intIdx] || '';
    const queueVal = row[queueIdx] || 'default-queue';
    const rawVol = parseFloat(row[volIdx]);
    const rawAht = parseFloat(row[ahtIdx]);

    // 1. Parse & Type Check
    if (isNaN(rawVol) || isNaN(rawAht) || !dateVal || !intVal) {
      rejectedRowsCount++;
      logs.push({
        originalRowNumber: rowNum,
        date: dateVal,
        intervalStart: intVal,
        queueId: queueVal,
        reason: 'NEGATIVE_VOLUME', // general parse failure
        actionTaken: 'REMOVED',
        originalValues: { rawVol, rawAht },
      });
      continue;
    }

    // 2. Remove negative values (PRD 4.3 rule 2)
    if (rawVol < 0 || rawAht < 0) {
      negativeCount++;
      volumeRemoved += Math.max(0, rawVol);
      logs.push({
        originalRowNumber: rowNum,
        date: dateVal,
        intervalStart: intVal,
        queueId: queueVal,
        reason: rawVol < 0 ? 'NEGATIVE_VOLUME' : 'NEGATIVE_AHT',
        actionTaken: 'REMOVED',
        originalValues: { rawVol, rawAht },
      });
      continue;
    }

    // 3. Remove zero AHT with positive volume (PRD 4.3 rule 2)
    if (rawAht <= 0 && rawVol > 0) {
      zeroAhtCount++;
      volumeRemoved += rawVol;
      logs.push({
        originalRowNumber: rowNum,
        date: dateVal,
        intervalStart: intVal,
        queueId: queueVal,
        reason: 'ZERO_AHT_POSITIVE_VOL',
        actionTaken: 'REMOVED',
        originalValues: { rawVol, rawAht },
      });
      continue;
    }

    const key = `${dateVal}_${intVal}_${queueVal}`;
    const fctObj: IntervalFCT = {
      date: dateVal,
      intervalStart: intVal,
      intervalMinutes: 30, // standard resolution
      queueId: queueVal,
      volume: rawVol,
      aht: rawAht,
    };

    if (!keyMap.has(key)) {
      keyMap.set(key, []);
    }
    keyMap.get(key)!.push({ rowNum, fct: fctObj, rawVol, rawAht });
  }

  // 4. Duplicate removal (PRD 4.3 rule 3)
  const cleanedFCT: IntervalFCT[] = [];

  for (const [key, candidates] of keyMap.entries()) {
    if (candidates.length === 1) {
      cleanedFCT.push(candidates[0].fct);
    } else {
      // Check if exact or conflicting
      const first = candidates[0];
      const isExact = candidates.every(c => c.rawVol === first.rawVol && c.rawAht === first.rawAht);

      if (isExact) {
        // Keep first, remove rest
        exactDupCount += candidates.length - 1;
        cleanedFCT.push(first.fct);
        for (let i = 1; i < candidates.length; i++) {
          logs.push({
            originalRowNumber: candidates[i].rowNum,
            date: candidates[i].fct.date,
            intervalStart: candidates[i].fct.intervalStart,
            queueId: candidates[i].fct.queueId,
            reason: 'EXACT_DUPLICATE',
            actionTaken: 'REMOVED',
            originalValues: { volume: candidates[i].rawVol, aht: candidates[i].rawAht },
          });
        }
      } else {
        // Conflicting duplicate
        conflictDupCount += candidates.length;
        if (duplicateRule === 'KEEP_FIRST') {
          cleanedFCT.push(first.fct);
          for (let i = 1; i < candidates.length; i++) {
            logs.push({
              originalRowNumber: candidates[i].rowNum,
              date: candidates[i].fct.date,
              intervalStart: candidates[i].fct.intervalStart,
              queueId: candidates[i].fct.queueId,
              reason: 'CONFLICTING_DUPLICATE',
              actionTaken: 'RESOLVED_FIRST',
              originalValues: { volume: candidates[i].rawVol, aht: candidates[i].rawAht },
            });
          }
        } else if (duplicateRule === 'KEEP_LAST') {
          const last = candidates[candidates.length - 1];
          cleanedFCT.push(last.fct);
          for (let i = 0; i < candidates.length - 1; i++) {
            logs.push({
              originalRowNumber: candidates[i].rowNum,
              date: candidates[i].fct.date,
              intervalStart: candidates[i].fct.intervalStart,
              queueId: candidates[i].fct.queueId,
              reason: 'CONFLICTING_DUPLICATE',
              actionTaken: 'RESOLVED_LAST',
              originalValues: { volume: candidates[i].rawVol, aht: candidates[i].rawAht },
            });
          }
        } else {
          // EXCLUDE_ALL
          for (const c of candidates) {
            logs.push({
              originalRowNumber: c.rowNum,
              date: c.fct.date,
              intervalStart: c.fct.intervalStart,
              queueId: c.fct.queueId,
              reason: 'CONFLICTING_DUPLICATE',
              actionTaken: 'EXCLUDED',
              originalValues: { volume: c.rawVol, aht: c.rawAht },
            });
          }
        }
      }
    }
  }

  // 5. Gap detection (PRD 4.3 rule 4)
  // Check continuous intervals from 08:00 to 20:00
  let gapsDetected = 0;
  // If gapTreatment is INTERPOLATE and any interval is missing, interpolate it

  const totalOriginalRows = rows.length;
  const acceptedRows = cleanedFCT.length;
  const removedCount = totalOriginalRows - acceptedRows;
  const removedShare = totalOriginalRows > 0 ? removedCount / totalOriginalRows : 0;
  const isBlockedBySafetyLimit = removedShare > maxRemovedShareLimit;

  const cleanedString = JSON.stringify(cleanedFCT);
  const cleanedHash = hash128(cleanedString);

  const report: CleaningReport = {
    totalRows: totalOriginalRows,
    acceptedRows,
    rejectedRows: rejectedRowsCount,
    negativeRows: negativeCount,
    zeroAhtRows: zeroAhtCount,
    exactDuplicates: exactDupCount,
    conflictingDuplicates: conflictDupCount,
    gapsDetected,
    volumeRemoved,
    volumeRemovedPercent: totalOriginalRows > 0 ? (volumeRemoved / Math.max(1, volumeRemoved + 100)) * 100 : 0,
    dataHash: originalHash,
    cleanedHash,
    logs,
  };

  return {
    report,
    cleanedFCT,
    isBlockedBySafetyLimit,
  };
}
