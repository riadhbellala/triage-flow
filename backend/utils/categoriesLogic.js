const CATEGORIES = [
    { id: 'cardio', name: 'Cardio-Circulatoire', motifs: [
        { name: 'Arrêt cardiorespiratoire', median: '1', signs: [] },
        { name: 'Hypotension artérielle', median: '2', signs: ['PAS ≤ 70 mmHg', 'PAS ≤ 90 mmHg', 'PAS ≤ 100 et FC > 100', 'PAS 90-100 et FC ≤ 100'] },
        { name: 'Membre ischémie / Douleur', median: '2', signs: ['Durée ≤ 24h', 'Cyanose/Déficit moteur', 'Durée ≥ 24h'] },
        { name: 'Douleur thoracique / SCA', median: '3B', signs: ['ECG SCA typique', 'ECG anormal non typique', 'Douleur intense/persistante', 'Comorbidité coronaire', 'Douleur atypique'] },
        { name: 'Malaise', median: '3B', signs: ['Aucune anomalie notable'] },
        { name: 'Tachycardie / Tachyarythmie', median: '3B', signs: ['FC ≥ 180', 'FC ≥ 130', 'FC ≥ 110', 'Épisode résolutif'] },
        { name: 'Bradycardie / Bradyarythmie', median: '3B', signs: ['FC ≤ 40', 'Mauvaise tolérance', 'Sans mauvaise tolérance'] },
        { name: 'Dyspnée / Insuffisance cardiaque', median: '3B', signs: ['Détresse respiratoire', 'FR ≥ 40', 'SpO2 < 86%', 'Dyspnée parole/tirage', 'FR 30-40', 'SpO2 86-90%'] },
        { name: 'Dysfonction stimulateur / DAI', median: '3B', signs: ['Choc électrique ressenti'] },
        { name: 'Oedème MI', median: '3B', signs: ['FR < 30 et SpO2 > 90%', 'OMI chronique'] },
        { name: 'Palpitations', median: '4', signs: ['FC ≥ 180', 'FC ≥ 130', 'FC ≥ 110', 'Malaise'] },
        { name: 'Hypertension artérielle', median: '4', signs: ['PAS ≥ 220', 'PAS ≥ 180 et signes fonctionnels', 'PAS ≥ 180 sans signes fonctionnels'] },
        { name: 'Phlébite', median: '4', signs: ['Signes locaux francs', 'Siège proximal', 'Signes modérés', 'Siège distal'] }
    ]},
    { id: 'infectio', name: 'Infectiologie', motifs: [
        { name: 'AES / Liquide biologique', median: '4', signs: ['Sujet contact VIH avéré et exposition ≥ 48h'] },
        { name: 'Fièvre', median: '5', signs: ['Temp ≥ 40°C ou ≤ 35.2°C', 'Confusion/Céphalée/Purpura', 'Mauvaise tolérance', 'Hypotension', 'Shock Index ≥ 1'] },
        { name: 'Exposition maladie contagieuse', median: '5', signs: ['Risque vital de contage', 'Sans risque vital'] }
    ]},
    { id: 'abd', name: 'Abdominal', motifs: [
        { name: 'Hématémèse', median: '2', signs: ['Abondante', 'Striée de sang'] },
        { name: 'Maelena / Rectorragies', median: '2', signs: ['Abondante', 'Selles souillées'] },
        { name: 'Douleur abdominale', median: '3B', signs: ['Douleur sévère/Mauvaise tolérance', 'Régressive/Indolore'] },
        { name: 'Ictère', median: '3B', signs: [] },
        { name: 'Hernie / Masse', median: '4', signs: ['Douleur sévère', 'Symptômes occlusion'] },
        { name: 'Corps étranger oesophage', median: '4', signs: ['Aphagie/Hypersialorrhée', 'Signes fonctionnels associés', 'Tranchant/Pointu'] },
        { name: 'Constipation', median: '5', signs: ['Occlusion', 'Douleur abdominale'] },
        { name: 'Vomissements', median: '5', signs: ['Occlusion', 'Enfant ≤ 2 ans', 'Abondants/Douleur'] },
        { name: 'Diarrhée', median: '5', signs: ['Enfant ≤ 2 ans', 'Abondante/Mauvaise tolérance'] },
        { name: 'Douleur anale', median: '5', signs: ['Suspicion abcès/fissure'] },
        { name: 'Hoquet', median: '5', signs: ['Hoquet incessant ≥ 12h'] }
    ]},
    { id: 'genito', name: 'Génito-Urinaire', motifs: [
        { name: 'Douleur fosse lombaire / flanc', median: '3B', signs: ['Douleur intense', 'Régressive/Indolore'] },
        { name: "Rétention d'urine / anurie", median: '3B', signs: ['Douleur intense / Agitation'] },
        { name: 'Douleur bourse / Torsion', median: '3B', signs: ['Douleur intense', 'Suspicion torsion'] },
        { name: 'Dysfonction sonde / JJ', median: '3B', signs: ['Douleur intense', 'Fièvre', 'Mauvaise tolérance'] },
        { name: 'Hématurie', median: '3B', signs: ['Saignement abondant actif'] },
        { name: 'Dysurie / Brûlure', median: '5', signs: ['Fièvre', 'Enfant'] },
        { name: 'Écoulement génital', median: '5', signs: ['Fièvre'] }
    ]},
    { id: 'gyneco', name: 'Gynéco-Obstétrique', motifs: [
        { name: 'Accouchement imminent', median: '1', signs: [] },
        { name: 'Grossesse T1-T2', median: '3A', signs: ['Métrorragies', 'Douleur'] },
        { name: 'Grossesse T3', median: '3A', signs: ['Métrorragies', 'Douleur', 'HTA', 'Perte liquide amniotique'] },
        { name: 'Méno-métrorragie', median: '3B', signs: ['Grossesse connue/suspectée', 'Saignement abondant'] },
        { name: 'Post-partum', median: '4', signs: ['Allaitement et fièvre'] },
        { name: 'Anomalie du sein', median: '5', signs: ['Mastite ou abcès'] },
        { name: 'Anomalie vulvo-vaginale', median: '5', signs: [] }
    ]},
    { id: 'intox', name: 'Intoxication', motifs: [
        { name: 'Intoxication médicamenteuse', median: '3B', signs: ['Mauvaise tolérance', 'Intention suicidaire', 'Toxiques cardiotropes', 'Enfant', 'Vu tard ≥ 24h'] },
        { name: 'Demande sevrage / Toxico', median: '4', signs: ['Agitation/Violence/Manque', 'Enfant', 'Ordonnance substitution'] },
        { name: "Ivresse / Ebrieux", median: '4', signs: ["GCS ≤ 8", "GCS 9-13", "Agitation/Violence", "Enfant", "Demande forces de l'ordre"] }
    ]},
    { id: 'neuro', name: 'Neurologie', motifs: [
        { name: 'Altération conscience / Coma', median: '2', signs: ['GCS ≤ 8', 'GCS 9-13'] },
        { name: 'AVC / Déficit', median: '2', signs: ['Délai ≤ 4h30', 'Délai ≥ 24h'] },
        { name: 'Convulsions', median: '3B', signs: ['Crises multiples/en cours', 'Confusion/TC/Fièvre', 'Récupération complète'] },
        { name: 'Confusion', median: '3B', signs: ['Fièvre'] },
        { name: 'Céphalée', median: '3B', signs: ['Inhabituelle/Brutale/Intense', 'Fièvre'] },
        { name: 'Vertiges / Équilibre', median: '3B', signs: ['Signes neuro associés', 'Anciens et stables'] }
    ]},
    { id: 'ophtalmo', name: 'Ophtalmologie', motifs: [
        { name: 'Corps étranger / Brûlure', median: '3B', signs: ['Douleur intense', 'Brûlure chimique'] },
        { name: 'Trouble visuel / Cécité', median: '3B', signs: ['Début brutal'] },
        { name: 'Oeil rouge', median: '5', signs: [] }
    ]},
    { id: 'orl', name: 'ORL / Stomato', motifs: [
        { name: 'Épistaxis', median: '3B', signs: ['Saignement abondant actif', 'Abondant résolutif', 'Peu abondant résolutif'] },
        { name: 'Trouble audition', median: '4', signs: ['Surdité brutale'] },
        { name: 'Tuméfaction ORL', median: '4', signs: ['Fièvre', 'Signes locaux importants'] },
        { name: 'Corps étranger ORL', median: '4', signs: ['Dyspnée inspiratoire'] },
        { name: 'Douleur gorge / Angine', median: '5', signs: ['Mauvaise tolérance', 'Aphagie'] },
        { name: 'Sinusite', median: '5', signs: ['Sinusite fébrile'] },
        { name: 'Dent / Gencive', median: '5', signs: ['Signes locaux importants', 'Douleur résistante'] }
    ]},
    { id: 'peau', name: 'Peau', motifs: [
        { name: 'Hématome spontané', median: '3B', signs: [] },
        { name: 'Abcès / Infection locale', median: '4', signs: ['Fièvre', 'Abcès volumineux'] },
        { name: 'Érythème / Éruption', median: '5', signs: ['Anaphylaxie', 'Fièvre', 'Mauvaise tolérance', 'Étendu'] },
        { name: 'Morsure / Piqûre', median: '5', signs: ['Serpent / Scorpion', 'Fièvre', 'Signes locaux importants', 'Étendu'] },
        { name: 'Corps étranger sous peau', median: '5', signs: ['Multiples complexes'] }
    ]},
    { id: 'pedia', name: 'Pédiatrie ≤ 2 ans', motifs: [
        { name: 'Dyspnée sifflement', median: '2', signs: ['Sifflement sans dyspnée'] },
        { name: 'Fièvre ≤ 3 mois', median: '2', signs: [] },
        { name: 'Convulsion hyperthermique', median: '3B', signs: ['Récidive', 'Durée ≥ 10 min', 'Hypotonie', 'Récupération complète'] },
        { name: 'Diarrhée / Vomissements', median: '3B', signs: ['Perte poids ≥ 10%', 'Hypotonie', 'Âge ≤ 6 mois'] },
        { name: 'Troubles alimentaires', median: '4', signs: ['Perte poids ≥ 10%', 'Hypotonie', 'Perte poids ≤ 10%'] },
        { name: 'Bradycardie pédia', median: '5', signs: ['FC ≤ 80 (avant 1an)', 'FC ≤ 60 (après 1an)'] },
        { name: 'Ictère néonatal', median: '5', signs: ['Perte poids ≤ 10%', 'Selles décolorées'] },
        { name: 'Tachycardie pédia', median: '5', signs: ['FC ≥ 180 (avant 1an)', 'FC ≥ 160 (après 1an)'] },
        { name: 'Hypotension pédia', median: '5', signs: ['PAS ≤ 70 + (âge x 2)'] },
        { name: 'Pleurs incoercibles', median: '4', signs: ['Pleurs dans le box'] }
    ]},
    { id: 'psy', name: 'Psychiatrie', motifs: [
        { name: 'Suicidaire', median: '2', signs: [] },
        { name: 'Troubles comportement', median: '3B', signs: ['Agitation', 'Violence', 'Délire', 'Hallucinations', 'Enfant'] },
        { name: 'Anxiété / Dépression', median: '4', signs: ['Anxiété majeure', 'Attaque panique', 'Enfant'] }
    ]},
    { id: 'resp', name: 'Respiratoire', motifs: [
        { name: 'Dyspnée / IR', median: '3B', signs: ['Détresse respiratoire', 'FR ≥ 40', 'SpO2 ≤ 86%', 'Dyspnée parole/tirage', 'FR 30-40', 'SpO2 86-90%'] },
        { name: 'Asthme / BPCO', median: '3B', signs: ['Détresse respiratoire', 'DEP ≤ 200', 'Dyspnée parole/tirage', 'DEP ≥ 300'] },
        { name: 'Hémoptysie', median: '3B', signs: ['Détresse respiratoire', 'Répétée', 'Abondante'] },
        { name: 'Douleur thoracique / Embolie', median: '3B', signs: ['Détresse respiratoire', 'Dyspnée parole/tirage'] },
        { name: 'Corps étranger voies aér.', median: '3B', signs: ['Détresse respiratoire', 'Dyspnée parole/tirage', 'Enfant', 'Pas de dyspnée'] },
        { name: 'Toux / Bronchite', median: '5', signs: ['Fièvre', 'Signes respiratoires associés'] }
    ]},
    { id: 'rhumato', name: 'Rhumatologie', motifs: [
        { name: 'Douleur articulaire', median: '4', signs: ['Fièvre', 'Signes locaux importants'] },
        { name: 'Douleur rachidienne', median: '5', signs: ['Déficit sensitif/moteur', 'Fièvre', 'Paresthésies'] },
        { name: 'Douleur membre / Sciatique', median: '5', signs: ['Fièvre', 'Impotence membre'] }
    ]},
    { id: 'trauma', name: 'Traumatologie', motifs: [
        { name: 'Amputation', median: '1', signs: [] },
        { name: 'Trauma Abdo/Thorax/Cervical', median: '2', signs: ['Pénétrant', 'Haute vélocité', 'Faible vélocité + mauvaise tolérance'] },
        { name: 'Brûlure', median: '3B', signs: ['Étendue', 'Main / Visage', 'Âge ≤ 24 mois', 'Consultation tardive'] },
        { name: 'Plaie', median: '4', signs: ['Délabrante', 'Saignement actif', 'Large / Main', 'Superficielle', 'Excoriation'] },
        { name: 'Trauma membre / Epaule', median: '4', signs: ['Haute vélocité', 'Grande déformation', 'Ischémie', 'Impotence totale'] },
        { name: 'Électrisation', median: '4', signs: ['PC', 'Brûlure', 'Foudre', 'Haute tension'] },
        { name: 'Trauma Crânien', median: '5', signs: ['GCS ≤ 8', 'GCS 9-13', 'Anticoagulants (AOD/AVK)', 'Déficit/Convulsion', 'PC avant/après', 'Plaie / Hématome'] }
    ]},
    { id: 'divers', name: 'Divers', motifs: [
        { name: 'Pathologie rare/grave', median: '2', signs: ['Avis référent'] },
        { name: 'Hypothermie', median: '2', signs: ['Temp ≤ 32°C'] },
        { name: 'Hyperglycémie', median: '3B', signs: ['Cétose élevée', 'Trouble conscience', 'Glycémie ≥ 20'] },
        { name: 'Hypoglycémie', median: '3B', signs: ['GCS ≤ 8', 'Mauvaise tolérance'] },
        { name: 'AEG / Asthénie', median: '3B', signs: ['Ni comorbidités ni signes objectifs'] },
        { name: 'Coup de chaleur', median: '3B', signs: ['GCS ≤ 8', 'Temp ≥ 40°C'] },
        { name: 'Allergie', median: '4', signs: ['Dyspnée', 'Obstruction', 'Mauvaise tolérance'] },
        { name: "Administrative / Certificat", median: '5', signs: ["Demande forces de l'ordre"] },
        { name: 'Hébergement social', median: '5', signs: [] }
    ]}
];

/**
 * Priority rescoring — determines queue position.
 * Higher score = more urgent.
 */
const calculateScore = (patient) => {
    let score = 0;
    const triageScores = { '1': 100, '2': 80, '3A': 60, '3B': 50, '4': 30, '5': 10 };
    score += triageScores[patient.triageLevel] || 30;

    const waitMinutes = patient.waitMinutes || 0;
    score += waitMinutes * 1.5;

    const v = patient.vitals || {};
    if (v.fc   && (v.fc  > 120 || v.fc  < 50))   score += 25;
    if (v.pas  && (v.pas > 180 || v.pas < 80))    score += 25;
    if (v.spo2 && v.spo2 < 92)                    score += 35;
    if (v.temp && (v.temp > 39.5 || v.temp < 35)) score += 20;
    if (patient.redFlags && patient.redFlags.length > 0) score += patient.redFlags.length * 15;

    return Math.round(score);
};

const detectDegradation = (patient) => {
    const score = calculateScore(patient);
    const triageBaseScores = { '1': 100, '2': 80, '3A': 60, '3B': 50, '4': 30, '5': 10 };
    const baseScore = triageBaseScores[patient.triageLevel] || 30;
    return score > baseScore + 40;
};

module.exports = { CATEGORIES, calculateScore, detectDegradation };
