# Nuance — Audit complet du concept

*15 août 2026. Doctrine : un audit qui ne trouve rien est un audit raté. Chaque rôle audite avec ses propres instruments et doit produire des constats actionnables. Stade audité : concept + prototypes v1–v4 + identité.*

**Bilan : 16 constats, dont 4 bloquants avant tout lancement public (B1–B4).** Aucun n'empêche de continuer le prototypage.

---

## 1. Directeur de marque / juridique marque

**Constat B1 — Conflit de nom probable.** « Nuance » entre en collision avec Nuance Communications (Microsoft), acteur majeur du traitement du langage et de la voix — le même champ que cette app. Risque d'opposition de marque et de déréférencement des stores. De plus, mot courant = marque faible, difficile à défendre et à référencer.
**Action :** avant tout investissement public (domaine, store, com'), recherche d'antériorité INPI + EUIPO classe 9/42, et préparer 2 noms de repli (ex. composés distinctifs autour de « nuance »). Ne bloque pas le prototypage.

## 2. Product manager / positionnement

**Constat B2 — Répulsif lexical confirmé par le porteur.** Une partie de la cible rejette le vocabulaire coaching/médiation/développement personnel. Or les protos v1–v4 contiennent : bouton « Coach », « La clé », baseline « Médiation écrite ». C'est exactement le repoussoir identifié.
**Action :** purge complète du lexique (faite dans CONCEPT.md, à répercuter dans les protos). Le mode pédagogique devient « Comprendre » ou une simple icône ⓘ, replié par défaut.

**Constat 3 — Le différenciateur réel n'est pas la réécriture.** Le marché (Tonen, CleverType, BossAI, Grammarly) sait déjà « adoucir un ton ». Les deux différenciateurs défendables de Nuance : (a) l'**intervention minimale surlignée** — l'utilisateur reste l'auteur ; (b) le mode **« Je reçois »** — personne ne le fait sérieusement.
**Action :** ces deux éléments deviennent le cœur du pitch ; le curseur 3 crans est secondaire.

## 3. UX researcher

**Constat 4 — Ordre inversé dans « Je reçois ».** Le proto v4 impose le décodage de l'autre AVANT le projet de réponse. Pour l'utilisateur pressé ou réfractaire à l'introspection, c'est une friction et un ton donneur de leçon.
**Action :** réponse d'abord, « L'autre côté » replié dessous. Corrigé dans CONCEPT.md, à répercuter au prochain proto.

**Constat 5 — Déclenchement automatique ambivalent.** L'analyse à la pause (façon DeepL) est fluide mais : (a) elle analyse des messages non terminés, donnant des résultats faux qui abîment la confiance ; (b) elle multiplie les coûts (voir § 8). 
**Action :** en v1 réelle, tester bouton explicite vs auto avec les premiers utilisateurs. Ne pas trancher sur l'intuition.

## 4. Éthicien / psychologue produit

**Constat B3 — Risque de mésusage coercitif.** Un outil qui « polit » les messages peut servir à lisser du harcèlement, de la pression ou du contrôle (ex. : rendre présentable un message de menace voilée, aider un profil manipulateur à paraître raisonnable). C'est le pire scénario réputationnel.
**Action :** règle moteur : Nuance ne reformule pas un contenu coercitif, menaçant ou de contrôle — il le signale sobrement et n'aide pas. À spécifier dans le prompt système et à tester avec des cas adverses avant tout lancement.

**Constat B4 — Situations de danger.** Des messages soumis révéleront parfois violence conjugale, détresse aiguë, menaces. Reformuler « poliment » dans ces contextes peut aggraver (ex. aider une victime à « apaiser » un agresseur au lieu de l'orienter).
**Action :** détection de ces contextes → réponse d'orientation (3919, 17, 3114 selon le cas) au lieu d'une reformulation. Non négociable avant ouverture au public.

**Constat 8 — Psychologisation d'un tiers.** « L'autre côté » interprète une personne absente à partir d'un seul message hors contexte. Risque : hypothèse fausse présentée avec assurance → mauvaise réponse → aggravation.
**Action :** formulation systématiquement hypothétique (déjà amorcé en v4), jamais de vocabulaire diagnostique, et rappel visible que seul le contexte réel compte.

**Constat 9 — Authenticité et détection.** Si le destinataire sent « l'IA » (style trop lisse), l'effet est inverse : perte de confiance. Risque accru si les deux parties utilisent l'app (conversations artificielles).
**Action :** le mode « Au plus près » par défaut est la parade — il préserve la voix de l'auteur. Interdire au moteur tout style « corporate poli » générique.

## 5. Juriste RGPD / DPO

**Constat 10 — Données doublement sensibles.** Les messages traités relèvent de l'intime (vie privée, santé, vie de couple…) ET, en mode « Je reçois », contiennent les propos d'un **tiers qui n'a rien consenti**. C'est le point RGPD le plus délicat du produit.
**Action (privacy by design, à l'architecture) :** zéro stockage par défaut, traitement éphémère ; aucun entraînement sur les données ; fournisseur IA sous DPA avec option no-retention ; hébergement UE du backend ; pas de compte obligatoire en v1 ; registre de traitement et mentions claires avant tout lancement public. En phase proto entre proches : aucun sujet.

## 6. Ingénieur / architecte

**Constat 11 — GitHub Pages ne suffit pas.** Contrairement à En Jeux (100 % statique), Nuance appelle une IA : une clé API ne peut pas vivre côté client. Un backend minimal est obligatoire (Cloudflare Workers / Vercel, gratuit au début) : proxy de l'appel IA + quotas + garde-fous.
**Action :** prévoir ce composant dès la v1 réelle. Le dépôt GitHub héberge front + docs ; le prompt système du moteur, lui, vivra côté serveur (un prompt côté client serait lisible et contournable).

**Constat 12 — Les protos v1–v4 ne sont pas déployables tels quels.** Ils utilisent l'appel IA propre à l'environnement Claude (sans clé). Sur GitHub Pages ils ne fonctionneraient pas. Normal à ce stade, à savoir.

## 7. Responsable sécurité

**Constat 13 — Surface d'attaque du moteur.** Injection de prompt (un « message reçu » contenant des instructions pour détourner le moteur), extraction du prompt système, spam de l'API (coûts). 
**Action :** prompt système côté serveur uniquement, sorties JSON validées, quotas par IP/appareil, tests d'injection dans la suite de tests (même doctrine qu'En Jeux : l'audit sécurité a ses instruments).

## 8. Directeur financier

**Constat 14 — Coût variable non modélisé.** Chaque analyse ≈ 3 versions générées. En déclenchement auto, un seul message peut coûter 3–5 analyses (pauses successives). Ordre de grandeur : quelques centimes par analyse — négligeable pour 10 testeurs, structurel à 10 000 utilisateurs.
**Action :** avant tout lancement public : quota gratuit + cache (même texte = pas de nouvel appel) + décision bouton vs auto éclairée par le coût. Modéliser 3 scénarios d'usage.

## 9. Conformité stores

**Constat 15 — Obligations spécifiques aux apps IA.** Google Play impose aux apps à contenu génératif des dispositifs de signalement de contenus problématiques et le respect de sa politique AI-Generated Content ; Apple exige un compte développeur (99 $/an) et une review stricte. Le clavier (phase 2) ajoutera la déclaration « Full Access » très scrutée.
**Action :** intégrer un bouton « signaler cette proposition » dès la v1 ; vérifier les politiques au moment du dépôt (elles bougent vite).

## 10. Accessibilité & éditorial

**Constat 16 — Trois points concrets.** (a) La saisie vocale est essentielle — le porteur lui-même dicte ses messages ; la zone « À chaud » doit bien fonctionner en dictée. (b) Le tutoiement systématique de l'UI peut gêner en usage pro → option tu/vous, et le moteur doit déjà respecter le registre du message (fait). (c) Contraste des passages surlignés à vérifier WCAG AA, et alternative non-couleur (soulignement) pour les daltoniens.

---

## Synthèse des priorités

| Priorité | Quoi | Quand |
|---|---|---|
| B1 | Recherche d'antériorité marque + plans B | Avant tout investissement public |
| B2 | Purge lexique coaching/médiation de l'UI | Prochain proto |
| B3 | Garde-fou contenu coercitif dans le moteur | Avant ouverture au-delà des proches |
| B4 | Détection danger + orientation (3919/17/3114) | Avant ouverture au-delà des proches |
| Haute | Réponse avant décodage dans « Je reçois » | Prochain proto |
| Haute | Architecture privacy by design + backend | V1 réelle |
| Moyenne | Modélisation coûts, quotas, cache | V1 réelle |
| Moyenne | Tests d'injection, signalement, accessibilité | V1 réelle |

*Prochain audit : après le test proches (étape 2 de la feuille de route), avec les instruments d'usage réel.*
