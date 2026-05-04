import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Clock, RefreshCw, AlertCircle,
  ArrowRight, Activity
} from 'lucide-react';
import { getWaitingPatients } from '../services/api';
import useWaitingStore from '../store/useWaitingStore';
import useAuthStore from '../store/useAuthStore';

const GeneralistDashboard = () => {
  const navigate = useNavigate();
  const { waitingPatients, setWaitingPatients } = useWaitingStore();
  const { doctor, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchPatients = async () => {
    try {
      const patients = await getWaitingPatients();
      setWaitingPatients(patients);
      setLastRefresh(new Date());
    } catch (e) {
      console.error('Failed to fetch waiting patients:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    const interval = setInterval(fetchPatients, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleStartTriage = (patient) => {
    sessionStorage.setItem('activePatientId', patient._id);
    sessionStorage.setItem('activePatient', JSON.stringify({
      id: patient._id,
      name: patient.ticketNumber,
      age: patient.age || 0,
      sex: patient.sex || '',
    }));
    navigate('/triage-setup');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <div className="bg-white border-b border-[#E8E5E0] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity size={20} className="text-[#2C3A52]" />
          <span className="font-fraunces text-lg font-bold text-[#1A1A18]">
            File d'attente - Medecin Generaliste
          </span>
        </div>
        <div className="flex items-center gap-4">
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

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: 'En attente',
              value: waitingPatients.length,
              icon: Users,
              color: 'text-[#2C3A52]'
            },
            {
              label: 'Dernier refresh',
              value: lastRefresh
                ? lastRefresh.toLocaleTimeString('fr-FR', {
                  hour: '2-digit', minute: '2-digit'
                })
                : '-',
              icon: Clock,
              color: 'text-muted'
            },
            {
              label: 'Statut',
              value: 'Actif',
              icon: Activity,
              color: 'text-[#4A9068]'
            },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-[#E8E5E0] rounded-xl px-4 py-3 flex items-center gap-3">
              <stat.icon size={16} className={stat.color} />
              <div>
                <div className={`font-mono font-bold text-lg leading-none ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-mono font-bold text-muted uppercase tracking-wider">
            Patients en attente de triage
          </h2>
          <button
            onClick={fetchPatients}
            className="flex items-center gap-1.5 text-xs font-mono text-muted hover:text-[#2C3A52] transition-colors"
          >
            <RefreshCw size={12} />
            Actualiser
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted font-mono text-sm">
            Chargement...
          </div>
        ) : waitingPatients.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle size={32} className="text-muted/40 mx-auto mb-3" />
            <p className="text-muted font-mono text-sm">
              Aucun patient en attente
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {waitingPatients.map((patient, idx) => (
              <div
                key={patient._id}
                className="bg-white border border-[#E8E5E0] rounded-xl px-5 py-4 flex items-center justify-between hover:border-[#2C3A52]/40 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#F0EDE8] flex items-center justify-center font-mono text-xs font-bold text-muted">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#1A1A18]">
                      {patient.ticketNumber}
                    </div>
                    <div className="text-xs font-mono text-muted mt-0.5">
                      Arrivee: {new Date(patient.createdAt)
                        .toLocaleTimeString('fr-FR', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleStartTriage(patient)}
                  className="flex items-center gap-2 bg-[#2C3A52] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#2C3A52]/90 transition-colors"
                >
                  Commencer triage
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralistDashboard;
