// Mock data for B2B clients and compliance features
// This is used when Supabase is not available

export interface B2BCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_b2b: boolean;
  siren?: string;
  vat_number?: string;
  billing_address?: string;
  service_address?: string;
  created_at: string;
}

export interface Coach {
  id: string;
  full_name: string;
  email: string;
  siren?: string;
  vat_number?: string;
  vat_regime?: string;
  created_at: string;
}

// Mock B2B customers
export const mockB2BCustomers: B2BCustomer[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.fr',
    phone: '01 23 45 67 89',
    is_b2b: true,
    siren: '12345678901234',
    vat_number: 'FR12345678901',
    billing_address: '123 Rue de Paris, 75001 Paris',
    service_address: '456 Avenue des Champs, 75008 Paris',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Global Tech Solutions',
    email: 'hello@globaltech.fr',
    phone: '01 98 76 54 32',
    is_b2b: true,
    siren: '98765432109876',
    vat_number: 'FR98765432109',
    billing_address: '789 Boulevard Saint-Germain, 75005 Paris',
    service_address: '789 Boulevard Saint-Germain, 75005 Paris',
    created_at: new Date().toISOString(),
  },
];

// Mock B2C customers
export const mockB2CCustomers: B2BCustomer[] = [
  {
    id: '3',
    name: 'Mathieu Dupont',
    email: 'mathieu.dupont@email.com',
    phone: '06 12 34 56 78',
    is_b2b: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Chloé Martin',
    email: 'chloe.martin@email.com',
    phone: '06 98 76 54 32',
    is_b2b: false,
    created_at: new Date().toISOString(),
  },
];

// Mock coach
export const mockCoach: Coach = {
  id: 'coach-001',
  full_name: 'Jean Dupont Coach',
  email: 'coach@fitbill.fr',
  siren: '12345678901234',
  vat_number: 'FR12345678901',
  vat_regime: 'real',
  created_at: new Date().toISOString(),
};

// Utility functions to fetch/update mock data from localStorage
export function getAllCustomers(): B2BCustomer[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('fitbill_customers');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [...mockB2BCustomers, ...mockB2CCustomers];
    }
  }
  
  const allCustomers = [...mockB2BCustomers, ...mockB2CCustomers];
  localStorage.setItem('fitbill_customers', JSON.stringify(allCustomers));
  return allCustomers;
}

export function addCustomer(customer: B2BCustomer): B2BCustomer {
  if (typeof window === 'undefined') return customer;
  
  const customers = getAllCustomers();
  const newCustomer = {
    ...customer,
    id: `customer-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  
  customers.push(newCustomer);
  localStorage.setItem('fitbill_customers', JSON.stringify(customers));
  return newCustomer;
}

export function updateCustomer(id: string, updates: Partial<B2BCustomer>): B2BCustomer | null {
  if (typeof window === 'undefined') return null;
  
  const customers = getAllCustomers();
  const index = customers.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  customers[index] = { ...customers[index], ...updates };
  localStorage.setItem('fitbill_customers', JSON.stringify(customers));
  return customers[index];
}

export function getCoachProfile(): Coach {
  if (typeof window === 'undefined') return mockCoach;
  
  const stored = localStorage.getItem('fitbill_coach');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return mockCoach;
    }
  }
  
  localStorage.setItem('fitbill_coach', JSON.stringify(mockCoach));
  return mockCoach;
}

export function updateCoachProfile(updates: Partial<Coach>): Coach {
  if (typeof window === 'undefined') return mockCoach;
  
  const coach = { ...getCoachProfile(), ...updates };
  localStorage.setItem('fitbill_coach', JSON.stringify(coach));
  return coach;
}
