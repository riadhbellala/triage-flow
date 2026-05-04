import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send} from 'lucide-react';
import clsx from 'clsx';
import { getDifferentialDiagnosis } from '../services/groqService';
import useTriageStore from '../store/useTriageStore';

export const ChatSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Bonjour ! Je suis l'IA de TriageFlow. Comment puis-je vous aider dans votre évaluation ?", time: 'Maintenant' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [differentials, setDifferentials] = useState(null);
  const [isDiagLoading, setIsDiagLoading] = useState(false);
  const [diagError, setDiagError] = useState(null);

  const { currentCat, complaint, signs, vitals } = useTriageStore();

  const handleDifferential = async () => {
    setIsDiagLoading(true);
    setDiagError(null);
    setDifferentials(null);
    try {
      const result = await getDifferentialDiagnosis({
        currentCat, complaint, signs, vitals
      });
      setDifferentials(result.differentials);
    } catch (e) {
      setDiagError("Erreur d'analyse. Vérifiez les données patient et la configuration Groq.");
      console.error('Diagnostic Groq error:', e);
    } finally {
      setIsDiagLoading(false);
    }
  };

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = (text = input) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text, time: 'Maintenant' }]);
    setInput('');
    setIsLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'ai', text: "Analyse en cours... (Simulé)", time: 'Maintenant' }]);
      setIsLoading(false);
    }, 1500);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const firstUserMsgIndex = messages.findIndex(m => m.sender === 'user');

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={toggleChat}
        className={clsx(
          "fixed right-6 bottom-6 rounded-xl px-4 py-3 bg-primary text-white border-none cursor-pointer shadow-lg z-1001 flex items-center justify-center gap-2 hover:shadow-xl hover:translate-y-[-2px] transition-all duration-200",
          isOpen ? "hidden" : "flex"
        )}
      >
        <MessageSquare size={16} className="text-white" />
        <span className="font-bold text-sm">AI</span>
        <div className="w-2 h-2 rounded-full bg-danger absolute -top-1 -right-1" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-text/5 backdrop-blur-sm z-999 transition-all duration-300"
          onClick={toggleChat}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          "fixed right-0 top-0 h-full w-[380px] bg-white flex flex-col transition-transform duration-200 ease-out z-1000 shadow-xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ZONE 1 — HEADER */}
        <div className="p-5 bg-primary text-white border-b border-white/10 z-10 flex flex-col gap-1">
          <div className="flex justify-between items-start">
            <span className="font-heading text-lg font-bold text-white">TriageFlow AI</span>
            <button onClick={toggleChat} className="text-white/60 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/60 font-mono">En ligne · Assistant médical</span>
          </div>
        </div>

        {/* ZONE 2 — MESSAGES AREA */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-bg">
          {messages.map((msg, idx) => {
            const isFirstUserMsg = idx === firstUserMsgIndex;
            return (
              <div key={idx} className={`flex flex-col ${msg.sender === 'ai' ? 'items-start' : 'items-end'}`}>

                {/* Labels */}
                {msg.sender === 'ai' && idx === 0 && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-3 h-3 rounded-sm bg-primary" />
                    <span className="text-[9px] font-mono text-muted uppercase tracking-wider">TriageFlow AI</span>
                  </div>
                )}
                {msg.sender === 'user' && isFirstUserMsg && (
                  <div className="text-[9px] font-mono text-muted/60 mb-1 self-end text-right">Vous</div>
                )}

                {/* Bubbles */}
                <div
                  className={clsx(
                    "p-3.5 text-sm max-w-[88%]",
                    msg.sender === 'ai'
                      ? "bg-white rounded-xl rounded-tl-none border border-border border-l-[3px] border-l-primary/40 text-text self-start"
                      : "bg-primary text-white rounded-xl rounded-tr-none self-end"
                  )}
                >
                  {msg.text}
                </div>

                {/* Timestamps */}
                <div className={clsx(
                  "text-[9px] font-mono mt-1.5",
                  msg.sender === 'ai' ? "text-muted ml-1" : "text-muted/50 self-end mr-1"
                )}>
                  {msg.time}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex flex-col items-start">
              <div className="bg-white rounded-xl rounded-tl-none p-3.5 border border-border border-l-[3px] border-l-primary/40 max-w-[88%] self-start">
                <div className="flex items-center gap-1.5 h-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Replies -> Diagnostic Différentiel */}
          {messages.length === 1 && !isLoading && (
            <div className="mt-3 animate-in fade-in duration-300">
              <button
                onClick={handleDifferential}
                disabled={isDiagLoading || !complaint}
                className={`w-full flex items-center justify-center gap-2
                  border-2 rounded-xl px-4 py-3 text-sm font-semibold
                  transition-all duration-200
                  ${isDiagLoading || !complaint
                    ? 'border-[#E8E5E0] text-muted/40 cursor-not-allowed bg-white'
                    : 'border-[#2C3A52] text-[#2C3A52] bg-white hover:bg-[#2C3A52] hover:text-white'
                  }`}
              >
                {isDiagLoading
                  ? (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-current
                          animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-current
                          animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-current
                          animate-bounce [animation-delay:300ms]" />
                      </div>
                      Analyse en cours...
                    </div>
                  )
                  : '🔬 Diagnostic Différentiel'
                }
              </button>
              {!complaint && (
                <p className="text-[10px] font-mono text-muted/50 text-center mt-2">
                  Sélectionnez un motif dans le triage pour activer
                </p>
              )}
            </div>
          )}

          {diagError && (
            <div className="bg-[#D94F3D]/8 border border-[#D94F3D]/25
              rounded-xl p-3 mt-2">
              <p className="text-xs text-[#D94F3D] font-medium">{diagError}</p>
            </div>
          )}

          {differentials && differentials.length > 0 && (
            <div className="bg-white border border-[#E8E5E0]
              rounded-xl overflow-hidden mt-2">

              <div className="px-4 py-3 border-b border-[#E8E5E0]
                flex items-center gap-2">
                <span className="text-xs font-bold text-[#1A1A18]
                  uppercase tracking-wider font-mono">
                  🔬 Diagnostic Différentiel
                </span>
              </div>

              <div className="divide-y divide-[#E8E5E0]">
                {differentials.map((item, idx) => {
                  const probColor = {
                    'élevée':  { dot: 'bg-[#D94F3D]', text: 'text-[#D94F3D]' },
                    'moyenne': { dot: 'bg-[#D97706]', text: 'text-[#D97706]' },
                    'faible':  { dot: 'bg-[#4A9068]', text: 'text-[#4A9068]' },
                  }[item.probability] || { dot: 'bg-muted', text: 'text-muted' };

                  return (
                    <div key={idx} className="px-4 py-3 flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5
                        shrink-0 ${probColor.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-[#1A1A18]
                            leading-tight">
                            {item.diagnosis}
                          </span>
                          <span className={`text-[10px] font-mono font-bold
                            shrink-0 ${probColor.text}`}>
                            {item.probability}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted mt-0.5 leading-snug">
                          {item.key_sign}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-4 py-2.5 bg-[#F7F5F2]
                border-t border-[#E8E5E0]">
                <p className="text-[10px] font-mono text-muted/70 text-center">
                  ⚠️ Aide à la décision uniquement —
                  ne remplace pas le jugement médical
                </p>
              </div>

            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ZONE 3 — INPUT AREA */}
        <div className="p-4 bg-white border-t border-border flex flex-col gap-2">
          <div className="h-[14px]">
            {input.length > 0 && (
              <div className="text-[9px] font-mono text-muted/40 text-right w-full">
                {input.length} / 200
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              maxLength={200}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && input.trim() && sendMessage()}
              placeholder="Posez votre question..."
              className="flex-1 border-b-2 border-border focus:border-primary pb-1.5 text-sm bg-transparent placeholder:text-muted/40 focus:outline-none transition-colors duration-200"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              className={clsx(
                "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0",
                input.trim()
                  ? "bg-primary text-white hover:bg-primary/90 cursor-pointer"
                  : "bg-[#F0EDE8] text-muted/40 cursor-not-allowed"
              )}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
