const getPediatricThresholds = (age) => ({
  minPas: 70 + (age * 2),
});

const getVitalLevel = (vitals, age) => {
  const v = {
    fc: parseInt(vitals.fc, 10) || 0,
    pas: parseInt(vitals.pas, 10) || 0,
    spo2: parseInt(vitals.spo2, 10) || 0,
    fr: parseInt(vitals.fr, 10) || 0,
    temp: parseFloat(vitals.temp) || 0,
    glyc: parseFloat(vitals.glyc) || 0,
  };

  const patientAge = parseInt(age, 10) || 0;
  const pedia = getPediatricThresholds(patientAge);
  const isChild = patientAge > 0 && patientAge <= 10;

  const criticalPAS = isChild
    ? (v.pas > 0 && v.pas <= pedia.minPas - 10)
    : (v.pas > 0 && v.pas <= 70);

  if (
    criticalPAS ||
    (v.pas > 0 && v.pas >= 220) ||
    (v.fc > 0 && (v.fc >= 180 || v.fc <= 40)) ||
    (v.spo2 > 0 && v.spo2 < 86) ||
    (v.fr > 0 && v.fr >= 40) ||
    (v.temp > 0 && v.temp <= 32) ||
    (v.glyc > 0 && v.glyc <= 2.5)
  ) return '1';

  const seriousPAS = isChild
    ? (v.pas > 0 && v.pas <= pedia.minPas)
    : (v.pas > 0 && v.pas <= 90);

  if (
    seriousPAS ||
    (v.fc > 0 && (v.fc >= 130 || v.fc <= 50)) ||
    (v.spo2 > 0 && v.spo2 >= 86 && v.spo2 <= 90) ||
    (v.fr > 0 && v.fr >= 30) ||
    (v.temp > 0 && (v.temp >= 40 || v.temp <= 35.2)) ||
    (v.glyc > 0 && v.glyc >= 20)
  ) return '2';

  return null;
};

const SIGN_LEVEL_MAP = {
  'ECG SCA typique': '1',
  'ECG anormal typique': '1',
  'Arrêt cardiorespiratoire': '1',
  'Détresse respiratoire': '1',
  'GCS ≤ 8': '1',
  'Délai ≤ 4h30': '1',
  'Amputation': '1',
  'Pénétrant': '1',
  'Imminent': '1',
  'Hypoglycémie coma': '1',
  'SpO2 ≤ 86%': '1',
  'SpO2 < 86%': '1',
  'FR ≥ 40': '1',
  coma: '1',
  'ECG anormal non typique': '2',
  'PAS ≤ 90 mmHg': '2',
  'PAS ≤ 70 mmHg': '1',
  'FC ≥ 180': '1',
  'FC ≥ 130': '2',
  'FC ≤ 40': '1',
  'Mauvaise tolérance': '2',
  'Douleur sévère/Mauvaise tolérance': '2',
  'Douleur intense': '2',
  'Saignement abondant actif': '2',
  Abondante: '2',
  'Hématémèse abondante': '2',
  'GCS 9-13': '2',
  'Crises multiples/en cours': '2',
  'Métrorragies T3': '2',
  'Brûlure chimique': '2',
  'Perte de vision brutale': '2',
  'Début brutal': '2',
  'Sifflement sans dyspnée': '2',
  'Fièvre ≤ 3 mois': '2',
  'Haute vélocité': '2',
  Suicidaire: '2',
  'Agitation sévère': '2',
  Purpura: '2',
  'Temp ≥ 40°C ou ≤ 35.2°C': '2',
  'Anticoagulants (AOD/AVK)': '2',
  'SpO2 86-90%': '2',
  'FR 30-40': '2',
};

const getSignLevel = (signs, currentMotif) => {
  let worstLevel = null;
  for (const sign of signs) {
    for (const [key, level] of Object.entries(SIGN_LEVEL_MAP)) {
      if (sign.toLowerCase().includes(key.toLowerCase())) {
        if (!worstLevel || parseInt(level, 10) < parseInt(worstLevel.replace(/[AB]/g, ''), 10)) {
          worstLevel = level;
        }
      }
    }
  }

  if (
    currentMotif?.name === 'Trauma Crânien' &&
    signs.includes('Anticoagulants (AOD/AVK)')
  ) {
    worstLevel = '2';
  }

  if (
    currentMotif?.name === 'Électrisation' &&
    (signs.includes('PC') || signs.includes('Brûlure') || signs.includes('Foudre') || signs.includes('Haute tension'))
  ) {
    worstLevel = '2';
  }

  return worstLevel;
};

export const calculateTriage = (vitals, signs, currentMotif, age) => {
  if (!currentMotif) return { tri: '5', esi: 5 };

  const vitalLevel = getVitalLevel(vitals, age);
  if (vitalLevel === '1') return { tri: '1', esi: 1 };

  const signLevel = getSignLevel(signs, currentMotif);
  if (signLevel === '1') return { tri: '1', esi: 1 };
  if (vitalLevel === '2' || signLevel === '2') return { tri: '2', esi: 2 };

  let triLevel = parseInt(currentMotif.median.replace(/[AB]/g, ''), 10);
  let subType = currentMotif.median.match(/[AB]/)?.[0] || '';

  if (signLevel) {
    const signNum = parseInt(signLevel.replace(/[AB]/g, ''), 10);
    if (signNum < triLevel) {
      triLevel = signNum;
      subType = signLevel.match(/[AB]/)?.[0] || '';
    }
  }

  const v = {
    fc: parseInt(vitals.fc, 10) || 0,
    pas: parseInt(vitals.pas, 10) || 0,
  };

  if (triLevel > 2 && v.fc > 0 && v.pas > 0 && (v.fc / v.pas) >= 1) {
    triLevel = 3;
    subType = 'A';
  }

  return {
    tri: `${triLevel}${subType}`,
    esi: triLevel,
  };
};
