import { create } from 'zustand';

const useTriageStore = create((set) => ({
  patient: {
    name: '',
    age: '',
    sex: 'M',
  },
  currentCat: null,
  vitals: {
    fc: '',
    pas: '',
    spo2: '',
    fr: '',
    temp: '',
    glyc: ''
  },
  complaint: '',
  signs: [],
  result: null,

  setPatientDetails: (details) => set((state) => ({ patient: { ...state.patient, ...details } })),
  setCategory: (category) => set({ currentCat: category }),
  setVitals: (vitals) => set((state) => ({ vitals: { ...state.vitals, ...vitals } })),
  setComplaint: (complaint) => set({ complaint, signs: [] }),
  toggleSign: (sign) => set((state) => {
    const signs = state.signs.includes(sign)
      ? state.signs.filter((s) => s !== sign)
      : [...state.signs, sign];
    return { signs };
  }),
  setResult: (result) => set({ result }),
  resetTriage: () => set({
    patient: { name: '', age: '', sex: 'M' },
    currentCat: null,
    vitals: { fc: '', pas: '', spo2: '', fr: '', temp: '', glyc: '' },
    complaint: '',
    signs: [],
    result: null
  })
}));

export default useTriageStore;
