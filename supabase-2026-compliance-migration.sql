-- ============================================================================
-- MIGRATION SUPABASE POUR CONFORMITÉ FISCALE 2026 (Loi France)
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase
-- ============================================================================

-- ============================================================================
-- 1. AJOUTER COLONNES DE CONFORMITÉ B2B À LA TABLE 'profiles' (pour le coach)
-- ============================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS siren TEXT UNIQUE;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS vat_number TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS vat_regime TEXT;

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS profiles_siren_idx ON public.profiles(siren);

-- ============================================================================
-- 2. CRÉER/METTRE À JOUR LA TABLE 'customers' (clients)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  is_b2b BOOLEAN DEFAULT false,
  siren TEXT,
  vat_number TEXT,
  billing_address TEXT,
  service_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Si la table existe déjà, ajouter les colonnes manquantes
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS is_b2b BOOLEAN DEFAULT false;

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS siren TEXT;

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS vat_number TEXT;

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS billing_address TEXT;

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS service_address TEXT;

-- Indices pour performance
CREATE INDEX IF NOT EXISTS customers_coach_id_idx ON public.customers(coach_id);
CREATE INDEX IF NOT EXISTS customers_is_b2b_idx ON public.customers(is_b2b);
CREATE INDEX IF NOT EXISTS customers_siren_idx ON public.customers(siren);

-- ============================================================================
-- 3. ACTIVER ROW LEVEL SECURITY (RLS) ET CRÉER LES POLITIQUES
-- ============================================================================

-- Activer RLS si pas déjà activé
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Politique : Les coaches peuvent voir leurs propres clients
DROP POLICY IF EXISTS "coaches_view_own_customers" ON public.customers;
CREATE POLICY "coaches_view_own_customers"
  ON public.customers
  FOR SELECT
  USING (auth.uid() = coach_id);

-- Politique : Les coaches peuvent insérer leurs propres clients
DROP POLICY IF EXISTS "coaches_insert_own_customers" ON public.customers;
CREATE POLICY "coaches_insert_own_customers"
  ON public.customers
  FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

-- Politique : Les coaches peuvent mettre à jour leurs propres clients
DROP POLICY IF EXISTS "coaches_update_own_customers" ON public.customers;
CREATE POLICY "coaches_update_own_customers"
  ON public.customers
  FOR UPDATE
  USING (auth.uid() = coach_id);

-- Politique : Les coaches peuvent supprimer leurs propres clients
DROP POLICY IF EXISTS "coaches_delete_own_customers" ON public.customers;
CREATE POLICY "coaches_delete_own_customers"
  ON public.customers
  FOR DELETE
  USING (auth.uid() = coach_id);

-- ============================================================================
-- 4. TRIGGER POUR METTRE À JOUR updated_at SUR customers
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_customers_updated_at ON public.customers;
CREATE TRIGGER set_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_customers_updated_at();

-- ============================================================================
-- 5. CRÉER LA TABLE 'invoices' POUR FACTURATION (optionnel mais recommandé)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  amount_ht DECIMAL(10, 2) NOT NULL,
  vat_rate DECIMAL(5, 2) DEFAULT 20,
  amount_ttc DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')) DEFAULT 'draft',
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour invoices
CREATE INDEX IF NOT EXISTS invoices_coach_id_idx ON public.invoices(coach_id);
CREATE INDEX IF NOT EXISTS invoices_customer_id_idx ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON public.invoices(status);

-- RLS pour invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coaches_view_own_invoices"
  ON public.invoices
  FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "coaches_manage_own_invoices"
  ON public.invoices
  FOR ALL
  USING (auth.uid() = coach_id);

-- Trigger updated_at pour invoices
CREATE OR REPLACE FUNCTION public.update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_invoices_updated_at ON public.invoices;
CREATE TRIGGER set_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invoices_updated_at();

-- ============================================================================
-- MIGRATION COMPLÉTÉE
-- ============================================================================
