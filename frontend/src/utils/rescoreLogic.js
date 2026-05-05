/**
 * rescoreLogic.js — Dynamic patient priority scoring
 * TODO (backend): Move this to a server-side function and run it
 * on a cron job when real-time patient data is available.
 */

/**
 * Calculates a priority score for a patient.
 * Higher score = more urgent = appears first in queue.
 */
export const calculateScore = (patient) => {
  let score = 0;

  // Base score from triage level
  const triageScores = {
    '1': 100, '2': 80, '3A': 60, '3B': 50, '4': 30, '5': 10,
  };
  score += triageScores[patient.triageLevel] || 30;

  // Waiting time penalty — adds urgency the longer they wait
  const waitMinutes = patient.waitMinutes || 0;
  score += waitMinutes * 1.5;

  // Vitals deterioration bonus
  const v = patient.vitals || {};
  if (v.fc  && (v.fc  > 120 || v.fc  < 50))   score += 25;
  if (v.pas && (v.pas > 180 || v.pas < 80))    score += 25;
  if (v.spo2 && v.spo2 < 92)                   score += 35;
  if (v.temp && (v.temp > 39.5 || v.temp < 35)) score += 20;

  // Red flag signs
  if (patient.redFlags && patient.redFlags.length > 0) {
    score += patient.redFlags.length * 15;
  }

  return Math.round(score);
};

/**
 * Returns true if the patient's current score is 40+ points
 * above their base triage score — indicating clinical degradation.
 */
export const detectDegradation = (patient) => {
  const score = calculateScore(patient);
  const triageBaseScores = {
    '1': 100, '2': 80, '3A': 60, '3B': 50, '4': 30, '5': 10,
  };
  const baseScore = triageBaseScores[patient.triageLevel] || 30;
  return score > baseScore + 40;
};

export const buildRescorePayload = (patient) => ({
  patientId: patient.id,
  triageLevel: patient.triageLevel,
  waitMinutes: patient.waitMinutes || 0,
  vitals: patient.vitals || {},
  redFlags: patient.redFlags || [],
});

// The backend will eventually receive this payload at:
// POST /api/rescore
// and return { newLevel, degraded, score }
// For now the frontend calculateScore() handles everything locally.
