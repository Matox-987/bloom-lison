# Bloom 🌸

Application de suivi nutritionnel (calories + macros) pensée pour la prise de masse propre de Lison.
100 % en français, mobile-first, installable en PWA depuis Safari iPhone.

## Fonctionnalités

- **Aujourd'hui** : anneaux de progression (kcal + protéines/glucides/lipides), plan de repas du jour avec
  case à cocher par repas, ajout libre d'aliments, checkbox oméga-3, saisie du poids. Navigation vers les
  jours précédents pour rattraper un oubli.
- **Paliers intelligents** : objectifs éditables par paliers datés ; si la tendance de poids (EMA lissée)
  stagne sous +0.15 kg/sem pendant ~2 semaines, l'app propose automatiquement +175 kcal (reverse dieting
  progressif).
- **Stats** : adhérence au plan, streak 🔥, moyennes kcal/macros, courbe de poids lissée, calories par jour
  vs objectif, sur 7/30/90 jours.
- **Plan hebdo** : le plan type se répète chaque semaine ; modifiable de façon permanente (onglet Plan) ou
  ponctuelle pour un seul jour (onglet Aujourd'hui) sans casser le reste.
- **Base d'aliments** : valeurs pour 100 g cru/sec, source de vérité de tous les calculs (rien n'est
  hardcodé). Ajout/édition/suppression d'aliments.
- **Sauvegarde** : export/import JSON depuis Réglages.

## Stack

Vite + React + TypeScript + Tailwind CSS v4. Aucune dépendance runtime hors React.
Données persistées en `localStorage` (usage personnel, 1 utilisatrice) avec `navigator.storage.persist()`.
Service worker pour le mode hors-ligne, manifest PWA complet.

## Développement

```bash
npm install
npm run dev      # serveur de dev
npm run build    # build de production (tsc + vite)
npm run icons    # régénère les icônes PWA (sharp)
```

## Déploiement

Déployé sur Vercel (framework auto-détecté : Vite, output `dist/`).
