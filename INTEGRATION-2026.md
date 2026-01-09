# Guide d'Intégration - Conformité Fiscale 2026

## ✅ Statut: Prêt pour Supabase

Tous les fichiers et composants sont maintenant créés et configurés. Voici ce qui a été fait:

### 1. **Configuration Supabase Client** ✅
- **Fichier**: `app/utils/supabase.ts`
- **Fallback**: Stub minimal quand les variables d'environnement sont manquantes
- **Variables requises**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. **Pages Créées/Modifiées** ✅

#### Profil Coach
- **Path**: `/dashboard/profile`
- **Fichier**: `app/dashboard/profile/page.tsx`
- **Fonctionnalités**:
  - Formulaire pour entrer votre SIREN (14 chiffres)
  - Champ numéro de TVA (FR + 11 chiffres)
  - Sélection du régime TVA
  - Validation des formats
  - Badge "Conforme 2026" (vert) quand SIREN rempli
  - Sauvegarde dans `profiles.siren`

#### Gestion Clients
- **Path**: `/dashboard/customers`
- **Fichier**: `app/dashboard/customers/page.tsx`
- **Fonctionnalités**:
  - Liste de tous vos clients
  - Stats: Total, B2B, B2C, Conformes
  - Badges de conformité par client
  - Recherche par nom/email/SIREN
  - Voir/Éditer/Supprimer

#### Ajouter un Client
- **Path**: `/dashboard/customers/new`
- **Fichier**: `app/dashboard/customers/new/page.tsx`
- **Fonctionnalités**:
  - Toggle B2B/B2C
  - **Recherche d'entreprise** via API gouv.fr
  - Auto-remplissage: SIREN, nom, adresse
  - Champs B2B: SIREN, TVA, adresses facturation/prestation
  - Validation du SIREN pour B2B
  - Sauvegarde dans `customers` table

#### Dashboard
- **Path**: `/dashboard`
- **Fichier**: `app/dashboard/page.tsx`
- **Nouveauté**:
  - Badge "Conforme 2026" en haut à droite
  - Clique pour aller remplir votre SIREN

### 3. **Composants Réutilisables** ✅

#### ComplianceBadge
- **Path**: `app/components/ComplianceBadge.tsx`
- **Affiche**: Badge vert (Conforme) ou rouge (Incomplet)
- **Usage**: Partout où on doit afficher le statut de conformité

#### ComplianceStatus
- **Path**: `app/components/ComplianceStatus.tsx`
- **Affiche**: Badge cliquable du coach
- **Usage**: Dans le dashboard pour naviguer vers le profil

#### CompanySearch
- **Path**: `app/components/CompanySearch.tsx`
- **Fonctionnalité**: Recherche entreprise API gouv.fr
- **Débounce**: 300ms pour limiter les appels API
- **Résultats**: Affichage du SIREN, nom, adresse

### 4. **Migration SQL** ✅
- **Fichier**: `supabase-2026-compliance-migration.sql`
- **À faire**: Exécuter ce script dans SQL Editor Supabase
- **Crée/Ajoute**:
  - Table `customers` avec colonnes B2B
  - Colonnes `siren`, `vat_number`, `vat_regime` dans `profiles`
  - Table `invoices` pour la facturation
  - RLS policies pour sécurité
  - Triggers `updated_at`

---

## 🚀 Procédure d'Activation

### Étape 1: Configurer les variables Vercel/Localhost

```bash
# .env.local (local)
NEXT_PUBLIC_SUPABASE_URL=https://votre-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
```

### Étape 2: Exécuter la migration SQL

1. Aller sur https://app.supabase.com
2. Sélectionner votre projet
3. SQL Editor → Nouvelle Query
4. Copier/coller le contenu de `supabase-2026-compliance-migration.sql`
5. Exécuter

### Étape 3: Tester en local

```bash
npm run dev
# Aller sur http://localhost:3000/dashboard
```

### Étape 4: Remplir vos infos coach

1. Cliquer sur le badge "Incomplet - Ajouter SIREN" en haut du dashboard
2. Aller sur `/dashboard/profile`
3. Remplir votre SIREN et info TVA
4. Cliquer "Sauvegarder"
5. Le badge devient "✓ Conforme 2026"

### Étape 5: Ajouter vos clients B2B

1. Cliquer "Ajouter un client"
2. Basculer sur "Entreprise (B2B)"
3. Rechercher l'entreprise (nom, SIREN, etc.)
4. Cliquer sur le résultat → auto-remplissage
5. Sauvegarder

---

## 📊 Structure de données

### Table: `profiles` (coach)
```
id (UUID)              → Supabase Auth User ID
full_name (TEXT)
email (TEXT)
siren (TEXT)           ← NOUVEAU - Clé unique
vat_number (TEXT)      ← NOUVEAU
vat_regime (TEXT)      ← NOUVEAU - franchise|real|micro
user_type (TEXT)       → coach|client
created_at
updated_at
```

### Table: `customers` (clients)
```
id (UUID)              → Clé primaire
coach_id (UUID)        → Référence profiles.id
full_name (TEXT)
email (TEXT)
phone (TEXT)
is_b2b (BOOLEAN)       ← Nouveau - true pour entreprise
siren (TEXT)           ← Nouveau - 14 chiffres
vat_number (TEXT)      ← Nouveau
billing_address (TEXT) ← Nouveau
service_address (TEXT) ← Nouveau
created_at
updated_at
```

### Table: `invoices` (facturation)
```
id (UUID)
coach_id (UUID)        → Référence profiles.id
customer_id (UUID)     → Référence customers.id
invoice_number (TEXT)  → Clé unique
amount_ht (DECIMAL)    → Montant HT
vat_rate (DECIMAL)     → Taux TVA (default 20)
amount_ttc (DECIMAL)   → Montant TTC
status (TEXT)          → draft|sent|paid|cancelled
issued_at
due_date
created_at
updated_at
```

---

## 🔒 Sécurité

### RLS (Row Level Security)
- ✅ Activé sur `customers` et `invoices`
- ✅ Chaque coach ne peut voir que ses propres données
- ✅ Les clients ne peuvent pas accéder `customers` (gestion côté coach)

### Policies appliquées
- `coaches_view_own_customers`
- `coaches_insert_own_customers`
- `coaches_update_own_customers`
- `coaches_delete_own_customers`

---

## 📱 Pages à tester

1. **Dashboard**: `/dashboard`
   - ✅ Badge de conformité en haut à droite
   - Clique pour aller au profil

2. **Profil Coach**: `/dashboard/profile`
   - ✅ Formulaire SIREN/TVA
   - ✅ Validation
   - ✅ Badge Conforme/Incomplet

3. **Clients**: `/dashboard/customers`
   - ✅ Liste avec badges
   - ✅ Stats
   - ✅ Modal détails
   - ✅ Éditer/Supprimer

4. **Ajouter Client**: `/dashboard/customers/new`
   - ✅ Toggle B2B/B2C
   - ✅ Recherche API gouv.fr
   - ✅ Auto-remplissage
   - ✅ Validation SIREN

---

## ✅ Checklist finale

- [x] Configuration Supabase client
- [x] Migration SQL créée
- [x] Page profil coach
- [x] Formulaire clients B2B
- [x] Recherche API gouv.fr
- [x] Badge visuel conformité
- [x] Dashboard amélioré
- [x] Composants réutilisables
- [x] RLS policies

**Prêt à pusher!** 🚀
