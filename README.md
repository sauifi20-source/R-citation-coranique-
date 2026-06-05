# Quran Video Creator

Interface de création de vidéos de récitation coranique — prête pour Vercel.

## Structure du projet

```
quran-video-creator/
├── public/
│   ├── index.html      → Interface principale
│   ├── style.css       → Styles (thème sombre, responsive)
│   ├── app.js          → Logique applicative
│   ├── data.js         → 114 sourates + 20 récitateurs
│   └── favicon.svg     → Icône
├── vercel.json         → Config Vercel (routing statique)
├── package.json        → Scripts dev/start
├── .gitignore
└── README.md
```

---

## Déploiement sur Vercel — étapes complètes

### Étape 1 — Créer un compte GitHub (si pas déjà fait)
1. Aller sur https://github.com
2. Créer un compte gratuit

### Étape 2 — Créer un dépôt GitHub
1. Sur GitHub, cliquer sur **New repository**
2. Nom : `quran-video-creator`
3. Visibilité : **Private** (recommandé)
4. Ne pas initialiser avec README
5. Cliquer **Create repository**

### Étape 3 — Pousser le projet sur GitHub
Ouvrir un terminal dans le dossier du projet :

```bash
git init
git add .
git commit -m "Initial commit — Quran Video Creator"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/quran-video-creator.git
git push -u origin main
```

### Étape 4 — Créer un compte Vercel
1. Aller sur https://vercel.com
2. Cliquer **Sign Up** → **Continue with GitHub**
3. Autoriser Vercel à accéder à GitHub

### Étape 5 — Importer le projet sur Vercel
1. Sur le dashboard Vercel, cliquer **Add New → Project**
2. Trouver `quran-video-creator` dans la liste
3. Cliquer **Import**

### Étape 6 — Configurer le projet
Vercel détecte automatiquement un projet statique.
Laisser tous les paramètres par défaut :
- **Framework Preset** : Other
- **Root Directory** : `./` (laisser vide)
- **Build Command** : laisser vide
- **Output Directory** : `public`

Cliquer **Deploy**.

### Étape 7 — Accéder au site
Après ~30 secondes, Vercel fournit une URL du type :
```
https://quran-video-creator-xxx.vercel.app
```
Le site est en ligne. Chaque `git push` redéploie automatiquement.

---

## Domaine personnalisé (optionnel)
1. Sur Vercel → Settings → Domains
2. Ajouter ton domaine (ex: `quranvideo.com`)
3. Configurer les DNS chez ton registrar selon les instructions Vercel

---

## Développement local

```bash
# Installer les dépendances
npm install

# Lancer en local sur http://localhost:3000
npm run dev
```

---

## Fonctionnalités actuelles (v1.0)

- ✅ 114 sourates complètes avec nom arabe, français et nombre de versets
- ✅ 20 récitateurs classés par popularité
- ✅ Recherche instantanée sourates et récitateurs
- ✅ Import audio (MP3, WAV, M4A, FLAC, OGG) avec lecture immédiate
- ✅ Import vidéo (MP4, MOV, AVI, WEBM, MKV) avec aperçu immédiat
- ✅ Sélection des versets avec cases à cocher
- ✅ Synchronisation automatique simulée + timeline
- ✅ 3 polices arabes (Scheherazade New, Amiri, Noto Naskh)
- ✅ 5 formats vidéo (TikTok, Reel, Shorts, YouTube, Carré)
- ✅ Aperçu en temps réel avec fond vidéo
- ✅ Export MP4 en 720p / 1080p / 1440p / 4K
- ✅ Barre de progression 9 étapes

## Prochaines étapes (v2.0)

- [ ] Backend FFmpeg (Vercel Serverless Functions) pour l'export réel
- [ ] Synchronisation audio réelle (WebAudio API)
- [ ] Textes arabes complets pour toutes les 114 sourates (API Quran.com)
- [ ] Animations de texte (fondu, défilement)
- [ ] Couleur et taille du texte personnalisables
