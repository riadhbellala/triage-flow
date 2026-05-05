import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import WelcomeScreen    from './pages/WelcomeScreen';
import LoginScreen      from './pages/LoginScreen';
import OrientationScreen from './pages/OrientationScreen';
import TriageScreen     from './pages/TriageScreen';
import ResultScreen     from './pages/ResultScreen';
import GeneralistDashboard  from './pages/GeneralistDashboard';
import SpecialistDashboard  from './pages/SpecialistDashboard';
import ProtectedRoute   from './components/ProtectedRoute';
import { ChatSidebar }  from './components/ChatSidebar';
import useAuthStore     from './store/useAuthStore';
import useWaitingStore  from './store/useWaitingStore';
import triageLogo       from './assets/triage.png';
import {
  LayoutDashboard, ClipboardList,
  Stethoscope, FileCheck, Home, LogOut,
} from 'lucide-react';

/* ── Staff nav items ─────────────────────────────────── */
const NAV_ITEMS = [
  { to: '/dashboard-generalist', label: "File d'attente",   icon: LayoutDashboard, roles: ['staff','admin'] },
  { to: '/triage-setup',         label: 'Nouveau triage',   icon: ClipboardList,   roles: ['staff','admin'] },
  { to: '/dashboard-specialist', label: 'File spécialiste', icon: Stethoscope,     roles: ['specialist','admin'] },
];

// Routes that should render full-bleed (no max-w wrapper)
const FULL_BLEED_ROUTES = ['/dashboard-specialist'];

/* ── Staff shell ─────────────────────────────────────── */
const StaffShell = ({ children }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const doctor    = useAuthStore(s => s.doctor);
  const logout    = useAuthStore(s => s.logout);
  const waitingCount = useWaitingStore(
    s => s.waitingPatients.filter(p => p.status === 'waiting').length
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-bg overflow-hidden font-sans text-text">
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top header ── */}
        <header className="shrink-0 flex items-center justify-between px-6 py-3 bg-card border-b border-border">
          <Link to="/dashboard-generalist" className="flex items-center gap-2 no-underline hover:opacity-80 transition-opacity">
            <img src={triageLogo} alt="Logo" className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm" />
            <span className="text-xs font-mono text-muted hidden sm:inline">— Staff</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Live waiting badge */}
            {waitingCount > 0 && (
              <Link
                to="/dashboard-generalist"
                className="flex items-center gap-1.5 bg-danger/10 border border-danger/20 text-danger px-3 py-1.5 rounded-lg text-xs font-bold no-underline hover:bg-danger/20 transition-colors"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-danger" />
                </span>
                {waitingCount} en attente
              </Link>
            )}

            {/* Kiosk link */}
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 text-muted hover:text-primary text-xs font-medium no-underline transition-colors border border-border rounded-lg px-3 py-1.5"
            >
              <Home size={13} />
              Kiosque
            </Link>

            {/* Doctor name + logout */}
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-text leading-tight">{doctor?.name || 'Staff'}</div>
                <div className="text-[10px] font-mono text-muted">{doctor?.role || 'Médecin'}</div>
              </div>
              <button
                onClick={handleLogout}
                title="Se déconnecter"
                className="flex items-center gap-1.5 text-xs font-mono text-muted hover:text-danger transition-colors border-none bg-transparent cursor-pointer p-1.5 rounded-lg hover:bg-danger/5"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── Tab nav ── */}
        <nav className="shrink-0 flex items-center gap-1 px-4 py-2 bg-card border-b border-border overflow-x-auto">
          {NAV_ITEMS.filter(item => item.roles.includes(doctor?.role)).map(({ to, label, icon: Icon, roles }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold no-underline transition-all whitespace-nowrap
                  ${active
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted hover:text-primary hover:bg-primary/5'
                  }`}
              >
                <Icon size={15} />
                {label}
                {to === '/dashboard-generalist' && waitingCount > 0 && (
                  <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded-md
                    ${active ? 'bg-white/20 text-white' : 'bg-danger/10 text-danger'}`}>
                    {waitingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto">
          {FULL_BLEED_ROUTES.includes(location.pathname) ? (
            children
          ) : (
            <div className="max-w-5xl mx-auto w-full px-4 md:px-8 py-8 pb-20">
              {children}
            </div>
          )}
        </main>
      </div>

      <ChatSidebar />
    </div>
  );
};

/* ── App ─────────────────────────────────────────────── */
function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes — no shell */}
        <Route path="/"      element={<WelcomeScreen />} />
        <Route path="/login" element={<LoginScreen />} />

        {/* Protected staff routes — wrapped in shell */}
        <Route path="/*" element={
          <StaffShell>
            <Routes>
              <Route path="/dashboard-generalist" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><GeneralistDashboard /></ProtectedRoute>} />
              <Route path="/dashboard-specialist" element={<ProtectedRoute allowedRoles={['specialist', 'admin']}><SpecialistDashboard /></ProtectedRoute>} />
              <Route path="/triage-setup" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><OrientationScreen /></ProtectedRoute>} />
              <Route path="/triage"       element={<ProtectedRoute allowedRoles={['staff', 'admin']}><TriageScreen /></ProtectedRoute>} />
              <Route path="/result"       element={<ProtectedRoute allowedRoles={['staff', 'admin']}><ResultScreen /></ProtectedRoute>} />
              <Route path="*"             element={<Navigate to="/" replace />} />
            </Routes>
          </StaffShell>
        } />
      </Routes>
    </Router>
  );
}

export default App;
