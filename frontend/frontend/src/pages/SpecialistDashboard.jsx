import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, RefreshCw, Activity, TrendingUp,
  Users, Clock, Zap, Shield, CheckCircle2, X, ChevronUp
} from 'lucide-react';
import { getTriagedPatients, rescorePatients, upgradePatientLevel, markPatientDone } from '../services/api';
import useWaitingStore from '../store/useWaitingStore';
import useAuthStore from '../store/useAuthStore';

/* ─── Config ─────────────────────────────────────────── */
const LEVELS = {
  '1':  { label: 'Critique',  bg: '#D94F3D', light: 'rgba(217,79,61,0.08)',  border: 'rgba(217,79,61,0.2)' },
  '2':  { label: 'Urgence',   bg: '#D97706', light: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.2)' },
  '3A': { label: 'Semi-urg.', bg: '#8B5CF6', light: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)' },
  '3B': { label: 'Modéré',   bg: '#4A9068', light: 'rgba(74,144,104,0.08)', border: 'rgba(74,144,104,0.2)' },
  '4':  { label: 'Stable',   bg: '#3B82F6', light: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
  '5':  { label: 'Non-urg.', bg: '#8A8785', light: 'rgba(138,135,133,0.08)',border: 'rgba(138,135,133,0.2)' },
};
const UPGRADE_MAP = { '5':'4','4':'3B','3B':'3A','3A':'2','2':'1' };
const suggestUpgrade = (l) => UPGRADE_MAP[l] || l;

const waitMeta = (m) => {
  if (m >= 60) return { label:`${m} min`, cls:'text-[#D94F3D] font-bold' };
  if (m >= 30) return { label:`${m} min`, cls:'text-[#D97706] font-semibold' };
  return { label:`${m} min`, cls:'text-[#6B7280]' };
};

const ScoreBar = ({ score }) => {
  const pct   = Math.min(100, Math.round((score / 200) * 100));
  const color = score >= 120 ? '#D94F3D' : score >= 80 ? '#D97706' : '#4A9068';
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="font-mono text-sm font-bold w-7 shrink-0" style={{ color }}>{score}</span>
      <div className="flex-1 h-1 rounded-full bg-[#E8E5E0] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width:`${pct}%`, background:color }} />
      </div>
    </div>
  );
};

/* ─── Component ──────────────────────────────────────── */
export default function SpecialistDashboard() {
  const navigate = useNavigate();
  const { triagedPatients, setTriagedPatients } = useWaitingStore();
  const { doctor } = useAuthStore();

  const [alerts,      setAlerts]      = useState([]);
  const [lastRescore, setLastRescore] = useState(null);
  const [isRescoring, setIsRescoring] = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [clock,       setClock]       = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const fetchPatients = async () => {
    try {
      const p = await getTriagedPatients();
      setTriagedPatients(Array.isArray(p) ? p : []);
    } catch (e) { console.error(e); }
    finally     { setLoading(false); }
  };

  const runRescore = async () => {
    setIsRescoring(true);
    try {
      const updated = await rescorePatients();
      setTriagedPatients(prev => {
        const safe    = Array.isArray(prev)    ? prev    : [];
        const safeUpd = Array.isArray(updated) ? updated : [];
        const newAl   = [];
        const next = safe.map(p => {
          const u = safeUpd.find(x => x._id === p._id);
          if (!u) return p;
          if (u.degraded && !p.degraded) newAl.push({
            id: p._id, name: p.ticketNumber,
            from: p.triageLevel, to: suggestUpgrade(p.triageLevel),
            time: new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),
          });
          return { ...p, ...u };
        }).sort((a,b) => (b.score||0)-(a.score||0));
        if (newAl.length) setAlerts(a => [...a, ...newAl]);
        return next;
      });
      setLastRescore(new Date());
    } catch (e) { console.error(e); }
    finally     { setIsRescoring(false); }
  };

  const handleUpgrade = async (id, level) => {
    try {
      await upgradePatientLevel(id, level);
      setTriagedPatients(prev =>
        prev.map(p => p._id === id ? { ...p, triageLevel:level, degraded:false } : p)
      );
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleDone = async (id) => {
    try {
      await markPatientDone(id);
      // Remove instantly from local state
      setTriagedPatients(prev => prev.filter(p => p._id !== id));
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchPatients(); }, []);

  // Auto-refresh every 10 s to pick up new patients from generalist
  useEffect(() => {
    const iv = setInterval(fetchPatients, 10000);
    return () => clearInterval(iv);
  }, []);

  // Rescore every 30 s
  useEffect(() => {
    const iv = setInterval(runRescore, 30000);
    return () => clearInterval(iv);
  }, []);

  const pts           = Array.isArray(triagedPatients) ? triagedPatients : [];
  const criticalCount = pts.filter(p => p.triageLevel==='1'||p.triageLevel==='2').length;
  const degradedCount = pts.filter(p => p.degraded).length;

  return (
    /* Full-height flex: sidebar | main — the StaffShell already handles the page scroll */
    <div style={{ height:'calc(100vh - 113px)' }} className="flex bg-[#F2F0ED] overflow-hidden">

      {/* ══ LEFT SIDEBAR ═══════════════════════════════════ */}
      <aside className="w-56 shrink-0 bg-white border-r border-[#E4E1DC] flex flex-col overflow-y-auto">

        {/* Overview KPIs */}
        <div className="p-4 border-b border-[#E4E1DC]">
          <p className="text-[9px] font-mono font-bold text-[#8A8785] uppercase tracking-widest mb-3">
            Vue d'ensemble
          </p>
          <div className="space-y-0">
            {[
              { icon:Users,         label:'Patients triés',      value:pts.length,        color:'#2C3A52' },
              { icon:Zap,           label:'Critiques / Urgents', value:criticalCount,      color:'#D94F3D', pulse:criticalCount>0 },
              { icon:AlertTriangle, label:'Dégradations',        value:degradedCount,      color:'#D97706' },
              { icon:Shield,        label:'Stables (4–5)',       value:pts.filter(p=>['4','5'].includes(p.triageLevel)).length, color:'#4A9068' },
            ].map((s,i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#F0EDE8] last:border-0">
                  <div className="flex items-center gap-2">
                    <Icon size={12} style={{ color:s.color }} />
                    <span className="text-[11px] text-[#5C5A56]">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-bold text-sm" style={{ color:s.color }}>{s.value}</span>
                    {s.pulse && s.value > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D94F3D] animate-ping" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Triage level legend */}
        <div className="p-4 border-b border-[#E4E1DC]">
          <p className="text-[9px] font-mono font-bold text-[#8A8785] uppercase tracking-widest mb-3">
            Niveaux
          </p>
          <div className="space-y-1.5">
            {Object.entries(LEVELS).map(([key, lvl]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded flex items-center justify-center text-white font-black text-[9px] shrink-0"
                  style={{ background:lvl.bg }}>
                  {key}
                </span>
                <span className="text-[11px] text-[#5C5A56] flex-1">{lvl.label}</span>
                <span className="text-[10px] font-mono text-[#8A8785]">
                  {pts.filter(p => p.triageLevel===key).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="p-4 border-b border-[#E4E1DC]">
            <p className="text-[9px] font-mono font-bold text-[#D94F3D] uppercase tracking-widest mb-3">
              Alertes ({alerts.length})
            </p>
            <div className="space-y-2">
              {alerts.map((alert, i) => (
                <div key={i} className="bg-[#FEF2F2] border border-[#D94F3D]/20 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-mono text-xs font-bold text-[#D94F3D]">{alert.name}</span>
                    <button onClick={() => setAlerts(prev => prev.filter(a=>a.id!==alert.id))}
                      className="text-[#D94F3D]/40 hover:text-[#D94F3D] border-none bg-transparent cursor-pointer p-0 leading-none shrink-0">
                      <X size={11} />
                    </button>
                  </div>
                  <div className="text-[10px] text-[#D94F3D]/70 font-mono mb-2">
                    Tri {alert.from} → {alert.to} · {alert.time}
                  </div>
                  <button
                    onClick={() => handleUpgrade(alert.id, alert.to)}
                    className="w-full flex items-center justify-center gap-1 bg-[#D94F3D] text-white text-[10px] font-bold py-1.5 rounded-lg border-none cursor-pointer hover:bg-[#c44033] transition-colors"
                  >
                    <ChevronUp size={10} /> Upgrader
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rescore status + refresh */}
        <div className="p-4 mt-auto">
          {lastRescore && (
            <div className={`flex items-center gap-1.5 text-[10px] font-mono mb-3 ${isRescoring ? 'text-[#4A9068]' : 'text-[#8A8785]'}`}>
              <RefreshCw size={9} className={isRescoring ? 'animate-spin' : ''} />
              {isRescoring ? 'Rescore en cours…' : `Rescoré à ${lastRescore.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}`}
            </div>
          )}
          <button
            onClick={fetchPatients}
            className="w-full flex items-center justify-center gap-2 text-xs font-mono text-[#8A8785] hover:text-[#2C3A52] border border-[#E4E1DC] hover:border-[#2C3A52]/30 py-2 rounded-lg transition-colors bg-transparent cursor-pointer"
          >
            <RefreshCw size={10} /> Actualiser
          </button>
          <p className="text-[9px] font-mono text-[#8A8785]/60 text-center mt-1.5">
            Auto · 30 s
          </p>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ══════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Toolbar */}
        <div className="bg-white border-b border-[#E4E1DC] px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Activity size={15} className="text-[#2C3A52]" />
            <div>
              <h1 className="text-sm font-bold text-[#1A1A18] leading-tight">File d'attente triée</h1>
              <p className="text-[10px] font-mono text-[#8A8785]">
                Classés par score · mise à jour toutes les 30 s
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8A8785]">
              <Clock size={11} />
              {clock.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
            </div>
            {isRescoring && (
              <span className="text-[10px] font-mono text-[#4A9068] flex items-center gap-1 animate-pulse">
                <RefreshCw size={9} className="animate-spin" /> Rescore…
              </span>
            )}
          </div>
        </div>

        {/* Table area */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[#8A8785]">
              <div className="w-8 h-8 border-2 border-[#E4E1DC] border-t-[#2C3A52] rounded-full animate-spin" />
              <p className="text-xs font-mono">Chargement des dossiers…</p>
            </div>
          ) : pts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-14 h-14 rounded-full bg-[#F0EDE8] flex items-center justify-center">
                <CheckCircle2 size={24} className="text-[#4A9068]" />
              </div>
              <p className="text-sm font-semibold text-[#1A1A18]">Aucun patient trié</p>
              <p className="text-xs text-[#8A8785] font-mono">La file d'attente est vide</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#F7F5F2] border-b border-[#E4E1DC]">
                  {['#','Ticket','Catégorie / Motif','Niveau de triage','Attente','Score de priorité','Constantes',''].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-[10px] font-mono font-bold text-[#8A8785] uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE8] bg-white">
                {pts.map((p, idx) => {
                  const lvl  = LEVELS[p.triageLevel] || LEVELS['5'];
                  const wait = Math.round(p.waitMinutes || 0);
                  const wm   = waitMeta(wait);
                  const v    = p.vitals || {};

                  return (
                    <tr
                      key={p._id}
                      className={`group hover:bg-[#F7F5F2] transition-colors
                        ${p.degraded ? 'border-l-[3px] border-l-[#D94F3D]' : 'border-l-[3px] border-l-transparent'}`}
                    >
                      {/* # */}
                      <td className="px-4 py-3.5 w-8 text-[11px] font-mono text-[#8A8785]">{idx+1}</td>

                      {/* Ticket */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {p.degraded && <span className="w-1.5 h-1.5 rounded-full bg-[#D94F3D] animate-pulse shrink-0" />}
                          <div>
                            <div className="font-mono text-sm font-bold text-[#1A1A18]">{p.ticketNumber}</div>
                            {p.createdAt && (
                              <div className="text-[10px] font-mono text-[#8A8785]">
                                {new Date(p.createdAt).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 max-w-[180px]">
                        <div className="text-sm font-medium text-[#1A1A18] truncate">{p.category || '—'}</div>
                        {p.complaint && (
                          <div className="text-[11px] text-[#8A8785] truncate mt-0.5">{p.complaint}</div>
                        )}
                      </td>

                      {/* Triage badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                          style={{ background:lvl.light, border:`1px solid ${lvl.border}`, color:lvl.bg }}>
                          <span className="w-4 h-4 rounded text-white font-black text-[9px] flex items-center justify-center"
                            style={{ background:lvl.bg }}>
                            {p.triageLevel}
                          </span>
                          {lvl.label}
                        </span>
                      </td>

                      {/* Wait */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className={`flex items-center gap-1 text-sm ${wm.cls}`}>
                          <Clock size={11} />
                          {wm.label}
                        </div>
                      </td>

                      {/* Score */}
                      <td className="px-4 py-3.5 w-36">
                        <ScoreBar score={p.score||0} />
                      </td>

                      {/* Vitals */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {v.fc   && <span className="text-[10px] font-mono bg-[#F0EDE8] px-1.5 py-0.5 rounded text-[#5C5A56]">FC {v.fc}</span>}
                          {v.spo2 && <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${v.spo2<92?'bg-[#D94F3D]/10 text-[#D94F3D]':'bg-[#F0EDE8] text-[#5C5A56]'}`}>SpO₂ {v.spo2}%</span>}
                          {v.pas  && <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${(v.pas>180||v.pas<80)?'bg-[#D97706]/10 text-[#D97706]':'bg-[#F0EDE8] text-[#5C5A56]'}`}>PA {v.pas}</span>}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Upgrade level */}
                          <button
                            onClick={() => handleUpgrade(p._id, suggestUpgrade(p.triageLevel))}
                            title={`Monter → Tri ${suggestUpgrade(p.triageLevel)}`}
                            className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#2C3A52] bg-[#2C3A52]/8 hover:bg-[#2C3A52]/15 px-2 py-1.5 rounded-lg border-none cursor-pointer transition-colors"
                          >
                            <TrendingUp size={10} />
                            Tri {suggestUpgrade(p.triageLevel)}
                          </button>
                          {/* Mark as done */}
                          <button
                            onClick={() => handleDone(p._id)}
                            title="Consultation terminée — retirer de la file"
                            className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-white bg-[#4A9068] hover:bg-[#3d7a57] px-2.5 py-1.5 rounded-lg border-none cursor-pointer transition-colors"
                          >
                            ✓ Terminer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Status bar */}
        <div className="bg-white border-t border-[#E4E1DC] px-6 py-2 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-mono text-[#8A8785]">
            {pts.length} patient{pts.length>1?'s':''} · {criticalCount} critique{criticalCount>1?'s':''}
          </span>
          <span className="text-[10px] font-mono text-[#8A8785]">
            {lastRescore
              ? `Dernier rescore : ${lastRescore.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}`
              : 'En attente du premier rescore…'}
          </span>
        </div>
      </div>
    </div>
  );
}
