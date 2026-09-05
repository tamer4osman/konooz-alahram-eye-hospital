'use client';

import dynamic from 'next/dynamic';
import { useStaffAuth } from '@/context/StaffAuthContext';
import StaffLoginForm from '@/components/ops/StaffLoginForm';

const HospitalDashboard = dynamic(() => import('@/components/dashboard/HospitalDashboard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <p className="text-sm font-bold text-slate-300 animate-pulse">…</p>
    </div>
  ),
});

export default function OpsPage() {
  const { isServerAuthenticated, sessionChecked } = useStaffAuth();

  // Wait for the mount-time /me check so a logged-in staff member never sees
  // a login-form flash (D2: inline auth, no redirect loops).
  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-sm font-bold text-slate-300 animate-pulse">…</p>
      </div>
    );
  }

  return isServerAuthenticated ? <HospitalDashboard /> : <StaffLoginForm />;
}
