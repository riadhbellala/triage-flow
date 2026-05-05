import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Shield, Stethoscope, HeartPulse, Building2, CheckSquare, Square } from 'lucide-react';
import { loginDoctor } from '../services/api';
import useAuthStore from '../store/useAuthStore';
import triageLogo from '../assets/triage.png';

// TODO (Supabase): Replace the setTimeout block in handleLogin with actual auth logic

/* ── Mini dashboard preview (right panel) ────────────── */
const PREVIEW_PATIENTS = [
  { name: 'Ahmed K.',  tri: '1',  score: 187, complaint: 'Douleur thoracique', color: '#EF4444' }, // Red-500
  { name: 'Fatima Z.', tri: '2',  score: 152, complaint: 'Dyspnée',            color: '#F59E0B' }, // Amber-500
  { name: 'Karim M.',  tri: '3A', score: 98,  complaint: 'Douleur abdo',       color: '#8B5CF6' }, // Violet-500
  { name: 'Nadia B.',  tri: '3B', score: 74,  complaint: 'Céphalée',           color: '#10B981' }, // Emerald-500
];

const DashboardPreview = () => (
  <div className="w-full rounded-[20px] overflow-hidden bg-white shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
    {/* Browser/App Chrome */}
    <div className="bg-[#F8FAFC] border-b border-slate-100 flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
          <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
          <div className="w-3 h-3 rounded-full bg-[#10B981]" />
        </div>
        <span className="text-xs font-semibold text-slate-400 ml-2 font-sans tracking-wide">TriageFlow</span>
      </div>
      <div className="bg-emerald-100 text-emerald-600 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider">
        LIVE
      </div>
    </div>

    {/* Dashboard Content */}
    <div className="p-5">
      <h3 className="font-heading font-bold text-slate-800 text-lg mb-4">File d'attente (Temps Réel)</h3>
      
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total", value: '42', color: 'text-slate-800', bg: 'bg-slate-50' },
          { label: 'Urgence', value: '15', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Critique', value: '3', color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl px-3 py-3 border border-slate-100`}>
            <div className={`font-mono font-black text-2xl leading-none ${s.color}`}>{s.value}</div>
            <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Patient rows */}
      <div className="flex flex-col gap-2">
        {PREVIEW_PATIENTS.map((p, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 bg-white shadow-sm"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0 shadow-inner"
              style={{ background: p.color }}
            >
              {p.tri}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-800 truncate">{p.name}</div>
              <div className="text-[11px] font-medium text-slate-500 truncate mt-0.5">{p.complaint}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Score</div>
              <div className="font-mono text-sm font-black" style={{ color: p.score >= 120 ? '#EF4444' : p.score >= 80 ? '#F59E0B' : '#94A3B8' }}>
                {p.score}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ── Main component ──────────────────────────────────── */
const LoginScreen = () => {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [agreed, setAgreed]     = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await loginDoctor(email, password);
      login(data.user, data.token);
      if (data.user.role === 'specialist') {
        navigate('/dashboard-specialist');
      } else {
        navigate('/dashboard-generalist');
      }
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">

      {/* ════════════════════════════════════
          LEFT — Form panel
      ════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen justify-between relative px-8 py-8 sm:px-12 md:px-20 lg:px-24 xl:px-32">
        


        {/* Form section */}
        <div className="w-full max-w-md my-auto py-12">
          {/* Logo */}
          <div className="flex justify-start mb-8 sm:mb-12">
            <img src={triageLogo} alt="Logo" className="w-56 sm:w-72 h-auto object-contain scale-125 sm:scale-150 origin-top-left drop-shadow-sm" />
          </div>

          <h1 className="font-heading text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Bienvenue
          </h1>
          <p className="text-base text-slate-500 font-medium mb-10">
            Entrez vos identifiants professionnels pour accéder au système de triage médical.
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">

            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-bold text-slate-700 mb-2">
                Adresse Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null); }}
                placeholder="docteur@hopital.dz"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#2C3A52] focus:ring-4 focus:ring-[#2C3A52]/10 transition-all shadow-sm"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="login-password" className="block text-sm font-bold text-slate-700">
                  Mot de passe
                </label>
                <button type="button" className="text-sm font-bold text-[#2C3A52] hover:underline bg-transparent border-none cursor-pointer">
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(null); }}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 pr-12 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#2C3A52] focus:ring-4 focus:ring-[#2C3A52]/10 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-2 bg-transparent border-none cursor-pointer"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => { setAgreed(!agreed); setError(null); }}
                className="text-[#2C3A52] bg-transparent border-none p-0 cursor-pointer flex shrink-0"
              >
                {agreed ? <CheckSquare size={20} className="text-[#2C3A52]" /> : <Square size={20} className="text-slate-300 hover:text-slate-400" />}
              </button>
              <label className="text-sm font-medium text-slate-600 cursor-pointer select-none" onClick={() => { setAgreed(!agreed); setError(null); }}>
                Je confirme être un professionnel de santé habilité.
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-4 rounded-xl bg-[#2C3A52] text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-[#1e2838] active:scale-[0.99] transition-all border-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-slate-300 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Connexion...
                </>
              ) : (
                'Connexion à l\'espace'
              )}
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="text-sm font-medium text-slate-400">
          © 2026 TriageFlow. Tous droits réservés.
        </div>
      </div>

      {/* ════════════════════════════════════
          RIGHT — Branded panel (like reference)
      ════════════════════════════════════ */}
      <div className="hidden lg:flex flex-1 p-6">
        <div className="w-full h-full rounded-[32px] bg-[#2C3A52] relative overflow-hidden flex flex-col justify-between p-12 lg:p-16">
          
          {/* Abstract Background Elements */}
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#3b4b66] blur-3xl opacity-50 pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#1e2838] blur-3xl opacity-80 pointer-events-none" />
          
          {/* Top text */}
          <div className="relative z-10 max-w-lg">
            <h2 className="font-heading text-4xl lg:text-5xl font-extrabold text-white leading-[1.15] mb-6">
              Optimisez la gestion<br />
              des flux d'urgences
            </h2>
            <p className="text-lg font-medium text-slate-300 leading-relaxed">
              Le système de triage intelligent basé sur le protocole FRENCH Pro. Gagnez en efficacité et priorisez les soins vitaux.
            </p>
          </div>

          {/* Floating UI Card */}
          <div className="relative z-10 w-full max-w-md mx-auto my-12 transform perspective-1000 rotate-1 xl:rotate-2 xl:translate-x-4">
            <div className="absolute inset-0 bg-white/5 rounded-[24px] blur-xl transform translate-y-4 pointer-events-none" />
            <DashboardPreview />
          </div>

          {/* Bottom logos / Trust indicators */}
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 text-white font-bold text-lg"><Shield size={24}/> SFMU</div>
              <div className="flex items-center gap-2 text-white font-bold text-lg"><Building2 size={24}/> CHU</div>
              <div className="flex items-center gap-2 text-white font-bold text-lg"><HeartPulse size={24}/> FRENCH Pro</div>
              <div className="flex items-center gap-2 text-white font-bold text-lg"><Stethoscope size={24}/> OMS</div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default LoginScreen;
