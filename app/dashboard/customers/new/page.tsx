'use client';

import { useState } from 'react';
import { Plus, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import { CompanySearch } from '../../components/CompanySearch';
import { supabase } from '../../utils/supabase';
import { useRouter } from 'next/navigation';

interface CompanyResult {
  siren: string;
  name: string;
  siret: string;
  address: string;
}

export default function AddCustomerPage() {
  const router = useRouter();
  const [isB2B, setIsB2B] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyResult | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    siren: '',
    vat_number: '',
    billing_address: '',
    service_address: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCompanySelect = (company: CompanyResult) => {
    setSelectedCompany(company);
    setFormData(prev => ({
      ...prev,
      full_name: company.name,
      siren: company.siren,
      billing_address: company.address,
      service_address: company.address,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation de base
      if (!formData.full_name || !formData.email) {
        setError('Le nom et l\'email sont obligatoires');
        setLoading(false);
        return;
      }

      if (isB2B && !formData.siren) {
        setError('Le SIREN est obligatoire pour un client B2B');
        setLoading(false);
        return;
      }

      // Récupérer la session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError('Vous devez être connecté');
        setLoading(false);
        return;
      }

      // Insérer le client dans Supabase
      const { data, error: insertError } = await supabase
        .from('customers')
        .insert([
          {
            coach_id: session.user.id,
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone || null,
            is_b2b: isB2B,
            siren: formData.siren || null,
            vat_number: formData.vat_number || null,
            billing_address: formData.billing_address || null,
            service_address: formData.service_address || null,
          },
        ])
        .select();

      if (insertError) {
        setError('Erreur lors de l\'ajout du client: ' + insertError.message);
        console.error(insertError);
        setLoading(false);
        return;
      }

      setSuccess(true);
      
      // Redirection après 2 secondes
      setTimeout(() => {
        router.push('/dashboard/customers');
      }, 2000);
    } catch (err: any) {
      setError('Erreur lors de l\'ajout du client: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/customers" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ajouter un client</h1>
              <p className="text-gray-600 mt-1">Créer un nouveau client (B2B ou B2C)</p>
            </div>
          </div>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-green-900 mb-2">✓ Client ajouté avec succès!</h2>
              <p className="text-green-700">Redirection vers la liste des clients...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 text-red-700">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {/* B2B Toggle */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isB2B}
                    onChange={(e) => setIsB2B(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                  />
                  <span className="text-lg font-medium text-gray-700">
                    Type: {isB2B ? 'Entreprise (B2B)' : 'Particulier (B2C)'}
                  </span>
                </label>
              </div>

              {/* Company Search for B2B */}
              {isB2B && (
                <CompanySearch onSelectCompany={handleCompanySelect} isB2B={isB2B} />
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom {isB2B ? 'de l\'entreprise' : 'complet'}*
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder={isB2B ? 'Ex: Acme Corporation' : 'Ex: Jean Dupont'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email*
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Ex: contact@example.fr"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Ex: 06 12 34 56 78"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* B2B Fields */}
              {isB2B && (
                <>
                  {/* SIREN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SIREN*
                    </label>
                    <input
                      type="text"
                      name="siren"
                      value={formData.siren}
                      onChange={handleInputChange}
                      placeholder="Ex: 12345678901234"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      maxLength={14}
                    />
                  </div>

                  {/* VAT Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro TVA
                    </label>
                    <input
                      type="text"
                      name="vat_number"
                      value={formData.vat_number}
                      onChange={handleInputChange}
                      placeholder="Ex: FR12345678901"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>

                  {/* Billing Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse de facturation
                    </label>
                    <textarea
                      name="billing_address"
                      value={formData.billing_address}
                      onChange={handleInputChange}
                      placeholder="Ex: 123 Rue de Paris, 75001 Paris"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Service Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse de prestation
                    </label>
                    <textarea
                      name="service_address"
                      value={formData.service_address}
                      onChange={handleInputChange}
                      placeholder="Ex: 456 Avenue des Champs, 75008 Paris"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/customers')}
                  className="flex-1 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  {loading ? 'Ajout en cours...' : 'Ajouter le client'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
