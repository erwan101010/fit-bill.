'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { ComplianceBadge } from '../../components/ComplianceBadge';
import { supabase } from '@/utils/supabase';

interface CoachProfile {
  id: string;
  full_name: string;
  email: string;
  siren?: string;
  vat_number?: string;
  vat_regime?: string;
}

export default function CoachProfilePage() {
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    siren: '',
    vat_number: '',
    vat_regime: 'real', // 'franchise', 'real', 'micro'
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError('Vous devez être connecté');
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, siren, vat_number, vat_regime')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Erreur:', profileError);
        setError('Impossible de charger le profil');
        setLoading(false);
        return;
      }

      if (profileData) {
        setProfile(profileData as CoachProfile);
        setFormData({
          siren: profileData.siren || '',
          vat_number: profileData.vat_number || '',
          vat_regime: profileData.vat_regime || 'real',
        });
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError('Vous devez être connecté');
        setSaving(false);
        return;
      }

      // Validation SIREN (14 chiffres)
      if (formData.siren && !/^\d{14}$/.test(formData.siren)) {
        setError('Le SIREN doit contenir 14 chiffres');
        setSaving(false);
        return;
      }

      // Validation VAT (format FR + 11 caractères)
      if (formData.vat_number && !/^FR\d{11}$/.test(formData.vat_number)) {
        setError('Le numéro de TVA doit être au format FR + 11 chiffres');
        setSaving(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          siren: formData.siren || null,
          vat_number: formData.vat_number || null,
          vat_regime: formData.vat_regime,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (updateError) {
        setError('Erreur lors de la sauvegarde: ' + updateError.message);
        console.error(updateError);
      } else {
        setSuccess(true);
        await loadProfile();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError('Erreur lors de la sauvegarde: ' + err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const isCompliant = !!(formData.siren || formData.vat_number);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profil Coach</h1>
            <p className="text-gray-600 mt-1">Gérez vos informations fiscales et votre conformité 2026</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-gray-600 mt-4">Chargement du profil...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
              {/* Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 text-red-700">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                  ✓ Profil mis à jour avec succès!
                </div>
              )}

              {/* Informations générales */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={profile?.full_name || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Informations fiscales */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Informations fiscales (2026)</h2>
                  <ComplianceBadge siren={formData.siren} vat_number={formData.vat_number} />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Remplissez ces champs pour être conforme à la loi fiscale 2026 française.
                    Le SIREN (14 chiffres) est obligatoire si vous êtes en régime réel.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* SIREN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SIREN (14 chiffres)
                      <span className="text-gray-500 font-normal ml-2">
                        {formData.siren ? '✓' : '(optionnel)'}
                      </span>
                    </label>
                    <input
                      type="text"
                      name="siren"
                      value={formData.siren}
                      onChange={handleInputChange}
                      placeholder="Ex: 12345678901234"
                      maxLength={14}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Numéro d'identification de votre entreprise auprès de l'INSEE
                    </p>
                  </div>

                  {/* VAT Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de TVA intracommunautaire
                      <span className="text-gray-500 font-normal ml-2">
                        {formData.vat_number ? '✓' : '(optionnel)'}
                      </span>
                    </label>
                    <input
                      type="text"
                      name="vat_number"
                      value={formData.vat_number}
                      onChange={handleInputChange}
                      placeholder="Ex: FR12345678901"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Au format FR + 11 chiffres
                    </p>
                  </div>

                  {/* VAT Regime */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Régime TVA
                    </label>
                    <select
                      name="vat_regime"
                      value={formData.vat_regime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="franchise">Franchise de TVA</option>
                      <option value="micro">Micro-entreprise</option>
                      <option value="real">Régime réel</option>
                      <option value="other">Autre</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Votre régime fiscal pour la TVA
                    </p>
                  </div>
                </div>
              </div>

              {/* Compliance Status */}
              <div className="border-t border-gray-200 pt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">État de conformité</h3>
                {isCompliant ? (
                  <div className="flex items-center gap-3 text-green-700">
                    <div className="h-3 w-3 rounded-full bg-green-600"></div>
                    <p>
                      <strong>Conforme 2026:</strong> Votre profil coach contient les informations fiscales requises.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-amber-700">
                    <div className="h-3 w-3 rounded-full bg-amber-600"></div>
                    <p>
                      <strong>Incomplet:</strong> Ajoutez au moins un SIREN ou numéro de TVA pour être conforme.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={() => loadProfile()}
                  className="flex-1 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
