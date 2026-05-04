const TriageDatabase = {
    cardioCirculatoire: {
        title: "Cardio-Circulatoire",
        sections: [
            { label: "Arrêt cardiorespiratoire", motifs: { "Arrêt cardiorespiratoire": "1" } },
            { label: "Hypotension artérielle", motifs: { "PAS ≤ 70 mmHg": "1", "PAS ≤ 90 mmHg / FC > 100": "2", "PAS 90-100 / FC ≤ 100": "3B" } },
            { label: "Douleur Thoracique / SCA", motifs: { "ECG anormal typique": "1", "ECG anormal non typique": "2", "ECG normal + comorbidité": "3A", "ECG normal + douleur coronaire": "3B", "ECG normal + atypique": "4" } },
            { label: "Tachycardie", motifs: { "FC ≥ 180": "1", "FC ≥ 130": "2", "FC ≥ 110": "3B", "Episode résolutif": "4" } },
            { label: "Bradycardie", motifs: { "FC ≤ 40": "1", "FC 40-50 mauvaise tolérance": "2", "FC 40-50 bonne tolérance": "3B" } },
            { label: "Hypertension", motifs: { "PAS ≥ 220 ou ≥ 180 + signes": "2", "PAS ≥ 180 sans signes": "3B", "PAS > 180": "4" } }
        ]
    },
    infectiologie: {
        title: "Infectiologie",
        sections: [
            { label: "Fièvre", motifs: { "T° ≥ 40°C ou ≤ 35,2°C / Purpura": "2", "Mauvaise tolérance": "3B", "Fièvre simple": "5" } },
            { label: "AES / Liquide Bio", motifs: { "Contact VIH + expo ≥ 48h": "2", "Exposition simple": "4" } }
        ]
    },
    abdominal: {
        title: "Abdominal",
        sections: [
            { label: "Hémorragie Digestive", motifs: { "Hématémèse abondante": "2", "Melaena": "2", "Striée de sang": "3B" } },
            { label: "Douleur Abdominale", motifs: { "Sévère / Mauvaise tolérance": "2", "Douleur modérée": "3B", "Régressive": "5" } },
            { label: "Transit", motifs: { "Occlusion": "2", "Vomissements/Diarrhée abondante": "3B", "Simple": "5" } }
        ]
    },
    neurologie: {
        title: "Neurologie",
        sections: [
            { label: "Conscience", motifs: { "GCS ≤ 8": "1", "GCS 9-13": "2" } },
            { label: "Déficit / AVC", motifs: { "Délai ≤ 4h30": "1", "Délai 4h30 - 24h": "2", "Délai ≥ 24h": "3B" } },
            { label: "Convulsions", motifs: { "Crise en cours": "2", "Post-critique": "3B" } },
            { label: "Céphalée", motifs: { "Brutale / Inhabituelle": "2", "Habituelle / Migraine": "3B" } }
        ]
    },
    traumatologie: {
        title: "Traumatologie",
        sections: [
            { label: "Trauma Grave", motifs: { "Amputation": "1", "Pénétrant Thorax/Abdo": "1", "Haute vélocité": "2" } },
            { label: "Plaie", motifs: { "Hémorragie active": "2", "Plaie main / complexe": "3B", "Superficielle": "4" } },
            { label: "Trauma Crânien", motifs: { "GCS ≤ 8": "1", "Perte de connaissance": "3B", "Simple": "5" } }
        ]
    },
    genitoUrinaire: {
        title: "Génito-Urinaire",
        sections: [
            { label: "Douleur / Rétention", motifs: { "Rétention aiguë douloureuse": "2", "Colique néphrétique intense": "2", "Modérée": "3B" } },
            { label: "Hématurie", motifs: { "Abondante avec caillots": "2", "Simple": "3B" } }
        ]
    },
    gynecoObstetrique: {
        title: "Gynéco-Obstétrique",
        sections: [
            { label: "Accouchement", motifs: { "Imminent": "1", "Travail en cours": "2" } },
            { label: "Grossesse", motifs: { "Métrorragies T3": "2", "Métrorragies T1/T2": "3A" } }
        ]
    },
    intoxication: {
        title: "Intoxication",
        sections: [
            { label: "Overdose / Ingestion", motifs: { "Troubles conscience": "2", "Enfant": "3A", "Volontaire stable": "3B" } }
        ]
    },
    psychiatrie: {
        title: "Psychiatrie",
        sections: [
            { label: "Comportement", motifs: { "Agitation sévère / Danger": "2", "Tentative de suicide": "2", "Dépression / Anxiété": "3B" } }
        ]
    },
    respiratoire: {
        title: "Respiratoire",
        sections: [
            { label: "Dyspnée", motifs: { "Détresse / FR ≥ 40": "1", "FR 30-40": "2", "Dyspnée modérée": "3B" } },
            { label: "Hémoptysie", motifs: { "Abondante": "1", "Faible abondance": "3B" } }
        ]
    },
    orlStomato: {
        title: "ORL / Stomato",
        sections: [
            { label: "Hémorragie / Douleur", motifs: { "Epistaxis actif abondant": "2", "Corps étranger VR": "2", "Douleur dentaire": "5" } }
        ]
    },
    ophtalmologie: {
        title: "Ophtalmologie",
        sections: [
            { label: "Trauma / Vision", motifs: { "Brûlure chimique": "2", "Perte de vision brutale": "2", "Oeil rouge indolore": "5" } }
        ]
    },
    peau: {
        title: "Peau",
        sections: [
            { label: "Eruptions", motifs: { "Anaphylaxie / Oedème Quincke": "2", "Purpura": "2", "Urticaire simple": "5" } }
        ]
    },
    rhumatologie: {
        title: "Rhumatologie",
        sections: [
            { label: "Rachis / Membres", motifs: { "Déficit moteur aigu": "2", "Douleur inflammatoire": "3B", "Lumbago": "5" } }
        ]
    },
    divers: {
        title: "Divers",
        sections: [
            { label: "Glycémie / Temp", motifs: { "Hypoglycémie coma": "1", "Hyperglycémie > 20 + cétose": "2", "Hypothermie ≤ 32°C": "1" } }
        ]
    }
};

const getPediatricThresholds = (age) => ({
  minPas: 70 + (age * 2),
  maxFr: age < 1 ? 60 : (age < 5 ? 40 : 30)
});

const getVitalLevel = (vitals, age) => {
  const v = {
    fc:   parseInt(vitals.fc)     || 0,
    pas:  parseInt(vitals.pas)    || 0,
    spo2: parseInt(vitals.spo2)   || 0,
    fr:   parseInt(vitals.fr)     || 0,
    temp: parseFloat(vitals.temp) || 0,
    glyc: parseFloat(vitals.glyc) || 0
  };

  const patientAge = parseInt(age) || 0;
  const pedia = getPediatricThresholds(patientAge);

  const isChild = patientAge > 0 && patientAge <= 10;
  const criticalPAS = isChild
    ? (v.pas > 0 && v.pas <= pedia.minPas - 10)
    : (v.pas > 0 && v.pas <= 70);

  // TRI 1 vitals — any single one is enough
  if (
    criticalPAS                              ||
    (v.pas > 0 && v.pas >= 220)             ||
    (v.fc  > 0 && (v.fc >= 180 || v.fc <= 40))  ||
    (v.spo2 > 0 && v.spo2 < 86)             ||
    (v.fr  > 0 && v.fr >= 40)               ||
    (v.temp > 0 && v.temp <= 32)            ||
    (v.glyc > 0 && v.glyc <= 2.5)
  ) return '1';

  const seriousPAS = isChild
    ? (v.pas > 0 && v.pas <= pedia.minPas)
    : (v.pas > 0 && v.pas <= 90);

  // TRI 2 vitals — any single one is enough
  if (
    seriousPAS                               ||
    (v.fc  > 0 && (v.fc >= 130 || v.fc <= 50))  ||
    (v.spo2 > 0 && v.spo2 >= 86 && v.spo2 <= 90)            ||
    (v.fr  > 0 && v.fr >= 30)               ||
    (v.temp > 0 && (v.temp >= 40 || v.temp <= 35.2)) ||
    (v.glyc > 0 && v.glyc >= 20)
  ) return '2';

  return null;
};

const SIGN_LEVEL_MAP = {
  // Tri 1 signs
  'ECG SCA typique':          '1',
  'ECG anormal typique':      '1',
  'Arrêt cardiorespiratoire': '1',
  'Détresse respiratoire':    '1',
  'GCS ≤ 8':                  '1',
  'Délai ≤ 4h30':             '1',
  'Amputation':               '1',
  'Pénétrant':                '1',
  'Imminent':                 '1',
  'Hypoglycémie coma':        '1',
  'SpO2 ≤ 86%':               '1',
  'SpO2 < 86%':               '1',
  'FR ≥ 40':                  '1',
  'coma':                     '1',

  // Tri 2 signs
  'ECG anormal non typique':           '2',
  'PAS ≤ 90 mmHg':                     '2',
  'PAS ≤ 70 mmHg':                     '1',
  'FC ≥ 180':                          '1',
  'FC ≥ 130':                          '2',
  'FC ≤ 40':                           '1',
  'Mauvaise tolérance':                '2',
  'Douleur sévère/Mauvaise tolérance': '2',
  'Douleur intense':                   '2',
  'Saignement abondant actif':         '2',
  'Abondante':                         '2',
  'Hématémèse abondante':              '2',
  'GCS 9-13':                          '2',
  'Délai ≥ 24h':                       '3B',
  'Crises multiples/en cours':         '2',
  'Métrorragies T3':                   '2',
  'Brûlure chimique':                  '2',
  'Perte de vision brutale':           '2',
  'Début brutal':                      '2',
  'Sifflement sans dyspnée':           '2',
  'Fièvre ≤ 3 mois':                   '2',
  'Haute vélocité':                    '2',
  'Suicidaire':                        '2',
  'Agitation sévère':                  '2',
  'Purpura':                           '2',
  'Temp ≥ 40°C ou ≤ 35.2°C':          '2',
  'Anticoagulants (AOD/AVK)':          '2',
  'SpO2 86-90%':                       '2',
  'FR 30-40':                          '2',
};

const getSignLevel = (signs, currentMotif) => {
  let worstLevel = null;

  for (const sign of signs) {
    // Check direct map first
    for (const [key, level] of Object.entries(SIGN_LEVEL_MAP)) {
      if (sign.toLowerCase().includes(key.toLowerCase())) {
        if (!worstLevel || parseInt(level) < parseInt(worstLevel.replace(/[AB]/g, ''))) {
          worstLevel = level;
        }
      }
    }
  }

  // Special case: Trauma Crânien + Anticoagulants → Tri 2
  if (
    currentMotif?.name === 'Trauma Crânien' &&
    signs.includes('Anticoagulants (AOD/AVK)')
  ) {
    worstLevel = '2';
  }

  // Electrical injuries with loss of consciousness or burn need urgent review.
  if (
    currentMotif?.name === 'Électrisation' &&
    (signs.includes('PC') || signs.includes('Brûlure') || signs.includes('Foudre') || signs.includes('Haute tension'))
  ) {
    worstLevel = '2';
  }

  return worstLevel;
};

const calculateTriage = (vitals, signs, currentMotif, age) => {
  if (!currentMotif) return { tri: '5', esi: 5 };

  // 1. Check vitals first — completely independent
  const vitalLevel = getVitalLevel(vitals, age);
  if (vitalLevel === '1') return { tri: '1', esi: 1 };

  // 2. Check signs against mapping
  const signLevel = getSignLevel(signs, currentMotif);
  if (signLevel === '1') return { tri: '1', esi: 1 };

  // 3. If either vitals or signs say Tri 2 → return Tri 2
  if (vitalLevel === '2' || signLevel === '2') return { tri: '2', esi: 2 };

  // 4. Start from motif median
  let triLevel = parseInt(currentMotif.median.replace(/[AB]/g, ''));
  let subType  = currentMotif.median.match(/[AB]/)
    ? currentMotif.median.match(/[AB]/)[0]
    : '';

  // 5. If sign level is worse than median, use sign level
  if (signLevel) {
    const signNum = parseInt(signLevel.replace(/[AB]/g, ''));
    if (signNum < triLevel) {
      triLevel = signNum;
      subType  = signLevel.match(/[AB]/) ? signLevel.match(/[AB]/)[0] : '';
    }
  }

  // 6. Shock index check → upgrade to 3A
  const v = {
    fc:  parseInt(vitals.fc)  || 0,
    pas: parseInt(vitals.pas) || 0
  };
  if (triLevel > 2 && v.fc > 0 && v.pas > 0 && (v.fc / v.pas) >= 1) {
    triLevel = 3;
    subType  = 'A';
  }

  return {
    tri: triLevel + subType,
    esi: triLevel
  };
};

module.exports = { TriageDatabase, calculateTriage };