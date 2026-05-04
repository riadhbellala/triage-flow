import { useState } from 'react';
import useWaitingStore from '../store/useWaitingStore';

const PAIN_OPTIONS = [
  { level: 1, emoji: '😌', label: 'Légère',        arabic: 'خفيف',   color: 'border-green-200 hover:border-green-400 hover:bg-green-50' },
  { level: 2, emoji: '😐', label: 'Modérée',       arabic: 'متوسط',  color: 'border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50' },
  { level: 3, emoji: '😟', label: 'Importante',    arabic: 'مهم',    color: 'border-orange-200 hover:border-orange-400 hover:bg-orange-50' },
  { level: 4, emoji: '😣', label: 'Intense',       arabic: 'شديد',   color: 'border-red-200 hover:border-red-400 hover:bg-red-50' },
  { level: 5, emoji: '😱', label: 'Insupportable', arabic: 'لا يُحتمل', color: 'border-red-400 hover:border-red-600 hover:bg-red-50' },
];

const ZONE_OPTIONS = [
  { key: 'Tête / Neurologie',        emoji: '🧠', arabic: 'الرأس / الأعصاب' },
  { key: 'Poitrine / Respiration',   emoji: '🫁', arabic: 'الصدر / التنفس' },
  { key: 'Abdomen / Ventre',         emoji: '🫀', arabic: 'البطن' },
  { key: 'Membres / Traumatisme',    emoji: '🦴', arabic: 'الأطراف / الجروح' },
];

const PreRegisterModal = ({ isOpen, onClose, onConfirmed }) => {
  const [step, setStep] = useState(1); // 1 = pain, 2 = zone, 3 = ticket
  const [painLevel, setPainLevel] = useState(null);
  const [ticketNum, setTicketNum] = useState('');
  const addPatient = useWaitingStore(s => s.addPatient);

  if (!isOpen) return null;

  const handlePain = (level) => {
    setPainLevel(level);
    setStep(2);
  };

  const handleZone = (zone) => {
    // Register patient in queue using the hook's addPatient
    addPatient({ painLevel, symptomZone: zone });
    // Read back the generated ticket from the store
    const { waitingPatients } = useWaitingStore.getState();
    const last = waitingPatients[waitingPatients.length - 1];
    setTicketNum(last?.ticketNum ?? '');
    setStep(3);
    if (onConfirmed) onConfirmed();
  };

  const handleClose = () => {
    setStep(1);
    setPainLevel(null);
    setTicketNum('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-2000 flex items-end sm:items-center justify-center" onClick={handleClose}>
      <div className="absolute inset-0 bg-text/40 backdrop-blur-sm" />

      <div
        className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Progress bar */}
        {step < 3 && (
          <div className="w-full h-1 bg-[#F0EDE8]">
            <div
              className="h-1 bg-[#D94F3D] transition-all duration-500"
              style={{ width: step === 1 ? '33%' : '66%' }}
            />
          </div>
        )}

        {/* ── STEP 1: Pain level ── */}
        {step === 1 && (
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="font-heading text-xl font-bold text-text mb-1">
                Comment évaluez-vous votre douleur ?
              </h2>
              <p className="text-sm text-[#8A8785]">كيف تُقيّم ألمك؟</p>
            </div>
            <div className="flex flex-col gap-3">
              {PAIN_OPTIONS.map(opt => (
                <button
                  key={opt.level}
                  onClick={() => handlePain(opt.level)}
                  className={`flex items-center gap-4 p-4 bg-white border-2 rounded-2xl cursor-pointer transition-all duration-150 active:scale-[0.98] w-full text-left ${opt.color}`}
                >
                  <span className="text-3xl leading-none">{opt.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-text text-sm">{opt.label}</div>
                    <div className="text-xs text-muted">{opt.arabic}</div>
                  </div>
                  <span className="font-mono text-lg font-bold text-[#8A8785]/40">{opt.level}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Symptom zone ── */}
        {step === 2 && (
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="font-heading text-xl font-bold text-text mb-1">
                Où ressentez-vous la gêne ?
              </h2>
              <p className="text-sm text-[#8A8785]">أين تشعر بالألم الرئيسي؟</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ZONE_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => handleZone(opt.key)}
                  className="flex flex-col items-center gap-2 p-5 bg-white border-2 border-border rounded-2xl cursor-pointer hover:border-danger hover:bg-danger/5 active:scale-[0.97] transition-all duration-150"
                >
                  <span className="text-4xl leading-none">{opt.emoji}</span>
                  <div className="text-center">
                    <div className="font-semibold text-text text-xs leading-tight">{opt.key}</div>
                    <div className="text-[10px] text-muted mt-0.5">{opt.arabic}</div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="mt-4 w-full py-2.5 text-xs font-medium text-muted hover:text-text transition-colors border-none bg-transparent cursor-pointer"
            >
              ← Retour
            </button>
          </div>
        )}

        {/* ── STEP 3: Ticket confirmation ── */}
        {step === 3 && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-3xl">
              ✅
            </div>
            <p className="text-[10px] font-mono text-[#8A8785] uppercase tracking-widest mb-2">
              Numéro de ticket / رقم التذكرة
            </p>
            <div className="font-mono text-4xl font-black text-primary mb-6 tracking-widest bg-bg border-2 border-dashed border-border rounded-2xl py-4 px-6 inline-block w-full">
              {ticketNum}
            </div>
            <p className="text-base font-semibold text-text mb-1">
              Prenez un siège
            </p>
            <p className="text-sm text-[#8A8785] mb-1">
              Une infirmière vous appellera très prochainement.
            </p>
            <p className="text-sm text-[#8A8785] mb-6">
              خذ مقعداً — ستُستدعى قريباً من قِبل الممرضة
            </p>
            <button
              onClick={handleClose}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-base hover:bg-primary/90 transition-colors border-none cursor-pointer"
            >
              Compris — شكراً
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreRegisterModal;
