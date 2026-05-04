
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className }) => {
  return (
    <div className={twMerge(clsx("bg-card border border-border rounded-xl p-5 mb-5 shadow-[0_1px_4px_rgba(26,20,10,0.07)]", className))}>
      {children}
    </div>
  );
};

export const SectionTitle = ({ children }) => (
  <div className="text-sm font-semibold uppercase text-text-muted mb-4 border-b border-border pb-1">
    {children}
  </div>
);

export const Input = ({ label, ...props }) => (
  <div className="mb-4 w-full">
    {label && <label className="block font-medium mb-1 text-sm">{label}</label>}
    <input 
      className="w-full p-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
      {...props} 
    />
  </div>
);

export const Select = ({ label, options, ...props }) => (
  <div className="mb-4 w-full">
    {label && <label className="block font-medium mb-1 text-sm">{label}</label>}
    <select 
      className="w-full p-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow bg-white"
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export const Button = ({ children, variant = 'primary', className, ...props }) => {
  const baseClass = "w-full p-3 rounded-md text-base font-semibold cursor-pointer transition-colors outline-none focus:ring-2 focus:ring-offset-1";
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 focus:ring-primary",
    secondary: "bg-white text-primary border border-primary hover:bg-gray-50 focus:ring-primary",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-600",
  };

  return (
    <button 
      className={twMerge(clsx(baseClass, variants[variant], className))}
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge = ({ title, value, variant = 'gray', className }) => {
  const bgColors = {
    '1': 'bg-[#e74c3c]',
    '2': 'bg-[#e67e22]',
    '3a': 'bg-[#9b59b6]',
    '3b': 'bg-[#2ecc71]',
    '4': 'bg-[#3498db]',
    '5': 'bg-[#95a5a6]',
    'gray': 'bg-[#95a5a6]'
  };

  return (
    <div className={twMerge(clsx("flex-1 p-4 rounded-lg text-white text-center shadow-md", bgColors[variant.toLowerCase()] || bgColors['gray'], className))}>
      <div className="text-xs uppercase opacity-90 mb-1 font-medium">{title}</div>
      <div className="text-3xl font-extrabold">{value}</div>
    </div>
  );
};

export const Modal = ({ isOpen, onClose, icon, title, subtitle, description, actionLabel, actionHref, variant = 'info' }) => {
  if (!isOpen) return null;

  const variants = {
    info:    { border: 'border-[#2C3A52]/20', iconBg: 'bg-[#2C3A52]/10', iconText: 'text-[#2C3A52]', btn: 'bg-[#2C3A52] hover:bg-[#2C3A52]/90' },
    warning: { border: 'border-[#D97706]/20', iconBg: 'bg-[#D97706]/10', iconText: 'text-[#D97706]', btn: 'bg-[#D97706] hover:bg-[#D97706]/90' },
    danger:  { border: 'border-[#D94F3D]/20', iconBg: 'bg-[#D94F3D]/10', iconText: 'text-[#D94F3D]', btn: 'bg-[#D94F3D] hover:bg-[#D94F3D]/90' },
  };
  const v = variants[variant] || variants.info;

  return (
    <div
      className="fixed inset-0 z-2000 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-text/40 backdrop-blur-sm" />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border-2 ${v.border} overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 pb-4 text-center">
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${v.iconBg} mb-4`}>
            <span className={`text-2xl ${v.iconText}`}>{icon}</span>
          </div>
          <h2 className="font-heading text-xl font-bold text-text mb-1">{title}</h2>
          {subtitle && (
            <p className="text-xs font-mono text-muted mb-3">{subtitle}</p>
          )}
          <p className="text-sm text-muted leading-relaxed">{description}</p>
        </div>
        <div className="px-6 pb-6 flex flex-col gap-2">
          {actionLabel && actionHref && (
            <a
              href={actionHref}
              className={`w-full py-3 rounded-xl text-white text-sm font-bold text-center ${v.btn} transition-colors block`}
              onClick={onClose}
            >
              {actionLabel}
            </a>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-semibold text-muted bg-bg hover:bg-border transition-colors border-none cursor-pointer"
          >
            Compris — Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
