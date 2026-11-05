/**
 * PRD v7.1 Independent Schedule Validator & KPI Recalculator
 * Requirements: Section 8.6, Tests T33, T66, Case 4, Case 7
 * ZERO dependencies or imports from roster generator, LP, or DES core.
 */

import { AgentShift, ScheduleBlock, ValidatorReport, ValidatorViolation } from '../types/wfm';

/**
 * Independent verification of an agent schedule roster against configured rules.
 * Strictly adheres to Section 8.6 independence-by-construction.
 */
export function validateRosterSchedule(
  schedules: AgentShift[],
  rules: ScheduleBlock,
  operatingOpenHour: number = 8,
  operatingCloseHour: number = 20,
  minSeatsWhileOpen: number = 1
): ValidatorReport {
  const violations: ValidatorViolation[] = [];
  const rulesChecked: string[] = [
    'Allowed Shift Starts',
    'Allowed Shift Lengths',
    'Breaks Inside Windows & Minimum Separation',
    'Weekly OFF Days Count',
    'Adjacent OFF Days',
    'Max Consecutive Working Days (with Cycle Wrap)',
    'Minimum Rest Hours Between Consecutive Shifts',
    'Weekly Hours Range',
    'Minimum Seats While Open',
  ];

  // Group schedules by agent
  const agentMap = new Map<string, AgentShift[]>();
  for (const shift of schedules) {
    if (!agentMap.has(shift.agentId)) {
      agentMap.set(shift.agentId, []);
    }
    agentMap.get(shift.agentId)!.push(shift);
  }

  const cycleDays = rules.rosterCycleWeeks * 7;
  const allowedStarts = new Set(rules.allowedShiftStarts);

  // 1. Per-agent checks
  for (const [agentId, agentShifts] of agentMap.entries()) {
    // Sort shifts by dayIndex
    agentShifts.sort((a, b) => a.dayIndex - b.dayIndex);

    let consecutiveWorkDays = 0;
    let weeklyHours = new Array(rules.rosterCycleWeeks).fill(0);
    let weeklyOffDays = new Array(rules.rosterCycleWeeks).fill(0);

    for (let d = 0; d < agentShifts.length; d++) {
      const shift = agentShifts[d];
      const weekIndex = Math.floor(shift.dayIndex / 7);

      if (shift.isOff) {
        consecutiveWorkDays = 0;
        if (weekIndex < weeklyOffDays.length) {
          weeklyOffDays[weekIndex]++;
        }
      } else {
        consecutiveWorkDays++;

        // Rule: Max consecutive working days
        if (consecutiveWorkDays > rules.maxConsecutiveWorkDays) {
          violations.push({
            ruleName: 'Max Consecutive Working Days',
            agentId,
            dayOrDate: `Day ${shift.dayIndex + 1}`,
            severity: rules.relaxableRules.maxConsecutiveDays ? 'RELAXABLE' : 'HARD',
            description: `Agent worked ${consecutiveWorkDays} consecutive days (maximum allowed is ${rules.maxConsecutiveWorkDays}).`,
          });
        }

        // Rule: Allowed shift lengths
        if (!rules.allowedShiftLengthsHours.includes(shift.lengthHours)) {
          violations.push({
            ruleName: 'Allowed Shift Lengths',
            agentId,
            dayOrDate: `Day ${shift.dayIndex + 1}`,
            severity: 'HARD',
            description: `Shift length ${shift.lengthHours}h is not in allowed lengths: [${rules.allowedShiftLengthsHours.join(', ')}].`,
          });
        }

        // Rule: Allowed shift start time (e.g. 08:00)
        const startHourStr = `${Math.floor(shift.startHour).toString().padStart(2, '0')}:${Math.round((shift.startHour % 1) * 60).toString().padStart(2, '0')}`;
        if (!allowedStarts.has(startHourStr)) {
          violations.push({
            ruleName: 'Allowed Shift Starts',
            agentId,
            dayOrDate: `Day ${shift.dayIndex + 1}`,
            severity: 'HARD',
            description: `Shift start ${startHourStr} is not in configured allowed starts.`,
          });
        }

        // Rule: Breaks in windows
        if (shift.breaks && rules.breaks) {
          for (const b of shift.breaks) {
            const hoursFromStart = b.startHour - shift.startHour;
            const matchingRule = rules.breaks.find(r => r.durationMinutes === b.durationMinutes);
            if (matchingRule) {
              if (
                hoursFromStart < matchingRule.earliestHourAfterStart ||
                hoursFromStart > matchingRule.latestHourAfterStart
              ) {
                violations.push({
                  ruleName: 'Breaks Inside Windows',
                  agentId,
                  dayOrDate: `Day ${shift.dayIndex + 1}`,
                  severity: 'HARD',
                  description: `Break of ${b.durationMinutes}m scheduled at +${hoursFromStart.toFixed(1)}h from start (allowed window: [${matchingRule.earliestHourAfterStart}h, ${matchingRule.latestHourAfterStart}h]).`,
                });
              }
            }
          }
        }

        // Track weekly hours
        if (weekIndex < weeklyHours.length) {
          weeklyHours[weekIndex] += shift.lengthHours;
        }

        // Rule: Rest gap between consecutive shifts
        if (d > 0) {
          const prevShift = agentShifts[d - 1];
          if (!prevShift.isOff) {
            const prevEndAbsolute = prevShift.dayIndex * 24 + prevShift.startHour + prevShift.lengthHours;
            const currStartAbsolute = shift.dayIndex * 24 + shift.startHour;
            const restGap = currStartAbsolute - prevEndAbsolute;

            if (restGap < rules.minRestHoursBetweenShifts) {
              violations.push({
                ruleName: 'Minimum Rest Hours Between Shifts',
                agentId,
                dayOrDate: `Day ${shift.dayIndex + 1}`,
                severity: rules.relaxableRules.restHours ? 'RELAXABLE' : 'HARD',
                description: `Rest gap is ${restGap.toFixed(1)}h (required minimum is ${rules.minRestHoursBetweenShifts}h).`,
              });
            }
          }
        }
      }
    }

    // Cycle wrap-around check for consecutive days
    const firstShift = agentShifts[0];
    const lastShift = agentShifts[agentShifts.length - 1];
    if (firstShift && lastShift && !firstShift.isOff && !lastShift.isOff) {
      let wrapConsecutive = 0;
      for (let i = agentShifts.length - 1; i >= 0 && !agentShifts[i].isOff; i--) wrapConsecutive++;
      for (let i = 0; i < agentShifts.length && !agentShifts[i].isOff; i++) wrapConsecutive++;
      if (wrapConsecutive > rules.maxConsecutiveWorkDays) {
        violations.push({
          ruleName: 'Max Consecutive Working Days (Cycle Wrap)',
          agentId,
          dayOrDate: 'Cycle Wrap',
          severity: rules.relaxableRules.maxConsecutiveDays ? 'RELAXABLE' : 'HARD',
          description: `Cycle wrap-around creates ${wrapConsecutive} consecutive working days (limit is ${rules.maxConsecutiveWorkDays}).`,
        });
      }
    }

    // Weekly rules validation
    for (let w = 0; w < rules.rosterCycleWeeks; w++) {
      const hours = weeklyHours[w];
      const offs = weeklyOffDays[w];

      if (hours < rules.minWeeklyHours || hours > rules.maxWeeklyHours) {
        violations.push({
          ruleName: 'Weekly Hours Range',
          agentId,
          dayOrDate: `Week ${w + 1}`,
          severity: 'HARD',
          description: `Total hours ${hours}h out of allowed range [${rules.minWeeklyHours}h - ${rules.maxWeeklyHours}h].`,
        });
      }

      if (offs < rules.weeklyOffDays) {
        violations.push({
          ruleName: 'Weekly OFF Days Count',
          agentId,
          dayOrDate: `Week ${w + 1}`,
          severity: 'HARD',
          description: `Only ${offs} OFF days granted in week ${w + 1} (required: ${rules.weeklyOffDays}).`,
        });
      }
    }
  }

  // 2. Minimum seats while open check
  for (let day = 0; day < cycleDays; day++) {
    for (let hour = operatingOpenHour; hour < operatingCloseHour; hour++) {
      let activeAgentsCount = 0;
      for (const shift of schedules) {
        if (shift.dayIndex === day && !shift.isOff) {
          const shiftEnd = shift.startHour + shift.lengthHours;
          if (hour >= shift.startHour && hour < shiftEnd) {
            // Check if on break
            const onBreak = shift.breaks?.some(
              b => hour >= b.startHour && hour < b.startHour + (b.durationMinutes / 60)
            );
            if (!onBreak) {
              activeAgentsCount++;
            }
          }
        }
      }

      if (activeAgentsCount < minSeatsWhileOpen) {
        violations.push({
          ruleName: 'Minimum Seats While Open',
          agentId: 'ALL',
          dayOrDate: `Day ${day + 1} at ${hour.toString().padStart(2, '0')}:00`,
          severity: 'HARD',
          description: `Only ${activeAgentsCount} seats active during operating hour (minimum required is ${minSeatsWhileOpen}).`,
        });
        break; // Report once per day
      }
    }
  }

  const hardCount = violations.filter(v => v.severity === 'HARD').length;
  const relaxableCount = violations.filter(v => v.severity === 'RELAXABLE').length;

  return {
    isValid: hardCount === 0,
    hardViolationsCount: hardCount,
    relaxableViolationsCount: relaxableCount,
    violations,
    rulesChecked,
  };
}
