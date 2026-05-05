import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useTriageStore from '../store/useTriageStore';
import { calculateTriage } from '../utils/triageLogic';
import { saveTriageResult } from '../services/api';
import { 
  ArrowLeft, Stethoscope, AlertCircle, HeartPulse, 
  Activity, Thermometer, Wind, Droplet, 
  Check
} from 'lucide-react';

const VitalInput = ({ icon: Icon, label, unit, value, onChange, placeholder, step }) => (
  <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
    <div className="bg-bg p-2 rounded-lg text-primary">
      <Icon size={18} />
    </div>
    <div className="flex-1 flex flex-col justify-center">
      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">{label}</label>
      <div className="flex items-baseline gap-1">
        <input 
          type="number" 
          step={step}
          value={value} 
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent border-none p-0 text-xl font-semibold text-text focus:ring-0 placeholder:text-muted/40"
        />
        {unit && <span className="text-sm text-muted font-medium select-none">{unit}</span>}
      </div>
    </div>
  </div>
);

const TriageScreen = () => {
  const navigate = useNavigate();
  const { 
    currentCat, patient, vitals, setVitals, complaint, setComplaint, 
    signs, toggleSign, setResult, setCategory
  } = useTriageStore();

  useEffect(() => {
    if (!currentCat) {
      navigate('/triage-setup', { replace: true });
    }
  }, [currentCat, navigate]);

  if (!currentCat) return null;

  const handleCalculate = async () => {
    const currentMotif = currentCat.motifs.find(m => m.name === complaint);
    const result = calculateTriage(vitals, signs, currentMotif, patient.age);
    setResult(result);

    const patientId = sessionStorage.getItem('activePatientId');
    if (patientId) {
      try {
        await saveTriageResult(patientId, {
          triageLevel: result.tri,
          esiLevel: result.esi,
          category: currentCat?.name,
          complaint: complaint?.name || complaint,
          signs,
          vitals: {
            fc: parseInt(vitals.fc) || null,
            pas: parseInt(vitals.pas) || null,
            spo2: parseInt(vitals.spo2) || null,
            fr: parseInt(vitals.fr) || null,
            temp: parseFloat(vitals.temp) || null,
            glyc: parseFloat(vitals.glyc) || null,
          },
          redFlags: signs.filter(s =>
            s.includes('Detresse') ||
            s.includes('GCS ≤ 8') ||
            s.includes('Arret')
          ),
        });
        sessionStorage.removeItem('activePatientId');
      } catch (e) {
        console.error('Failed to save triage result:', e);
      }
    }

    navigate('/result');
  };

  return (
    <div className="w-full pb-10">
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur pt-4 pb-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setCategory(null); navigate('/triage-setup'); }} 
            className="p-2 bg-transparent border border-border rounded-lg text-text hover:bg-bg transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold font-heading text-text leading-tight">{currentCat.name}</h2>
            {patient.name && <p className="text-xs text-muted font-medium mt-0.5">Patient: {patient.name}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* Section: Constantes Vitales */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <HeartPulse size={20} className="text-primary" />
            <h3 className="text-[11px] font-bold text-muted uppercase tracking-wider m-0">Constantes Vitales</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <VitalInput 
              icon={Activity} label="FC" unit="bpm" placeholder="Ex: 80"
              value={vitals.fc} onChange={(e) => setVitals({fc: e.target.value})} 
            />
            <VitalInput 
              icon={Droplet} label="PAS" unit="mmHg" placeholder="Ex: 120"
              value={vitals.pas} onChange={(e) => setVitals({pas: e.target.value})} 
            />
            <VitalInput 
              icon={Wind} label="SpO2" unit="%" placeholder="Ex: 98"
              value={vitals.spo2} onChange={(e) => setVitals({spo2: e.target.value})} 
            />
            <VitalInput 
              icon={Activity} label="FR" unit="/min" placeholder="Ex: 16"
              value={vitals.fr} onChange={(e) => setVitals({fr: e.target.value})} 
            />
            <VitalInput 
              icon={Thermometer} label="Temp" unit="°C" placeholder="Ex: 37.2" step="0.1"
              value={vitals.temp} onChange={(e) => setVitals({temp: e.target.value})} 
            />
            <VitalInput 
              icon={Droplet} label="Glyc" unit="mmol/L" placeholder="Ex: 5.5" step="0.1"
              value={vitals.glyc} onChange={(e) => setVitals({glyc: e.target.value})} 
            />
          </div>
        </section>

        {/* Section: Motif Principal */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={20} className="text-primary" />
            <h3 className="text-[11px] font-bold text-muted uppercase tracking-wider m-0">Motif Principal</h3>
            <span className="bg-[#F0EDE8] text-muted rounded text-xs px-2 py-0.5 ml-2 font-medium">1 choix</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentCat.motifs.map((m, i) => {
              const isSelected = complaint === m.name;
              return (
                <label key={`m-${i}`} className="group relative cursor-pointer block">
                  <input 
                    type="radio" 
                    name="complaint" 
                    value={m.name} 
                    checked={isSelected}
                    onChange={() => setComplaint(m.name)}
                    className="absolute opacity-0 w-0 h-0" 
                  />
                  <div className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors duration-200
                    ${isSelected 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border bg-card text-text hover:border-primary/40'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center
                      ${isSelected ? 'bg-primary border-primary' : 'border-border'}
                    `} />
                    <span className="font-semibold text-sm leading-tight">{m.name}</span>
                  </div>
                </label>
              )
            })}
          </div>
        </section>

        {/* Section: Signes de Gravité */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope size={20} className="text-primary" />
            <h3 className="text-[11px] font-bold text-muted uppercase tracking-wider m-0">Signes de Gravité</h3>
            <span className="bg-[#F0EDE8] text-muted rounded text-xs px-2 py-0.5 ml-2 font-medium">Choix multiples</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(() => {
              const currentMotif = currentCat.motifs.find(m => m.name === complaint);
              if (!currentMotif) {
                return <p className="text-muted italic text-sm col-span-full">Sélectionnez un motif principal pour voir les critères.</p>;
              }
              if (currentMotif.signs.length === 0) {
                return <p className="text-muted italic text-sm col-span-full">Aucun critère spécifique.</p>;
              }
              return currentMotif.signs.map((s, i) => {
                const isSelected = signs.includes(s);
                return (
                  <label key={`s-${i}`} className="group relative cursor-pointer block">
                    <input 
                      type="checkbox" 
                      value={s} 
                      checked={isSelected}
                      onChange={() => toggleSign(s)}
                      className="absolute opacity-0 w-0 h-0" 
                    />
                    <div className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors duration-200
                      ${isSelected 
                        ? 'border-danger bg-danger/5 text-danger' 
                        : 'border-border bg-card text-text hover:border-danger/40'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-sm border-2 shrink-0 flex items-center justify-center transition-colors
                        ${isSelected ? 'bg-danger border-danger' : 'border-border'}
                      `}>
                        {isSelected && <Check size={10} className="text-white" strokeWidth={4} />}
                      </div>
                      <span className="font-semibold text-sm leading-tight">{s}</span>
                    </div>
                  </label>
                );
              });
            })()}
          </div>
        </section>

      </div>

      {/* Action Area */}
      <div className="mt-10">
        <button 
          onClick={handleCalculate} 
          disabled={!complaint}
          className={`w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2
            ${complaint 
              ? 'bg-primary text-white hover:bg-primary/90 cursor-pointer' 
              : 'bg-border text-muted cursor-not-allowed'
            }`}
        >
          <Activity size={20} />
          Calculer le Triage
        </button>
        {!complaint && (
          <p className="text-center text-sm text-danger mt-3 font-medium">
            Veuillez sélectionner un motif principal pour continuer
          </p>
        )}
      </div>

    </div>
  );
};

export default TriageScreen;
