const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';
const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// AUTH
export const loginDoctor = async (email, password) => {
  const res  = await fetch(`${BASE}/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Erreur de connexion');
  return data; // { token, user }
};

// ORIENTATION — public, no token needed
export const createPatientTicket = async () => {
  const res  = await fetch(`${BASE}/patients/orientation`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Ticket generation failed');
  return data; // { success, ticket, patientId }
};

// GENERALIST — get waiting patients
export const getWaitingPatients = async () => {
  const res  = await fetch(`${BASE}/patients/waiting`, {
    headers: authHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to fetch waiting patients');
  return data.patients;
};

// SPECIALIST — get triaged patients
export const getTriagedPatients = async () => {
  const res  = await fetch(`${BASE}/patients/triaged`, {
    headers: authHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to fetch triaged patients');
  return data.patients;
};

// Save triage result — moves patient to specialist queue
export const saveTriageResult = async (patientId, triageData) => {
  const res  = await fetch(`${BASE}/patients/${patientId}/triage`, {
    method:  'PUT',
    headers: authHeaders(),
    body:    JSON.stringify(triageData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to save triage result');
  return data.patient;
};

// Re-score all triaged patients
export const rescorePatients = async () => {
  const res  = await fetch(`${BASE}/patients/rescore`, {
    method:  'POST',
    headers: authHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Rescore failed');
  return data.patients;
};

// Upgrade patient triage level
export const upgradePatientLevel = async (patientId, newLevel) => {
  const res  = await fetch(`${BASE}/patients/${patientId}/upgrade`, {
    method:  'PUT',
    headers: authHeaders(),
    body:    JSON.stringify({ newLevel })
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Upgrade failed');
  return data.patient;
};

// Backend triage calculate (secondary)
export const calculateTriageBackend = async (vitals) => {
  const res  = await fetch(`${BASE}/triage/calculate`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify(vitals)
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Triage calculation failed');
  return data;
};

// Compatibility with existing screens that fetch triage categories.
export const getCategories = async () => {
  const res = await fetch(`${BASE}/triage/categories`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load categories');
  return data.categories;
};

// Compatibility exports used by legacy dashboard modules.
export const rescorePatient = async (patient) => {
  const res = await fetch(`${BASE}/triage/rescore`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ patient })
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Rescore failed');
  return { score: data.score, degraded: data.degraded };
};

// Mark patient as seen (specialist dismisses from queue)
export const markPatientDone = async (patientId) => {
  const res  = await fetch(`${BASE}/patients/${patientId}/done`, {
    method:  'PUT',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Mark done failed');
  return data.patient;
};

export const loginUser = async (email, password) => loginDoctor(email, password);
