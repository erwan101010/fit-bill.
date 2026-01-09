'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';

export function ComplianceStatus() {
  const [coachSiren, setCoachSiren] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoachCompliance();
  }, []);

  const loadCoachCompliance = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('siren')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setCoachSiren(profile.siren);
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la conformité:', err);
    } finally {
      setLoading(false);
    }
  };

  const isCompliant = !!coachSiren;

  if (loading) {
    return null;
  }

  return (
    <Link href="/dashboard/profile">
      <div
        className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer transition-all hover:shadow-lg ${
          isCompliant
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-300 hover:from-green-100 hover:to-emerald-100'
            : 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-300 hover:from-amber-100 hover:to-orange-100'
        }`}
      >
        {isCompliant ? (
          <>
            <CheckCircle2 size={18} className="flex-shrink-0" />
            <span>Conforme 2026</span>
          </>
        ) : (
          <>
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>Incomplet - Ajouter SIREN</span>
          </>
        )}
      </div>
    </Link>
  );
}
