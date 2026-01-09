'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Edit, Trash2, Eye, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import { ComplianceBadge } from '../components/ComplianceBadge';
import { getAllCustomers, updateCustomer, B2BCustomer } from '../utils/complianceStorage';

export default function ClientsPage() {
  const [customers, setCustomers] = useState<B2BCustomer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<B2BCustomer | null>(null);

  useEffect(() => {
    // Charger les clients depuis localStorage
    const loadCustomers = async () => {
      setLoading(true);
      try {
        const data = getAllCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.siren?.includes(searchQuery) || false)
  );

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client?')) {
      setCustomers(customers.filter(c => c.id !== id));
      setSelectedCustomer(null);
    }
  };

  const b2bCount = customers.filter(c => c.is_b2b).length;
  const b2cCount = customers.filter(c => !c.is_b2b).length;
  const compliantCount = customers.filter(c => c.siren || c.vat_number).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
              <p className="text-gray-600 mt-1">Gérez vos clients et leur conformité 2026</p>
            </div>
            <Link
              href="/clients/add"
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Ajouter un client
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Total clients</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{customers.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Clients B2B</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{b2bCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Clients B2C</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{b2cCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Conformes 2026</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{compliantCount}</p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, email ou SIREN..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Clients List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-gray-600 mt-4">Chargement des clients...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun client trouvé</h2>
              <p className="text-gray-600 mb-6">Commencez à ajouter des clients pour les gérer ici.</p>
              <Link
                href="/clients/add"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Ajouter le premier client
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nom / Entreprise</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">SIREN / TVA</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Conformité</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            customer.is_b2b
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {customer.is_b2b ? 'B2B' : 'B2C'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {customer.siren && (
                            <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded w-fit">
                              {customer.siren}
                            </div>
                          )}
                          {customer.vat_number && (
                            <div className="font-mono text-xs text-gray-500 mt-1">{customer.vat_number}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <ComplianceBadge siren={customer.siren} vat_number={customer.vat_number} />
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedCustomer(customer)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Voir les détails"
                            >
                              <Eye size={18} />
                            </button>
                            <Link
                              href={`/clients/${customer.id}/edit`}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Éditer"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => handleDelete(customer.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Detail Modal */}
          {selectedCustomer && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Détails du client</h2>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Infos générales */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Nom</p>
                        <p className="text-lg font-medium text-gray-900">{selectedCustomer.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-lg font-medium text-gray-900">{selectedCustomer.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Téléphone</p>
                        <p className="text-lg font-medium text-gray-900">{selectedCustomer.phone || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Type</p>
                        <p className="text-lg font-medium text-gray-900">{selectedCustomer.is_b2b ? 'B2B' : 'B2C'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Infos B2B */}
                  {selectedCustomer.is_b2b && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        Informations B2B
                        <ComplianceBadge
                          siren={selectedCustomer.siren}
                          vat_number={selectedCustomer.vat_number}
                        />
                      </h3>
                      <div className="space-y-4">
                        {selectedCustomer.siren && (
                          <div>
                            <p className="text-sm text-gray-600">SIREN</p>
                            <p className="text-lg font-mono font-medium text-gray-900">{selectedCustomer.siren}</p>
                          </div>
                        )}
                        {selectedCustomer.vat_number && (
                          <div>
                            <p className="text-sm text-gray-600">Numéro TVA</p>
                            <p className="text-lg font-mono font-medium text-gray-900">{selectedCustomer.vat_number}</p>
                          </div>
                        )}
                        {selectedCustomer.billing_address && (
                          <div>
                            <p className="text-sm text-gray-600">Adresse de facturation</p>
                            <p className="text-lg font-medium text-gray-900">{selectedCustomer.billing_address}</p>
                          </div>
                        )}
                        {selectedCustomer.service_address && (
                          <div>
                            <p className="text-sm text-gray-600">Adresse de prestation</p>
                            <p className="text-lg font-medium text-gray-900">{selectedCustomer.service_address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-4 border-t border-gray-200 pt-6">
                    <Link
                      href={`/clients/${selectedCustomer.id}/edit`}
                      className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                    >
                      Éditer
                    </Link>
                    <button
                      onClick={() => {
                        handleDelete(selectedCustomer.id);
                      }}
                      className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      Supprimer
                    </button>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
