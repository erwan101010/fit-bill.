# 🚀 Guide de Déploiement Demos sur Vercel

## Prérequis
- Un compte GitHub (gratuit)
- Un compte Vercel (gratuit)

---

## Étape 1 : Préparer votre code sur GitHub

### Option A : Via GitHub Desktop (recommandé pour débutants)
1. Téléchargez [GitHub Desktop](https://desktop.github.com/)
2. Créez un nouveau repository sur GitHub.com
3. Clonez-le sur votre Mac avec GitHub Desktop
4. Copiez tous les fichiers de votre projet Demos dans ce dossier
5. Faites un commit et pushez sur GitHub

### Option B : Via Terminal (pour les utilisateurs avancés)
```bash
cd /Users/knoery/coach/fit-bill
git init
git add .
git commit -m "Initial commit - Demos app"
# Créez un repo sur GitHub, puis :
git remote add origin https://github.com/VOTRE-USERNAME/demos.git
git branch -M main
git push -u origin main
```

---

## Étape 2 : Déployer sur Vercel

### 2.1 Créer un compte Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Sign Up"**
3. Choisissez **"Continue with GitHub"** (le plus simple)
4. Autorisez Vercel à accéder à votre GitHub

### 2.2 Importer votre projet
1. Dans le dashboard Vercel, cliquez sur **"Add New..."** → **"Project"**
2. Trouvez votre repository `demos` dans la liste
3. Cliquez sur **"Import"**

### 2.3 Configuration du projet
- **Framework Preset** : Next.js (détecté automatiquement)
- **Root Directory** : `./` (laisser par défaut)
- **Build Command** : `npm run build` (automatique)
- **Output Directory** : `.next` (automatique)
- **Install Command** : `npm install` (automatique)

### 2.4 Déployer
1. Cliquez sur **"Deploy"**
2. Attendez 2-3 minutes que le déploiement se termine
3. ✅ Votre app est en ligne !

---

## Étape 3 : Accéder à votre application

### Sur votre Mac
- Vercel vous donnera une URL du type : `https://demos-xxxxx.vercel.app`
- Ouvrez cette URL dans votre navigateur

### Sur votre téléphone
1. Envoyez-vous l'URL par SMS ou email
2. Ouvrez le lien sur votre iPhone/Android
3. Ajoutez la page à l'écran d'accueil :
   - **iPhone** : Partage → "Sur l'écran d'accueil"
   - **Android** : Menu → "Ajouter à l'écran d'accueil"

---

## Étape 4 : Personnaliser votre domaine (Optionnel)

1. Dans le dashboard Vercel, allez dans **Settings** → **Domains**
2. Ajoutez votre domaine personnalisé (ex: `demos.com`)
3. Suivez les instructions pour configurer les DNS

---

## Mise à jour de l'application

Chaque fois que vous modifiez votre code :

1. **Pushez sur GitHub** :
   ```bash
   git add .
   git commit -m "Description des changements"
   git push
   ```

2. **Vercel redéploie automatiquement** ! 🎉
   - Pas besoin de faire quoi que ce soit
   - Le nouveau site est en ligne en 2-3 minutes

---

## 💡 Astuces

### Ajouter une icône personnalisée
1. Créez une image 512x512px de votre logo
2. Remplacez `/app/icon.svg` par votre image
3. Poussez sur GitHub → Redéploiement automatique

### Variables d'environnement (pour plus tard)
Si vous ajoutez des clés API :
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Ajoutez vos variables (ex: `STRIPE_SECRET_KEY`)
3. Redéployez

---

## 🆘 Problèmes courants

### "Build failed"
- Vérifiez que `npm run build` fonctionne localement
- Regardez les logs dans Vercel pour voir l'erreur exacte

### "Page not found"
- Vérifiez que toutes vos pages sont dans `/app/`
- Assurez-vous que `'use client'` est présent sur les pages interactives

### L'application ne se met pas à jour
- Attendez 2-3 minutes après le push
- Videz le cache de votre navigateur (Cmd+Shift+R sur Mac)

---

## ✅ Checklist finale

- [ ] Code poussé sur GitHub
- [ ] Projet importé sur Vercel
- [ ] Déploiement réussi
- [ ] URL testée sur Mac
- [ ] URL testée sur téléphone
- [ ] Application ajoutée à l'écran d'accueil

---

**🎉 Félicitations ! Votre application Demos est maintenant en ligne !**

Pour toute question : consultez la [documentation Vercel](https://vercel.com/docs)

