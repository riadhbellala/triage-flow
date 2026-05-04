import { useState } from 'react';
import {
  Scissors, FileText, ClipboardList, Home, Stethoscope, MapPin,
} from 'lucide-react';
import { Modal } from '../components/UI';
import { createPatientTicket } from '../services/api';
import triageLogo from '../assets/triage.png';

/* ── ORIENTATION CASES ───────────────────────────────── */
const ORIENT_CASES = [
  {
    key: 'soins',
    icon: Scissors,
    fr: 'Problème suite de soins',
    desc: 'Pansements, injections, soins post-opératoires',
    ar: 'متابعة علاج / ضمادات',
    modal: {
      icon: '🩹', variant: 'info',
      title: 'Salle de soins',
      subtitle: 'Rez-de-chaussée — Bâtiment principal',
      description: "Rendez-vous à la salle de soins (rez-de-chaussée) pour vos pansements, injections ou soins post-opératoires. Aucune consultation médicale n'est requise.",
    },
  },
  {
    key: 'ordonnance',
    icon: FileText,
    fr: 'Renouvellement ordonnance',
    desc: 'Médicaments chroniques, traitements continus',
    ar: 'تجديد وصفة طبية',
    modal: {
      icon: '📋', variant: 'info',
      title: 'Consultation externe',
      subtitle: 'Bâtiment A — 1er étage',
      description: "Pour le renouvellement de vos ordonnances, veuillez vous rendre à la consultation externe ou consulter directement votre médecin traitant en polyclinique.",
    },
  },
  {
    key: 'certificat',
    icon: ClipboardList,
    fr: 'Examen / Certificat / Réquisition',
    desc: 'Documents administratifs, aptitude, réquisition judiciaire',
    ar: 'شهادة طبية / وثيقة إدارية',
    modal: {
      icon: '📄', variant: 'info',
      title: 'Consultation externe',
      subtitle: 'Bâtiment A — Accueil administratif',
      description: "Les examens à des fins administratives, les certificats médicaux et les réquisitions sont traités à la consultation externe. Munissez-vous de votre pièce d'identité.",
    },
  },
  {
    key: 'social',
    icon: Home,
    fr: "Demande d'hébergement social",
    desc: 'Hébergement pour raison sociale ou familiale',
    ar: 'طلب إيواء اجتماعي',
    modal: {
      icon: '🏠', variant: 'warning',
      title: 'Service Social',
      subtitle: 'Bâtiment B — Bureau 12',
      description: "Pour toute demande d'hébergement social, contactez le service social de l'établissement. Ils vous orienteront vers les structures d'accueil disponibles.",
    },
  },
  {
    key: 'urgence',
    icon: Stethoscope,
    fr: "Consultation d'urgence",
    desc: 'Je ne me sens pas bien — symptômes inquiétants',
    ar: 'استشارة طبية عاجلة',
    isUrgent: true,
  },
];

/* ── COMPONENT ────────────────────────────────────────── */

const WelcomeScreen = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [ticketLoading, setTicketLoading] = useState(false);

  const handleCardClick = (card) => {
    if (card.isUrgent) {
      return;
    } else {
      setActiveModal(card);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* Info/Warning Modal (cases 01–04) */}
      {activeModal && (
        <Modal
          isOpen={!!activeModal}
          onClose={() => setActiveModal(null)}
          icon={activeModal.modal.icon}
          title={activeModal.modal.title}
          subtitle={activeModal.modal.subtitle}
          description={activeModal.modal.description}
          variant={activeModal.modal.variant}
        />
      )}
      {ticket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">
              Votre ticket
            </div>
            <div className="text-5xl font-bold font-mono text-[#2C3A52] mb-4">
              {ticket}
            </div>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              Presentez ce numero au medecin generaliste.
              Vous serez appele selon votre priorite.
            </p>
            <div className="w-full h-1 bg-[#F0EDE8] rounded-full mb-6">
              <div className="h-1 bg-[#4A9068] rounded-full w-1/3" />
            </div>
            <p className="text-xs font-mono text-[#4A9068] font-bold">
              EN ATTENTE - Restez dans la salle d'attente
            </p>
            <button
              onClick={() => setTicket(null)}
              className="mt-6 text-xs text-muted underline cursor-pointer bg-transparent border-none"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full px-6 py-10 pb-24">

        {/* Wordmark */}
        <div className="text-center mb-10 flex flex-col items-center w-full">
          <div className="flex justify-center mb-2">
            <img src={triageLogo} alt="TriageFlow Logo" className="w-48 sm:w-64 h-auto object-contain scale-[1.15] origin-top drop-shadow-sm" />
          </div>
          <div className="text-xs font-mono text-muted uppercase tracking-wider relative z-10 mt-1">Hôpital — Service des Urgences</div>
        </div>

        {/* ══ ORIENTATION CARDS ══ */}
        <>
          <div className="text-center mb-8">
            <p className="text-[10px] font-mono text-muted uppercase tracking-[0.15em] mb-2">
              Étape 01 — Orientation
            </p>
            <h1 className="font-heading text-3xl font-bold text-text mb-2 leading-tight">
              Quelle est la raison de votre visite ?
            </h1>
            <p className="text-base text-muted" style={{ direction: 'rtl' }}>
              ما سبب زيارتك؟
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {ORIENT_CASES.map((card, i) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.key}
                  onClick={() => {
                    if (card.isUrgent) {
                      (async () => {
                        setTicketLoading(true);
                        try {
                          const data = await createPatientTicket();
                          setTicket(data.ticket);
                          sessionStorage.setItem('activePatientId', data.patientId);
                        } catch (e) {
                          alert("Erreur de connexion. Reessayez.");
                        } finally {
                          setTicketLoading(false);
                        }
                      })();
                      return;
                    }
                    handleCardClick(card);
                  }}
                  className={`group relative w-full text-left bg-card border-2 rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all duration-200 active:scale-[0.99]
                    ${card.isUrgent
                      ? 'border-danger/30 hover:border-danger hover:bg-danger/5'
                      : 'border-border hover:border-primary hover:bg-primary/5'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                    ${card.isUrgent ? 'bg-danger/10' : 'bg-[#F0EDE8]'}`}
                  >
                    <Icon size={18} className={card.isUrgent ? 'text-danger' : 'text-primary'} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold leading-snug
                      ${card.isUrgent ? 'text-danger' : 'text-text'}`}
                    >
                      {card.fr}
                    </div>
                    <div className="text-xs text-muted mt-0.5">{card.desc}</div>
                  </div>

                  {card.isUrgent ? (
                    <div className="shrink-0 bg-danger/10 text-danger px-2.5 py-1.5 rounded-lg">
                      <span className="text-xs font-bold font-mono">
                        {ticketLoading ? '...' : 'Ticket'}
                      </span>
                    </div>
                  ) : (
                    <MapPin size={14} className="text-muted/30 shrink-0 group-hover:text-primary/50 transition-colors" />
                  )}

                  <span className="absolute bottom-2 right-4 text-[9px] font-mono text-muted/20">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      </div>

      {/* Emergency strip */}
      <button
        onClick={() => alert('Signalez-vous immédiatement au personnel médical !')}
        className="fixed bottom-0 left-0 right-0 bg-danger text-white text-center py-4 px-4 text-sm font-semibold cursor-pointer hover:bg-danger/90 transition-colors z-50 w-full border-none"
      >
        Urgence immédiate — Appuyez ici / اضغط هنا في حالة طارئة
      </button>
    </div>
  );
};

export default WelcomeScreen;
