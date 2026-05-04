import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import useTriageStore from '../store/useTriageStore';
import { Printer, RefreshCcw, AlertTriangle, Clock, User, FileText, ChevronRight, Activity } from 'lucide-react';

const ResultScreen = () => {
  const navigate = useNavigate();
  const { patient, complaint, result, resetTriage } = useTriageStore();

  useEffect(() => {
    if (!result) {
      navigate('/triage-setup', { replace: true });
    }
  }, [result, navigate]);

  if (!result) return null;

  const handleReset = () => {
    resetTriage();
    navigate('/triage-setup');
  };

  const handlePrint = () => {
    window.print();
  };

  const qrPayload = JSON.stringify({
    name: patient.name || 'Anonyme',
    tri: result.tri,
    esi: result.esi,
    timestamp: new Date().toISOString()
  });
  
  // Generating a pseudo ID based on timestamp
  const pseudoId = `PT-${new Date().getTime().toString().slice(-6)}`;

  const getTriColorClass = (tri) => {
    const map = {
      '1': 'text-danger border-danger',
      '2': 'text-warning border-warning',
      '3A': 'text-[#8B5CF6] border-[#8B5CF6]',
      '3B': 'text-success border-success',
      '4': 'text-[#3B82F6] border-[#3B82F6]',
      '5': 'text-muted border-muted',
    };
    return map[tri.toString().toUpperCase()] || 'text-muted border-muted';
  };
  
  const getTriTextColorClass = (tri) => {
    const map = {
      '1': 'text-danger',
      '2': 'text-warning',
      '3A': 'text-[#8B5CF6]',
      '3B': 'text-success',
      '4': 'text-[#3B82F6]',
      '5': 'text-muted',
    };
    return map[tri.toString().toUpperCase()] || 'text-muted';
  };

  const getTriBgColorClass = (tri) => {
    const map = {
      '1': 'bg-danger/10',
      '2': 'bg-warning/10',
      '3A': 'bg-[#8B5CF6]/10',
      '3B': 'bg-success/10',
      '4': 'bg-[#3B82F6]/10',
      '5': 'bg-muted/10',
    };
    return map[tri.toString().toUpperCase()] || 'bg-bg';
  };

  const getTriDescription = (tri) => {
    const map = {
      '1': 'Urgences vitales',
      '2': 'Urgences très fréquentes',
      '3A': 'Urgences potentiellement graves',
      '3B': 'Urgences relatives',
      '4': 'Consultations non urgentes',
      '5': 'Pas de critère d\'urgence',
    };
    return map[tri.toString().toUpperCase()] || 'Niveau inconnu';
  };

  const getWaitTime = (tri) => {
    const map = {
      '1': 'Immédiat (0 min)',
      '2': '< 10 min',
      '3A': '< 30 min',
      '3B': '< 60 min',
      '4': '< 120 min',
      '5': '< 240 min',
    };
    return map[tri.toString().toUpperCase()] || '--';
  };

  const colorClasses = getTriColorClass(result.tri);
  const textColorOnly = getTriTextColorClass(result.tri);
  const bgColorOnly = getTriBgColorClass(result.tri);

  return (
    <div className="w-full pb-10">
      
      {/* Header Area */}
      <div className="text-left mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-heading text-text tracking-tight mb-2">Bilan d'Orientation</h1>
          <p className="text-muted font-sans text-base">L'évaluation est terminée. Ce ticket est généré automatiquement.</p>
        </div>
        <div className="hidden md:flex bg-white border border-border px-4 py-2 rounded-xl shadow-sm text-sm font-mono text-muted">
          ID: {pseudoId}
        </div>
      </div>

      {/* Critical alert for Tri 1 */}
      {result.tri === '1' && (
        <div className="border border-danger bg-danger/5 text-danger rounded-xl p-4 mb-6 font-medium text-sm flex items-center gap-3 animate-in slide-in-from-top-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-danger"></span>
          </div>
          <span className="font-bold tracking-wide uppercase text-xs">Alerte Critique :</span>
          Prise en charge immédiate requise — Salle de déchocage
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Result Card (Spans 2 columns) */}
        <div className={`lg:col-span-2 bg-white border border-border rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(26,20,10,0.04)] flex flex-col h-full`}>
          <div className={`p-8 flex-1 flex flex-col justify-center border-l-8 ${colorClasses} ${bgColorOnly} relative overflow-hidden`}>
            {/* Background watermark */}
            <div className={`absolute -right-10 -bottom-10 opacity-5 font-heading font-bold text-[200px] leading-none ${textColorOnly} pointer-events-none select-none`}>
              {result.tri}
            </div>
            
            <div className="relative z-10">
              <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Niveau de Priorité</div>
              <div className="flex items-baseline gap-4 mb-2">
                <div className={`font-heading text-7xl md:text-8xl font-black ${textColorOnly} leading-none`}>
                  Tri {result.tri}
                </div>
              </div>
              <div className="text-lg md:text-xl text-text font-medium font-sans">
                {getTriDescription(result.tri)}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 border-t border-border grid grid-cols-2 divide-x divide-border">
            <div className="px-4 first:pl-0 flex items-center gap-4">
              <div className="bg-bg p-3 rounded-xl text-primary">
                <Activity size={20} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Catégorie ESI</div>
                <div className={`font-mono text-xl font-bold ${textColorOnly}`}>Niveau {result.esi}</div>
              </div>
            </div>
            <div className="px-4 flex items-center gap-4">
              <div className="bg-bg p-3 rounded-xl text-primary">
                <Clock size={20} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Délai Maximum</div>
                <div className="font-mono text-xl font-bold text-text">{getWaitTime(result.tri)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Details (Spans 1 column) */}
        <div className="bg-card border border-border rounded-2xl shadow-[0_4px_20px_rgba(26,20,10,0.04)] flex flex-col print:shadow-none print:border-black relative">
          
          <div className="p-6 border-b border-dashed border-border relative">
            {/* Cutouts for ticket effect */}
            <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-bg rounded-full border-r border-t border-border transform rotate-45 hidden md:block"></div>
            <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-bg rounded-full border-l border-t border-border transform -rotate-45 hidden md:block"></div>
            
            <div className="flex items-center gap-2 mb-4">
              <User size={16} className="text-muted" />
              <div className="text-[10px] font-bold text-muted uppercase tracking-wider m-0">Dossier Patient</div>
            </div>
            
            <div className="font-heading font-bold text-2xl text-text mb-1 line-clamp-1">
              {patient.name || 'Anonyme'}
            </div>
            <div className="text-sm text-muted font-mono mb-6 flex gap-2 items-center">
              <span>{patient.age ? `${patient.age} ans` : '--'}</span>
              <span>•</span>
              <span>{patient.sex === 'M' ? 'Masculin' : patient.sex === 'F' ? 'Féminin' : '--'}</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-1">Motif d'admission</div>
                <div className="bg-bg border border-border text-text text-sm px-3 py-2 rounded-lg font-medium flex items-start gap-2">
                  <FileText size={16} className="text-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{complaint || 'Non spécifié'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col items-center justify-center bg-gray-50/50 rounded-b-2xl">
            <div className="bg-white border-2 border-border p-3 rounded-xl shadow-sm mb-3 hover:border-primary transition-colors">
              <QRCodeSVG value={qrPayload} size={110} level="M" />
            </div>
            <div className="text-[10px] text-muted uppercase tracking-widest font-semibold text-center w-full max-w-[150px]">
              Scanner pour admission
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 print:hidden mt-8 max-w-2xl mx-auto">
        <button 
          onClick={handlePrint} 
          className="flex-1 group border-2 border-primary text-primary bg-white hover:bg-primary/5 transition-all py-4 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <Printer size={20} className="group-hover:scale-110 transition-transform" /> 
          Imprimer le Bilan
        </button>
        <button 
          onClick={handleReset} 
          className="flex-1 group bg-primary text-white hover:bg-primary/90 transition-all py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5"
        >
          Nouveau Patient
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
    </div>
  );
};

export default ResultScreen;
