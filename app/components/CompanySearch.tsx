'use client';

import { useEffect, useState } from 'react';

interface CompanyResult {
  siren: string;
  name: string;
  siret: string;
  address: string;
}

interface CompanySearchProps {
  onSelectCompany: (company: CompanyResult) => void;
  isB2B: boolean;
}

export function CompanySearch({ onSelectCompany, isB2B }: CompanySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CompanyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!query.trim() || !isB2B) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const delayTimer = setTimeout(() => {
      searchCompanies(query);
    }, 300);

    return () => clearTimeout(delayTimer);
  }, [query, isB2B]);

  const searchCompanies = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data.results) {
        const formatted = data.results.map((result: any) => ({
          siren: result.siren,
          name: result.nom_complet || result.denomination || result.nom_raison_sociale,
          siret: result.siret,
          address: `${result.adresse || ''}, ${result.code_postal || ''} ${result.commune_implantation || ''}`.trim(),
        }));
        setResults(formatted);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche entreprise:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (company: CompanyResult) => {
    onSelectCompany(company);
    setQuery('');
    setShowResults(false);
    setResults([]);
  };

  if (!isB2B) {
    return null;
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Rechercher une entreprise
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nom, SIREN, ou activité..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {showResults && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
            {results.map((company) => (
              <button
                key={company.siren}
                onClick={() => handleSelect(company)}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-200 last:border-b-0 transition-colors"
              >
                <div className="font-semibold text-gray-900">{company.name}</div>
                <div className="text-xs text-gray-600">SIREN: {company.siren}</div>
                <div className="text-xs text-gray-500">{company.address}</div>
              </button>
            ))}
          </div>
        )}

        {showResults && results.length === 0 && !loading && query && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-3">
            <p className="text-sm text-gray-500">Aucune entreprise trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}
