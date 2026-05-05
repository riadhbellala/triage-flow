// Mock doctor accounts for frontend-only demo.
// TODO (Supabase): Delete this file entirely once real auth is wired up.
// These credentials will live in Supabase Auth + doctors table.

export const mockDoctors = [
  {
    id: 1,
    email: 'docteur@triageflow.dz',
    password: 'demo1234',
    name: 'Dr. Amrani',
    role: 'Urgentiste',
  },
  {
    id: 2,
    email: 'admin@triageflow.dz',
    password: 'admin123',
    name: 'Dr. Benali',
    role: 'Chef de service',
  },
];
