import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useTriageStore from '../store/useTriageStore';
import { getCategories } from '../services/api';
import { ArrowRight } from 'lucide-react';

const OrientationScreen = () => {
  const navigate = useNavigate();
  const { patient, setPatientDetails, setCategory } = useTriageStore();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(err => console.error('Failed to load categories:', err));
  }, []);

  const handleCategorySelect = (category) => {
    setCategory(category);
    navigate('/triage');
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 w-full">
      
      {/* Header */}
      <div className="mb-10 text-left">
        <h1 className="text-4xl md:text-5xl font-bold font-heading text-text mb-3 tracking-tight">Accueil Triage</h1>
        <p className="text-muted font-sans text-base">Identifiez le patient et sélectionnez la catégorie médicale.</p>
      </div>

      {/* Patient Identity Form - Big White Card */}
      <div className="bg-white border border-border rounded-2xl p-6 mb-10 shadow-sm">
        <h2 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-4 ml-1">
          Identité du Patient
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <input 
              type="text"
              placeholder="Nom Complet" 
              value={patient.name}
              onChange={(e) => setPatientDetails({ name: e.target.value })}
              className="w-full bg-bg border-none rounded-xl px-4 py-3.5 text-sm text-text font-semibold placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="md:col-span-3">
            <div className="relative">
              <input 
                type="number"
                placeholder="Âge" 
                value={patient.age}
                onChange={(e) => setPatientDetails({ age: e.target.value })}
                className="w-full bg-bg border-none rounded-xl px-4 py-3.5 text-sm text-text font-semibold placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
              </div>
            </div>
          </div>
          <div className="md:col-span-3">
            <div className="relative">
              <select 
                value={patient.sex}
                onChange={(e) => setPatientDetails({ sex: e.target.value })}
                className="w-full bg-bg border-none rounded-xl px-4 py-3.5 text-sm text-text font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
              >
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                ▼
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Section */}
      <div>
        <h2 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-4 ml-1">
          Catégorie Principale
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.length === 0 ? (
            <div className="col-span-full text-center text-muted text-sm py-6">Chargement...</div>
          ) : categories.map((cat) => {
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat)}
                className="group bg-white border border-border rounded-xl p-5 cursor-pointer flex items-center justify-between min-h-[72px] hover:bg-[#F0EDE8] hover:border-border transition-all duration-200"
              >
                <span className="text-sm font-bold text-text text-left leading-snug">
                  {cat.name}
                </span>
                
                <ArrowRight 
                  size={16} 
                  className="opacity-0 text-primary transition-all duration-200 transform group-hover:opacity-100" 
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrientationScreen;
