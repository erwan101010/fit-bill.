-- Migration Supabase pour conformité légale 2026 (France)
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase

-- ============================================================================
-- 1. Ajouter les colonnes de conformité B2B à la table 'customers'
-- ============================================================================

-- Ajouter la colonne is_b2b (booléen, défaut: false)
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS is_b2b BOOLEAN DEFAULT false;

-- Ajouter la colonne siren (string unique pour les entreprises)
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS siren VARCHAR(14) UNIQUE;

-- Ajouter la colonne vat_number (numéro TVA intracommunautaire)
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS vat_number VARCHAR(20);

-- Ajouter la colonne billing_address (adresse de facturation)
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS billing_address TEXT;

-- Ajouter la colonne service_address (adresse de prestation)
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS service_address TEXT;

-- ============================================================================
-- 2. Ajouter les colonnes de conformité B2B à la table 'profiles' (coach)
-- ============================================================================

-- Ajouter la colonne siren (SIREN du coach si auto-entrepreneur ou EIRL)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS siren VARCHAR(14);

-- Ajouter la colonne vat_number (Numéro TVA du coach)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS vat_number VARCHAR(20);

-- Ajouter la colonne vat_regime (régime TVA : franchise, réel, etc.)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS vat_regime VARCHAR(50);

-- ============================================================================
-- 3. Index pour améliorer les performances des recherches
-- ============================================================================

CREATE INDEX IF NOT EXISTS customers_is_b2b_idx ON public.customers(is_b2b);
CREATE INDEX IF NOT EXISTS customers_siren_idx ON public.customers(siren);
CREATE INDEX IF NOT EXISTS profiles_siren_idx ON public.profiles(siren);

-- ============================================================================
-- 4. Mettre à jour le timestamp updated_at si la table le support
-- ============================================================================

-- Les triggers updated_at devraient déjà être en place via handle_updated_at()
