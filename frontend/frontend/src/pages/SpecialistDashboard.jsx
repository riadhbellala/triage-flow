import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, RefreshCw, Activity,
  TrendingUp, Users
} from 'lucide-react';
import { getTriagedPatients, rescorePatients, upgradePatientLevel } from '../services/api';
import useWaitingStore from '../store/useWaitingStore';
import useAuthStore from '../store/useAuthStore';

const TRIAGE_COLORS = {
  '1': '#D94F3D',
  '2': '#D97706',
  '3A': '#8B5CF6',
  '3B': '#4A9068',
  '4': '#3B82F6',
  '5': '#8A8785',
};

const SpecialistDashboard = () => {
  const navigate = useNavigate();
  const { triagedPatients, setTriagedPatients } = useWaitingStore();
  const { doctor, logout } = useAuthStore();
  const [alerts, setAlerts] = useState([]);
  const [lastRescore, setLastRescore] = useState(null);
  const [isRescoring, setIsRescoring] = useState(false);

  const suggestUpgrade = (level) => {
    const map = {
      '5': '4', '4': '3B', '3B': '3A',
      '3A': '2', '2': '1'
    };
    return map[level] || level;
  };

  const fetchPatients = async () => {
    try {
      const patients = await getTriagedPatients();
      setTriagedPatients(patients);
    } catch (e) {
      console.error('Failed to fetch triaged patients:', e);
    }
  };

  const runRescore = async () => {
    setIsRescoring(true);
    try {
      const updated = await rescorePatients();
      setTriagedPatients(prev =>
        prev.map(p => {
          const u = updated.find((item) => item._id === p._id);
          if (!u) return p;
          if (u.degraded && !p.degraded) {
            setAlerts(prevAlerts => [...prevAlerts, {
              id: p._id,
              name: p.ticketNumber,
              from: p.triageLevel,
              to: suggestUpgrade(p.triageLevel),
              time: new Date().toLocaleTimeString('fr-FR', {
                hour: '2-digit', minute: '2-digit'
              }),
            }]);
          }
          return { ...p, ...u };
        }).sort((a, b) => (b.score || 0) - (a.score || 0))
      );
      setLastRescore(new Date());
    } catch (e) {
      console.error('Rescore failed:', e);
    } finally {
      setIsRescoring(false);
    }
  };

  const handleUpgrade = async (patientId, newLevel) => {
    try {
      await upgradePatientLevel(patientId, newLevel);
      setTriagedPatients(prev =>
        prev.map(p =>
          p._id === patientId
            ? { ...p, triageLevel: newLevel, degraded: false }
            : p
        )
      );
      setAlerts(prev => prev.filter(a => a.id !== patientId));
    } catch (e) {
      console.error('Upgrade failed:', e);
    }
  };

  const dismissAlert = (patientId) => {
    setAlerts(prev => prev.filter(a => a.id !== patientId));
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const interval = setInterval(runRescore, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const criticalCount = triagedPatients.filter(p => p.triageLevel === '1' || p.triageLevel === '2').length;
  const degradedCount = triagedPatients.filter(p => p.degraded).length;

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <div className="bg-white border-b border-[#E8E5E0] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity size={20} className="text-[#2C3A52]" />
          <span className="font-fraunces text-lg font-bold text-[#1A1A18]">
            File d'attente - Medecin Specialiste
          </span>
        </div>
        <div className="flex items-center gap-4">
          {lastRescore && (
            <span className="text-[10px] font-mono text-muted">
              Rescore: {lastRescore.toLocaleTimeString('fr-FR', {
                hour: '2-digit', minute: '2-digit'
              })}
            </span>
          )}
          <span className="text-xs font-mono text-muted">
            {doctor?.name}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs font-mono text-muted hover:text-[#D94F3D] transition-colors"
          >
            Deconnexion
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total tries', value: triagedPatients.length, color: 'text-[#2C3A52]' },
            { label: 'Critiques', value: criticalCount, color: 'text-[#D94F3D]' },
            { label: 'Degrades', value: degradedCount, color: 'text-[#D97706]' },
            {
              label: 'Rescore',
              value: isRescoring ? '...' : 'Auto 30s',
              color: 'text-[#4A9068]'
            },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-[#E8E5E0] rounded-xl px-4 py-3">
              <div className={`font-mono font-bold text-xl leading-none ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-[10px] text-muted uppercase tracking-wider mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {alerts.length > 0 && (
          <div className="space-y-2 mb-6">
            {alerts.map((alert, i) => (
              <div key={i} className="flex items-center justify-between bg-[#D94F3D]/8 border border-[#D94F3D]/25 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={16} className="text-[#D94F3D]" />
                  <div>
                    <span className="text-sm font-semibold text-[#D94F3D]">
                      {alert.name} - Degradation detectee
                    </span>
                    <div className="text-xs text-[#D94F3D]/70 font-mono mt-0.5">
                      Suggere: Tri {alert.from} -&gt; Tri {alert.to}
                      {' '}- {alert.time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpgrade(alert.id, alert.to)}
                    className="bg-[#D94F3D] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#D94F3D]/90"
                  >
                    Upgrader
                  </button>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-[#D94F3D]/60 hover:text-[#D94F3D] text-xs font-mono transition-colors bg-transparent border-none cursor-pointer"
                  >
                    x
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-mono font-bold text-muted uppercase tracking-wider">
            Patients tries - classes par priorite
          </h2>
          <button
            onClick={() => { fetchPatients(); runRescore(); }}
            className="flex items-center gap-1.5 text-xs font-mono text-muted hover:text-[#2C3A52] transition-colors"
          >
            <RefreshCw size={12} />
            Actualiser
          </button>
        </div>

        {triagedPatients.length === 0 ? (
          <div className="text-center py-20">
            <Users size={32} className="text-muted/40 mx-auto mb-3" />
            <p className="text-muted font-mono text-sm">
              Aucun patient trie pour le moment
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#E8E5E0] rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 px-5 py-3 border-b border-[#E8E5E0]">
              {['Ticket', 'Categorie', 'Triage', 'Attente', 'Score', '']
                .map((h, i) => (
                  <div key={i} className={`text-[10px] font-mono font-bold text-muted uppercase tracking-wider
                  ${i === 0 ? 'col-span-2' :
                      i === 1 ? 'col-span-3' :
                        i === 5 ? 'col-span-2 text-right' : 'col-span-2'
                    }`}>
                    {h}
                  </div>
                ))}
            </div>

            <div className="divide-y divide-[#E8E5E0]">
              {triagedPatients.map(patient => {
                const color = TRIAGE_COLORS[patient.triageLevel]
                  || '#8A8785';
                return (
                  <div
                    key={patient._id}
                    className={`grid grid-cols-12 px-5 py-4 items-center hover:bg-[#F7F5F2] transition-colors group
                    ${patient.degraded
                        ? 'border-l-[3px] border-l-[#D94F3D]'
                        : ''
                      }`}
                  >
                    <div className="col-span-2 flex items-center gap-2">
                      {patient.degraded && (
                        <div className="w-2 h-2 rounded-full bg-[#D94F3D] animate-pulse shrink-0" />
                      )}
                      <span className="font-mono text-sm font-bold text-[#1A1A18]">
                        {patient.ticketNumber}
                      </span>
                    </div>
                    <div className="col-span-3 text-sm text-muted truncate">
                      {patient.category || '-'}
                    </div>
                    <div className="col-span-2">
                      <span
                        className="inline-flex items-center justify-center w-10 h-7 rounded text-xs font-black text-white"
                        style={{ background: color }}
                      >
                        {patient.triageLevel}
                      </span>
                    </div>
                    <div className="col-span-2 font-mono text-sm text-muted">
                      {Math.round(patient.waitMinutes || 0)} min
                    </div>
                    <div className={`col-span-2 font-mono text-sm font-bold
                    ${(patient.score || 0) >= 120
                        ? 'text-[#D94F3D]'
                        : (patient.score || 0) >= 80
                          ? 'text-[#D97706]'
                          : 'text-muted'
                      }`}>
                      {patient.score || 0}
                    </div>
                    <div className="col-span-1 text-right">
                      <TrendingUp
                        size={14}
                        className="text-muted/0 group-hover:text-muted transition-colors ml-auto cursor-pointer"
                        onClick={() => handleUpgrade(
                          patient._id,
                          suggestUpgrade(patient.triageLevel)
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialistDashboard;
