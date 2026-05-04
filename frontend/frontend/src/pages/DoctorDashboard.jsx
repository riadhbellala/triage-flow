import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/UI';
import {
  Search, Filter, ClipboardList, Clock,
  AlertCircle, AlertTriangle, X, RefreshCw,
} from 'lucide-react';
import useWaitingStore from '../store/useWaitingStore';
import useTriageStore from '../store/useTriageStore';
import { rescorePatient } from '../services/api';

/* ── Helpers ─────────────────────────────────────────── */
const TRIAGE_UPGRADE_MAP = { '5':'4', '4':'3B', '3B':'3A', '3A':'2', '2':'1' };
const suggestUpgrade = (level) => TRIAGE_UPGRADE_MAP[level] || level;

const PAIN_COLORS = {
  1: 'bg-green-100 text-green-700',
  2: 'bg-yellow-100 text-yellow-700',
  3: 'bg-orange-100 text-orange-700',
  4: 'bg-red-100 text-red-700',
  5: 'bg-red-200 text-red-800',
};
const PAIN_LABELS = {
  1: 'Légère', 2: 'Modérée', 3: 'Importante', 4: 'Intense', 5: 'Insupportable',
};

const getTriBadgeColor = (tri) => {
  const colors = {
    '1': 'bg-danger text-white',
    '2': 'bg-warning text-white',
    '3A': 'bg-[#8B5CF6] text-white',
    '3B': 'bg-success text-white',
    '4': 'bg-[#3B82F6] text-white',
    '5': 'bg-muted text-white',
  };
  return colors[tri?.toUpperCase()] || 'bg-border text-text';
};

const getRowBorderClass = (tri) => {
  const t = tri?.toUpperCase();
  if (t === '1')              return 'border-l-[3px] border-l-danger';
  if (t === '2' || t === '3A') return 'border-l-[3px] border-l-warning';
  return 'border-l-[3px] border-l-transparent';
};

const getScoreColor = (score) => {
  if (score >= 120) return 'text-danger font-bold';
  if (score >= 80)  return 'text-warning font-semibold';
  return 'text-muted';
};

/* ── Component ───────────────────────────────────────── */
const DoctorDashboard = () => {
  const navigate  = useNavigate();
  const [patients, setPatients]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [alerts, setAlerts]           = useState([]);
  const [lastRescore, setLastRescore] = useState(null);
  const [isRescoring, setIsRescoring] = useState(false);

  const waitingPatients = useWaitingStore(s => s.waitingPatients);
  const triagedPatients = useWaitingStore(s => s.triagedPatients);
  const setInTriage     = useWaitingStore(s => s.setInTriage);
  const resetTriage     = useTriageStore(s => s.resetTriage);
  const intervalRef     = useRef(null);

  /* ── Initial load ── */
  useEffect(() => {
    const load = async () => {
      const initial = triagedPatients;
      const scored = await Promise.all(
        initial.map(async (p) => {
          try {
            const { score } = await rescorePatient(p);
            return { ...p, score };
          } catch {
            return { ...p, score: 0 };
          }
        })
      );
      setPatients(scored.sort((a, b) => b.score - a.score));
      setLoading(false);
    };
    load();
  }, [triagedPatients]);

  /* ── Re-scoring engine (every 30 s) ── */
  useEffect(() => {
    const runRescore = async () => {
      setIsRescoring(true);
      const newAlerts = [];

      setPatients(prev => {
        const updated = prev.map(p => {
          const nextWait = (p.waitMinutes || 0) + 0.5;
          return { ...p, waitMinutes: nextWait };
        });

        // Fire API calls async, update state after
        Promise.all(
          updated.map(async (p) => {
            try {
              const { score, degraded } = await rescorePatient(p);
              if (!p.degraded && degraded) {
                newAlerts.push({
                  id: p.id, name: p.name,
                  from: p.triageLevel,
                  to: suggestUpgrade(p.triageLevel),
                  time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                });
              }
              return { ...p, score, degraded };
            } catch {
              return p;
            }
          })
        ).then(rescored => {
          setPatients(rescored.sort((a, b) => b.score - a.score));
          if (newAlerts.length > 0) setAlerts(prev => [...prev, ...newAlerts]);
          setLastRescore(new Date());
          setTimeout(() => setIsRescoring(false), 1000);
        });

        return updated; // optimistic update
      });
    };

    runRescore();
    intervalRef.current = setInterval(runRescore, 30000);
    return () => clearInterval(intervalRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Actions ── */
  const handleStartTriage = (wp) => {
    setInTriage(wp.id);
    resetTriage();
    navigate('/triage-setup');
  };

  const handleUpgrade = (alert) => {
    setPatients(prev =>
      prev.map(p =>
        p.id === alert.id
          ? { ...p, triageLevel: alert.to, tri: alert.to }
          : p
      )
    );
    setAlerts(prev => prev.filter(a => a.id !== alert.id));
  };

  const dismissAlert = (alertId) =>
    setAlerts(prev => prev.filter(a => a.id !== alertId));

  const pendingCount = waitingPatients.filter(p => p.status === 'waiting').length;

  return (
    <div className="w-full pb-10">

      {/* ── Page title ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-heading text-text tracking-tight mb-1">
            File d'Attente
          </h1>
          <p className="text-muted font-sans font-medium text-sm">Gestion des urgences et priorités</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 px-4 py-2 rounded-xl">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger" />
            </div>
            <span className="text-sm font-bold text-danger">
              {pendingCount} patient{pendingCount > 1 ? 's' : ''} en attente
            </span>
          </div>
        )}
      </div>

      {/* ── Stats strip (5 chips) ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { color: 'bg-primary', count: 42, label: "Aujourd'hui" },
          { color: 'bg-success', count: 12, label: 'Réorientés'  },
          { color: 'bg-warning', count: 15, label: 'En Urgences' },
          { color: 'bg-danger',  count: 3,  label: 'Critiques'   },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border px-4 py-3 rounded-xl flex items-center justify-between shadow-[0_1px_4px_rgba(26,20,10,0.07)]">
            <div className={`w-2 h-2 rounded-full ${s.color} shrink-0`} />
            <div className="text-right">
              <div className="font-mono font-bold text-xl text-text leading-none mb-1">{s.count}</div>
              <div className="text-[10px] text-muted uppercase tracking-wider font-bold">{s.label}</div>
            </div>
          </div>
        ))}

        {/* Rescore chip */}
        <div className="bg-card border border-border px-4 py-3 rounded-xl flex items-center justify-between shadow-[0_1px_4px_rgba(26,20,10,0.07)]">
          <RefreshCw
            size={14}
            className={`text-muted shrink-0 transition-transform duration-700 ${isRescoring ? 'animate-spin text-primary' : ''}`}
          />
          <div className="text-right">
            <div className="font-mono font-bold text-base text-text leading-none mb-1">
              {lastRescore
                ? lastRescore.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : '—'}
            </div>
            <div className="text-[10px] text-muted uppercase tracking-wider font-bold">Dernier rescore</div>
          </div>
        </div>
      </div>

      {/* ── Degradation alerts ── */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map(alert => (
            <div
              key={`${alert.id}-${alert.time}`}
              className="flex items-center justify-between bg-danger/[0.06] border border-danger/25 rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle size={16} className="text-danger shrink-0" />
                <div>
                  <div className="font-semibold text-sm text-danger leading-tight">
                    {alert.name} — Dégradation détectée
                  </div>
                  <div className="text-xs text-danger/70 font-mono mt-0.5">
                    Suggère mise à niveau&nbsp;: Tri {alert.from} → Tri {alert.to} · {alert.time}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  onClick={() => handleUpgrade(alert)}
                  className="bg-danger text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-danger/90 transition-colors border-none cursor-pointer whitespace-nowrap"
                >
                  Upgrader
                </button>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-danger/60 hover:text-danger transition-colors border-none bg-transparent cursor-pointer p-1 rounded"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Kiosk waiting queue ── */}
      {waitingPatients.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList size={18} className="text-danger" />
            <h2 className="text-[11px] font-bold text-muted uppercase tracking-wider m-0">
              Patients enregistrés — En attente de triage
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {waitingPatients.map(wp => (
              <div
                key={wp.id}
                className={`bg-white border-2 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-all
                  ${wp.status === 'in-triage' ? 'border-warning/30 opacity-60' : 'border-danger/20 hover:border-danger/40'}`}
              >
                <div className="shrink-0">
                  <div className="font-mono text-xl font-black text-primary tracking-widest">{wp.ticketNum}</div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-muted mt-0.5">
                    <Clock size={10} /> {wp.arrivedAt}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 flex-1">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg ${PAIN_COLORS[wp.painLevel] || 'bg-bg text-muted'}`}>
                    Douleur : {PAIN_LABELS[wp.painLevel] || '?'} ({wp.painLevel}/5)
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary/10 text-primary">
                    {wp.symptomZone}
                  </span>
                  {wp.status === 'in-triage' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-warning/10 text-warning">
                      En cours de triage
                    </span>
                  )}
                </div>
                {wp.status === 'waiting' && (
                  <button
                    onClick={() => handleStartTriage(wp)}
                    className="shrink-0 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors border-none cursor-pointer whitespace-nowrap"
                  >
                    Commencer le triage →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {waitingPatients.length === 0 && (
        <div className="flex items-center gap-3 bg-white border border-dashed border-border rounded-xl p-4 mb-8 text-muted text-sm">
          <AlertCircle size={18} className="shrink-0" />
          Aucun patient en attente d'enregistrement kiosque pour l'instant.
        </div>
      )}

      {/* ── Search & filter ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 bg-card border border-border rounded-xl p-1 flex items-center px-4 shadow-[0_1px_4px_rgba(26,20,10,0.07)] focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Search size={18} className="text-muted mr-2" />
          <input
            type="text"
            placeholder="Rechercher par nom, motif..."
            className="w-full focus:outline-none text-sm py-2 bg-transparent text-text placeholder:text-muted"
          />
        </div>
        <button className="bg-card border border-border rounded-xl px-5 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold text-text hover:bg-bg transition-colors shadow-[0_1px_4px_rgba(26,20,10,0.07)]">
          <Filter size={16} /> Filtrer
        </button>
      </div>

      {/* ── Triaged patients table ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-bold text-muted uppercase tracking-wider m-0">
          Patients triagés — classés par score
        </h2>
        {isRescoring && (
          <span className="text-[10px] font-mono text-primary animate-pulse">Rescoring…</span>
        )}
      </div>

      <Card className="p-0 overflow-hidden shadow-[0_1px_4px_rgba(26,20,10,0.07)] border-border rounded-xl">
        {loading ? (
          <div className="p-12 text-center text-muted flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin mb-4" />
            <p className="font-medium text-sm">Chargement des dossiers patients...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase text-muted tracking-wider bg-white">
                  <th className="p-4 pl-6 font-bold">Patient</th>
                  <th className="p-4 font-bold">Motif &amp; Gravité</th>
                  <th className="p-4 font-bold">Score</th>
                  <th className="p-4 font-bold">Heure</th>
                  <th className="p-4 pr-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {patients.map(p => (
                  <tr
                    key={p.id}
                    className={`group hover:bg-bg transition-colors bg-white ${getRowBorderClass(p.tri)}
                      ${p.degraded ? 'bg-danger/[0.02]' : ''}`}
                  >
                    {/* Patient name + degradation dot */}
                    <td className="p-4 pl-5">
                      <div className="flex items-center gap-1.5">
                        {p.degraded && (
                          <span className="w-2 h-2 rounded-full bg-danger animate-pulse inline-block shrink-0" />
                        )}
                        <div className="font-bold text-text text-sm">{p.name}</div>
                      </div>
                      <div className="text-[11px] font-medium text-muted mt-0.5 pl-3.5">
                        {p.age} ans • {p.sex}
                      </div>
                    </td>

                    {/* Triage badge + complaint */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center justify-center w-10 h-7 rounded text-xs font-bold ${getTriBadgeColor(p.tri)}`}>
                          {p.tri}
                        </span>
                        <span className="text-sm font-medium text-text">{p.complaint}</span>
                      </div>
                    </td>

                    {/* Priority score */}
                    <td className="p-4">
                      <span className={`font-mono text-sm ${getScoreColor(p.score)}`}>
                        {p.score}
                      </span>
                    </td>

                    {/* Arrival time */}
                    <td className="p-4">
                      <span className={`font-mono text-sm ${p.waitMinutes > 30 ? 'text-danger' : 'text-text'}`}>
                        {p.time}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-4 pr-6 text-right">
                      <button className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                        Ouvrir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DoctorDashboard;
