/**
 * PRD v7.1 Acceptance Case Pack & Realistic Benchmark Datasets
 * Requirements: Section 14.3 (Cases 1 to 9), Section 4, Section 5
 */

import { QueueConfig, PoolConfig, IntervalFCT, ScheduleBlock, ShrinkageBlock, BusinessBlock } from '../types/wfm';

export const DEFAULT_BUSINESS_BLOCK: BusinessBlock = {
  pools: [
    {
      id: 'pool_voice',
      name: 'Customer Care Voice Pool',
      queueClass: 'REAL_TIME',
      productivityFactor: 1.0,
      minSeatsWhileOpen: 2,
      hcCeiling: 45,
    },
    {
      id: 'pool_chat',
      name: 'Digital Support Chat Pool',
      queueClass: 'REAL_TIME',
      productivityFactor: 1.0,
      minSeatsWhileOpen: 1,
      hcCeiling: 30,
      chatConcurrencyMax: 3,
    },
  ],
  queues: [
    {
      id: 'q_inbound_voice',
      name: 'Tier 1 Inbound Voice',
      poolId: 'pool_voice',
      queueClass: 'REAL_TIME',
      queueType: 'VOICE',
      targetSL: 0.80,
      targetSLTime: 20,
      targetSLVariant: 'SL1',
      targetASA: 25,
      targetAnswerRate: 0.95,
      abandonmentCap: 0.05,
      occupancyCap: 0.85,
      meanAHT: 240, // 4 mins
      cvAHT: 0.35,
      meanPatience: 180, // 3 mins patience
    },
  ],
  operatingHours: {
    startHour: 8,
    endHour: 20,
    daysOfWeek: [1, 2, 3, 4, 5, 6], // Mon - Sat
  },
  timeQuantum: 1,
  warmUpMinutes: 30,
  drainWindowHours: 2,
  shortAbandonThreshold: 5,
};

export const DEFAULT_SCHEDULE_BLOCK: ScheduleBlock = {
  allowedShiftStarts: ['08:00', '09:00', '10:00', '11:00', '12:00'],
  allowedShiftLengthsHours: [8],
  breaks: [
    {
      id: 'brk_lunch',
      name: 'Lunch Break',
      durationMinutes: 30,
      earliestHourAfterStart: 3.5,
      latestHourAfterStart: 5.0,
      isPaid: true,
      countsTowardContract: true,
    },
    {
      id: 'brk_rest',
      name: 'Rest Break',
      durationMinutes: 15,
      earliestHourAfterStart: 6.0,
      latestHourAfterStart: 7.0,
      isPaid: true,
      countsTowardContract: true,
    },
  ],
  rosterCycleWeeks: 2,
  minRestHoursBetweenShifts: 11,
  maxConsecutiveWorkDays: 6,
  weeklyOffDays: 2,
  enforceAdjacentOffDays: true,
  minWeeklyHours: 32,
  maxWeeklyHours: 40,
  relaxableRules: {
    adjacentOffDays: false,
    restHours: false,
    maxConsecutiveDays: false,
  },
};

export const DEFAULT_SHRINKAGE_BLOCK: ShrinkageBlock = {
  contractHoursPerWeek: 40,
  paidBreakMinutesPerDay: 45,
  components: [
    { id: 'sh_leave', name: 'Planned Annual Leave', rate: 0.08, base: 'TOTAL', isModeledInRoster: false },
    { id: 'sh_sick', name: 'Unplanned Sickness / Absence', rate: 0.05, base: 'TOTAL', isModeledInRoster: false },
    { id: 'sh_training', name: 'Team Coaching & Training', rate: 0.04, base: 'TOTAL', isModeledInRoster: false },
    { id: 'sh_adherence', name: 'Schedule Adherence / Auxiliary', rate: 0.03, base: 'TOTAL', isModeledInRoster: false },
    { id: 'sh_breaks', name: 'Scheduled Shift Breaks', rate: 0.09, base: 'TOTAL', isModeledInRoster: true }, // Excluded from Layer 3
  ],
};

/**
 * Generates Case 2 (2-day Horizon SL instance) with realistic intraday bell-curve shape
 */
export function generateCase2Intervals(): IntervalFCT[] {
  const intervals: IntervalFCT[] = [];
  const dates = ['2026-11-09', '2026-11-10']; // Mon, Tue
  const times = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  ];

  // Intraday volume multipliers (peak around 10:30 and 14:00)
  const multipliers = [
    0.4, 0.6, 0.9, 1.3, 1.5, 1.4,
    1.2, 1.1, 0.9, 0.8, 1.2, 1.4,
    1.3, 1.1, 0.9, 0.8, 0.7, 0.6,
    0.5, 0.4, 0.3, 0.3, 0.2, 0.2,
  ];

  for (const date of dates) {
    for (let i = 0; i < times.length; i++) {
      const baseVol = 35;
      const vol = Math.round(baseVol * multipliers[i]);
      intervals.push({
        date,
        intervalStart: times[i],
        intervalMinutes: 30,
        queueId: 'q_inbound_voice',
        volume: vol,
        aht: 240, // 4 mins
      });
    }
  }

  return intervals;
}

/**
 * Case 9 Adversarial Raw CSV with renamed headers, planted negative values,
 * and exact + conflicting duplicates for testing cleaning pipeline (PRD 14.3 Case 9).
 */
export const CASE_9_RAW_CSV = `CallDate,SlotStart,QueueName,OfferedCalls,HandleTimeSec
2026-11-09,08:00,q_inbound_voice,14,240
2026-11-09,08:30,q_inbound_voice,21,240
2026-11-09,08:30,q_inbound_voice,21,240
2026-11-09,09:00,q_inbound_voice,-5,240
2026-11-09,09:30,q_inbound_voice,45,-30
2026-11-09,10:00,q_inbound_voice,52,0
2026-11-09,10:30,q_inbound_voice,48,240
2026-11-09,10:30,q_inbound_voice,50,260
2026-11-09,11:00,q_inbound_voice,42,240
2026-11-09,11:30,q_inbound_voice,38,240
2026-11-09,12:00,q_inbound_voice,32,240
2026-11-09,12:30,q_inbound_voice,28,240
2026-11-09,13:00,q_inbound_voice,42,240
2026-11-09,13:30,q_inbound_voice,49,240
2026-11-09,14:00,q_inbound_voice,45,240
2026-11-09,14:30,q_inbound_voice,39,240
2026-11-09,15:00,q_inbound_voice,32,240
2026-11-09,15:30,q_inbound_voice,28,240
2026-11-09,16:00,q_inbound_voice,24,240
2026-11-09,16:30,q_inbound_voice,21,240
2026-11-09,17:00,q_inbound_voice,18,240
2026-11-09,17:30,q_inbound_voice,14,240
2026-11-09,18:00,q_inbound_voice,11,240
2026-11-09,18:30,q_inbound_voice,10,240
2026-11-09,19:00,q_inbound_voice,8,240
2026-11-09,19:30,q_inbound_voice,7,240`;
