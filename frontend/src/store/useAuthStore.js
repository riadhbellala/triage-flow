import { create } from 'zustand';

const useAuthStore = create((set) => ({
  doctor:          JSON.parse(localStorage.getItem('doctor')) || null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: (doctorData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('doctor', JSON.stringify(doctorData));
    set({ doctor: doctorData, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('doctor');
    set({ doctor: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
