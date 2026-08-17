# Nuance

> **État au 17/08/2026.** « Nuance » est un **nom de travail** : la marque est déposée par Nuance Communications (Microsoft) en classe 9. Rien n'est déployé. Les prototypes ne fonctionnent que dans l'environnement de conception, pas depuis ce dépôt. Voir `docs/AUDIT4.md`.

**Dire les choses avec justesse.**

Assistant d'écriture pour les messages délicats. Il rend votre propre message retouché au minimum (les ajustements sont surlignés, le reste ce sont vos mots), avec un curseur pour aller plus loin si besoin — et il aide à prendre du recul sur un message reçu avant d'y répondre.

Ce n'est pas un outil réservé aux conflits : refuser, recadrer, annoncer, s'excuser, relancer. Le savoir-faire reste dans le moteur, jamais dans la vitrine — aucun vocabulaire de développement personnel dans l'interface.

## État du projet

| Étape | Statut |
|---|---|
| Concept et positionnement | ✅ Validé |
| Identité visuelle | ✅ v1 |
| Prototypes d'ergonomie (v1 → v5) | ✅ v5 courante |
| Audit complet multi-rôles | ✅ 16 constats, 4 bloquants |
| Test d'usage réel | ⏳ **étape en cours** |
| V1 déployée (backend + quotas) | ⬜ après le test |
| Play Store / clavier | ⬜ non décidé |

## Documents

- [Concept produit](docs/CONCEPT.md) — vision, deux modes, règles éditoriales, feuille de route
- [Audit complet](docs/AUDIT.md) — 16 constats par rôle (marque, produit, UX, éthique, RGPD, technique, sécurité, finance, stores, accessibilité)
- [Protocole de test](docs/TEST.md) — comment valider l'usage réel avant de construire
- [Prototype v5](prototypes/v5.jsx) — deux modes, garde-fous, lexique purgé
- [Planche d'identité](https://pat37100.github.io/nuance/) — en ligne

## Points bloquants avant tout lancement public

1. **Marque** — « Nuance » entre en collision probable avec Nuance Communications (Microsoft). Antériorité INPI/EUIPO à vérifier + noms de repli.
2. **Garde-fous côté serveur** — refus des contenus coercitifs et orientation en situation de danger : implémentés en prototype, à durcir côté serveur (un garde-fou client est contournable).
3. **Architecture privacy by design** — zéro stockage, pas d'entraînement sur les données, hébergement UE.
4. **Efficience** — cache, quotas, choix du modèle selon l'intensité demandée.

## Technique

Le front est statique (GitHub Pages), mais contrairement à un projet 100 % statique, l'appel au moteur IA impose un backend minimal (Cloudflare Workers ou Vercel) : il porte la clé API, le prompt système, les quotas et les garde-fous. Le prototype v5 ne tourne pour l'instant que dans l'environnement Claude.

---

*Statut : concept et prototypes. Rien n'est déployé en usage réel.*
