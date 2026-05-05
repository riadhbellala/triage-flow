import { useState } from 'react';
import {
  Scissors, FileText, ClipboardList, Home,
  Stethoscope, MapPin, X,
} from 'lucide-react';
import { createPatientTicket } from '../services/api';
import triageLogo from '../assets/triage.png';

/* ─── Orientation cases (bilingual) ─────────────────── */
const ORIENT_CASES = [
  {
    key: 'soins',
    icon: Scissors,
    fr: 'Problème suite de soins',
    ar: 'متابعة العلاج / الضمادات',
    descFr: 'Pansements, injections, soins post-opératoires',
    descAr: 'تغيير الضمادات، الحقن، الرعاية بعد العمليات',
    modal: {
      icon: '🩹',
      titleFr: 'Salle de soins', titleAr: 'قاعة العلاج',
      subtitleFr: 'Rez-de-chaussée — Bâtiment principal',
      subtitleAr: 'الطابق الأرضي — المبنى الرئيسي',
      descFr: "Rendez-vous à la salle de soins (rez-de-chaussée) pour vos pansements, injections ou soins post-opératoires.",
      descAr: "توجّه إلى قاعة العلاج في الطابق الأرضي من أجل تغيير الضمادات أو الحقن أو الرعاية بعد العملية.",
    },
  },
  {
    key: 'ordonnance',
    icon: FileText,
    fr: 'Renouvellement ordonnance',
    ar: 'تجديد الوصفة الطبية',
    descFr: 'Médicaments chroniques, traitements continus',
    descAr: 'الأدوية المزمنة، العلاجات المستمرة',
    modal: {
      icon: '📋',
      titleFr: 'Consultation externe', titleAr: 'الاستشارة الخارجية',
      subtitleFr: 'Bâtiment A — 1er étage',
      subtitleAr: 'المبنى أ — الطابق الأول',
      descFr: "Pour le renouvellement de vos ordonnances, veuillez vous rendre à la consultation externe ou consulter directement votre médecin traitant.",
      descAr: "لتجديد وصفتك الطبية، توجّه إلى قسم الاستشارة الخارجية أو راجع طبيبك المعالج مباشرة.",
    },
  },
  {
    key: 'certificat',
    icon: ClipboardList,
    fr: 'Examen / Certificat / Réquisition',
    ar: 'فحص / شهادة / طلب رسمي',
    descFr: 'Documents administratifs, aptitude, réquisition judiciaire',
    descAr: 'وثائق إدارية، لياقة بدنية، إحالة قضائية',
    modal: {
      icon: '📄',
      titleFr: 'Consultation externe', titleAr: 'الاستشارة الخارجية',
      subtitleFr: 'Bâtiment A — Accueil administratif',
      subtitleAr: 'المبنى أ — الاستقبال الإداري',
      descFr: "Les examens à des fins administratives, les certificats médicaux et les réquisitions sont traités à la consultation externe.",
      descAr: "يتم معالجة الفحوصات الإدارية والشهادات الطبية والإحالات في قسم الاستشارة الخارجية.",
    },
  },
  {
    key: 'social',
    icon: Home,
    fr: "Demande d'hébergement social",
    ar: 'طلب إيواء اجتماعي',
    descFr: 'Hébergement pour raison sociale ou familiale',
    descAr: 'إيواء لأسباب اجتماعية أو عائلية',
    modal: {
      icon: '🏠',
      titleFr: 'Service Social', titleAr: 'المصلحة الاجتماعية',
      subtitleFr: 'Bâtiment B — Bureau 12',
      subtitleAr: 'المبنى ب — مكتب 12',
      descFr: "Pour toute demande d'hébergement social, contactez le service social de l'établissement.",
      descAr: "لأي طلب إيواء اجتماعي، اتصل بالمصلحة الاجتماعية للمؤسسة.",
    },
  },
  {
    key: 'urgence',
    icon: Stethoscope,
    fr: "Consultation d'urgence",
    ar: 'استشارة طبية عاجلة',
    descFr: 'Je ne me sens pas bien — symptômes inquiétants',
    descAr: 'لا أشعر بتحسن — أعراض مقلقة',
    isUrgent: true,
  },
];

/* ─── Bilingual Modal ────────────────────────────────── */
const InfoModal = ({ card, onClose }) => {
  const m = card.modal;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div className="text-3xl">{m.icon}</div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#F0EDE8] flex items-center justify-center border-none cursor-pointer text-[#8A8785] hover:bg-[#E8E5E0] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* FR */}
        <div className="mb-5">
          <div className="text-base font-bold text-text mb-0.5">{m.titleFr}</div>
          <div className="text-xs font-mono text-[#4A9068] mb-2">{m.subtitleFr}</div>
          <p className="text-sm text-[#5C5A56] leading-relaxed">{m.descFr}</p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[#E8E5E0]" />
          <span className="text-[10px] font-mono text-[#8A8785] uppercase tracking-widest">بالعربية</span>
          <div className="flex-1 h-px bg-[#E8E5E0]" />
        </div>

        {/* AR */}
        <div dir="rtl" className="text-right">
          <div className="text-base font-bold text-[#1A1A18] mb-0.5">{m.titleAr}</div>
          <div className="text-xs font-mono text-[#4A9068] mb-2">{m.subtitleAr}</div>
          <p className="text-sm text-[#5C5A56] leading-relaxed">{m.descAr}</p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-[#2C3A52] text-white font-semibold text-sm py-2.5 rounded-xl border-none cursor-pointer hover:bg-[#243248] transition-colors"
        >
          Compris / حسناً
        </button>
      </div>
    </div>
  );
};

/* ─── Ticket Modal ───────────────────────────────────── */
const TicketModal = ({ ticket, onClose }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
    <div className="bg-white rounded-2xl p-8 max-w-xs w-full text-center shadow-2xl">
      <div className="w-14 h-14 rounded-full bg-[#4A9068]/10 flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🎫</span>
      </div>

      <div className="text-[10px] font-mono text-[#8A8785] uppercase tracking-widest mb-1">
        Votre ticket / تذكرتك
      </div>
      <div className="text-5xl font-black font-mono text-[#2C3A52] mb-5 tracking-tight">
        {ticket}
      </div>

      {/* FR */}
      <p className="text-sm text-[#5C5A56] leading-relaxed mb-2">
        Présentez ce numéro au médecin généraliste.
      </p>
      {/* AR */}
      <p className="text-sm text-[#5C5A56] leading-relaxed mb-5" dir="rtl">
        قدّم هذا الرقم للطبيب العام. ستُنادى حسب أولويتك.
      </p>

      <div className="w-full h-1.5 bg-[#F0EDE8] rounded-full mb-5 overflow-hidden">
        <div className="h-full w-1/3 bg-[#4A9068] rounded-full animate-pulse" />
      </div>

      <div className="text-xs font-mono font-bold text-[#4A9068] mb-1 uppercase tracking-wider">
        En attente / في الانتظار
      </div>
      <div className="text-[10px] text-[#8A8785]">Restez dans la salle d'attente — ابقَ في غرفة الانتظار</div>

      <button
        onClick={onClose}
        className="mt-6 text-xs text-[#8A8785] underline cursor-pointer bg-transparent border-none font-mono"
      >
        Fermer / إغلاق
      </button>
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────── */
const WelcomeScreen = () => {
  const [activeModal, setActiveModal]   = useState(null);
  const [ticket, setTicket]             = useState(null);
  const [ticketLoading, setTicketLoading] = useState(false);

  const handleUrgent = async () => {
    setTicketLoading(true);
    try {
      const data = await createPatientTicket();
      setTicket(data.ticket);
      sessionStorage.setItem('activePatientId', data.patientId);
    } catch {
      alert('Erreur de connexion. Réessayez. / خطأ في الاتصال، حاول مجدداً.');
    } finally {
      setTicketLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] flex flex-col">

      {/* Modals */}
      {activeModal && <InfoModal card={activeModal} onClose={() => setActiveModal(null)} />}
      {ticket      && <TicketModal ticket={ticket}   onClose={() => setTicket(null)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6 py-10 pb-24">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <img
            src={triageLogo}
            alt="TriageFlow"
            className="w-44 sm:w-56 h-auto object-contain drop-shadow-sm mb-3"
          />
          <div className="flex items-center gap-2">
            <div className="h-px w-10 bg-[#E8E5E0]" />
            <span className="text-[10px] font-mono text-[#8A8785] uppercase tracking-widest">
              Hôpital · مستشفى · Service des Urgences
            </span>
            <div className="h-px w-10 bg-[#E8E5E0]" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <p className="text-[10px] font-mono text-[#8A8785] uppercase tracking-[0.15em] mb-2">
            Étape 01 — التوجيه
          </p>
          {/* FR */}
          <h1 className="font-heading text-2xl font-bold text-[#1A1A18] leading-tight mb-1">
            Quelle est la raison de votre visite ?
          </h1>
          {/* AR */}
          <p className="text-lg font-semibold text-[#5C5A56]" dir="rtl">
            ما سبب زيارتك للمستشفى؟
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-3">
          {ORIENT_CASES.map((card, i) => {
            const Icon = card.icon;
            return (
              <button
                key={card.key}
                onClick={() => card.isUrgent ? handleUrgent() : setActiveModal(card)}
                className={`group relative w-full text-left bg-white border-2 rounded-2xl p-4 flex items-start gap-4 cursor-pointer transition-all duration-200 active:scale-[0.99] shadow-sm
                  ${card.isUrgent
                    ? 'border-[#D94F3D]/25 hover:border-[#D94F3D] hover:shadow-[0_0_0_4px_rgba(217,79,61,0.06)]'
                    : 'border-[#E8E5E0] hover:border-[#2C3A52]/30 hover:shadow-[0_0_0_4px_rgba(44,58,82,0.04)]'
                  }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5
                  ${card.isUrgent ? 'bg-[#D94F3D]/10' : 'bg-[#F0EDE8]'}`}
                >
                  <Icon size={17} className={card.isUrgent ? 'text-[#D94F3D]' : 'text-[#2C3A52]'} />
                </div>

                {/* Text block */}
                <div className="flex-1 min-w-0">
                  {/* FR */}
                  <div className={`text-sm font-bold leading-tight ${card.isUrgent ? 'text-[#D94F3D]' : 'text-[#1A1A18]'}`}>
                    {card.fr}
                  </div>
                  <div className="text-xs text-[#8A8785] mt-0.5">{card.descFr}</div>

                  {/* Divider */}
                  <div className="my-1.5 h-px bg-[#F0EDE8]" />

                  {/* AR */}
                  <div className="text-right" dir="rtl">
                    <div className={`text-sm font-bold leading-tight ${card.isUrgent ? 'text-[#D94F3D]' : 'text-[#1A1A18]'}`}>
                      {card.ar}
                    </div>
                    <div className="text-xs text-[#8A8785] mt-0.5">{card.descAr}</div>
                  </div>
                </div>

                {/* Right indicator */}
                <div className="shrink-0 flex items-center self-center ml-1">
                  {card.isUrgent ? (
                    <div className={`bg-[#D94F3D] text-white px-3 py-1.5 rounded-xl transition-all ${ticketLoading ? 'opacity-60' : ''}`}>
                      <span className="text-xs font-bold font-mono">
                        {ticketLoading ? '…' : '🎫'}
                      </span>
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-[#F0EDE8] flex items-center justify-center group-hover:bg-[#2C3A52] transition-colors">
                      <MapPin size={12} className="text-[#8A8785] group-hover:text-white transition-colors" />
                    </div>
                  )}
                </div>

                {/* Index */}
                <span className="absolute bottom-2 right-3 text-[9px] font-mono text-[#8A8785]/30">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
