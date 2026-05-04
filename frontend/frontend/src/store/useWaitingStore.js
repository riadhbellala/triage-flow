import { create } from 'zustand';

const useWaitingStore = create((set) => ({
  // Generalist queue — patients from orientation
  waitingPatients: [],
  setWaitingPatients: (patients) => set({ waitingPatients: patients }),

  // Specialist queue — patients after triage
  triagedPatients: [],
  setTriagedPatients: (patients) => set({ triagedPatients: patients }),

  // Current patient being triaged (set when generalist opens a patient)
  activePatient: null,
  setActivePatient: (patient) => set({ activePatient: patient }),
  clearActivePatient: () => set({ activePatient: null }),

  // Backward compatibility fields used by existing screens
  addPatient: (preRegData) => set((state) => {
    const ticketNum = `TK-${Date.now().toString().slice(-6)}`;
    const newPatient = {
      id: Date.now(),
      ticketNum,
      painLevel: preRegData.painLevel,
      symptomZone: preRegData.symptomZone,
      arrivedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status: 'waiting',
    };
    return { waitingPatients: [...state.waitingPatients, newPatient] };
  }),
  setInTriage: (id) => set((state) => ({
    waitingPatients: state.waitingPatients.map((p) =>
      (p.id === id || p._id === id) ? { ...p, status: 'in-triage' } : p
    ),
  })),
  markDone: (id) => set((state) => ({
    waitingPatients: state.waitingPatients.filter((p) => p.id !== id && p._id !== id),
  })),
  addTriagedPatient: (triagedData) => set((state) => ({
    triagedPatients: [{ ...triagedData }, ...state.triagedPatients],
  })),
}));

export default useWaitingStore;
