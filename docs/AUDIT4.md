# Nuance — Audit n°4 : audit technique et de conformité

*17 août 2026. Les audits n°1 à n°3 ont porté sur le concept, le positionnement, l'éthique, le RGPD, l'ambition et le marché. **Aucun n'avait audité le code produit.** Cet audit comble ce manque et complète par les types d'audit encore absents.*

**Bilan : 15 constats nouveaux, dont 1 défaut fatal découvert sur le terrain (F1) et 4 défauts de robustesse confirmés par lecture du code.**

---

# A. Audit de découverte — défauts trouvés dans le code livré

Méthode : lecture ligne à ligne des quatre prototypes, pas raisonnement de mémoire. Doctrine appliquée : toute alerte est vérifiée dans le fichier avant d'être écrite.

## F1 — DÉFAUT FATAL : la barre du clavier était invisible sur téléphone

**Constat vérifié.** Dans `clavier-simulation.jsx`, la barre Nuance était le **dernier élément** d'une colonne en `minHeight: 100vh`. Sur iPhone, l'ouverture du clavier système réduit la zone visible sans réduire la hauteur du document : la barre passait donc **sous le clavier réel**, invisible exactement au moment où l'utilisateur écrivait.

**Gravité : maximale.** La fonction centrale de la simulation était inatteignable. L'utilisateur tapait et ne voyait jamais de proposition — d'où le retour « ça ne marche pas ». Le défaut n'était pas dans le moteur mais dans la mise en page.

**Leçon de méthode :** ce défaut était prévisible et documenté par avance (la note `MECANISME.md` insiste sur la position de la barre), mais aucun test dans les conditions réelles n'a été fait avant livraison. **Un prototype mobile non testé en conditions de clavier ouvert doit être considéré comme non testé.**

**Correction (clavier-v2) :** barre déplacée **au-dessus** du champ de saisie ; hauteur pilotée par `visualViewport` au lieu de `100vh` ; seul le fil de conversation défile.

## F2 — Blocage définitif après une erreur réseau

**Constat vérifié.** Dans v6, v7 et la simulation, la clé anti-doublon (`keyE.current`, `dernier.current`) était affectée **avant** l'appel réseau. En cas d'échec, le texte était déjà marqué comme traité : l'utilisateur restait bloqué en état d'erreur et devait modifier son texte pour obtenir une nouvelle tentative.

**Correction :** marquage **après succès uniquement**.

## F3 — Aucun délai d'expiration sur les appels

**Constat vérifié.** `grep AbortController` → 0 occurrence dans tous les prototypes. Si le réseau ne répond pas, l'indicateur « je relis… » tourne indéfiniment, sans message ni sortie.

**Correction :** `AbortController` avec expiration à 20 secondes.

## F4 — Contexte de conversation périmé

**Constat vérifié.** Dans la simulation, `msgs` était lu dans l'effet sans figurer dans ses dépendances : le moteur travaillait avec l'état de la conversation tel qu'il était au premier rendu. Les messages ajoutés n'étaient pas pris en compte.

**Correction :** passage par une référence tenue à jour.

## F5 — Défilement automatique perturbant la saisie

**Constat vérifié.** `scrollIntoView({behavior:"smooth"})` s'appliquait au document entier, ce qui pouvait déplacer la zone de saisie pendant l'écriture.

**Correction :** défilement limité au conteneur du fil.

## 6 — Prompt système dupliqué dans quatre fichiers

**Constat vérifié.** Les consignes du moteur existent en quatre exemplaires (v5, v6, v7, simulation), avec des variantes. Toute évolution doit être répliquée manuellement : dérive garantie, et impossibilité de savoir quelle version a produit quel résultat.

**Recommandation :** source unique. Rejoint le constat 13 de l'audit n°3 (prompt côté serveur), qui devient prioritaire dès la V1.

## 7 — Le risque des alternatives par mot n'est pas couvert

**Constat.** En v6/v7, remplacer un segment par une variante se fait par simple substitution de chaîne. Si la variante n'a pas la même construction grammaticale, la phrase devient incorrecte, sans aucun contrôle.

**Recommandation :** soit contraindre fortement le moteur (même nature grammaticale), soit réharmoniser la phrase après substitution, soit assumer et permettre l'édition manuelle du résultat — actuellement impossible, le texte proposé n'étant pas éditable.

## 8 — Le résultat n'est pas éditable

**Constat.** Aucun prototype ne permet de retoucher à la main la proposition avant de la copier. Or l'utilisateur voudra souvent changer un mot lui-même. C'est un manque fonctionnel de premier ordre, jamais relevé.

---

# B. Audit de conformité

## 9 — Écart entre la promesse affichée et la réalité technique

**Constat.** Tous les prototypes affichent « rien n'est enregistré ». C'est vrai côté application, mais le texte est transmis à un fournisseur d'IA tiers. La mention est donc **incomplète et potentiellement trompeuse** au sens de l'information due à l'utilisateur.

**Recommandation :** formulation exacte du type « analysé pour produire la proposition, puis non conservé », plus une page d'information accessible avant tout usage public.

## 10 — Garde-fous contournables par construction

**Constat.** Les garde-fous coercition et danger sont dans le prompt, côté client. Ils sont donc lisibles et modifiables par quiconque inspecte la page. Acceptable en prototype, **disqualifiant en production** — et incompatible avec les exigences des magasins d'applications sur les contenus générés.

**Recommandation :** déplacement côté serveur, avec journalisation des déclenchements (sans conserver le texte).

## 11 — Absence de mentions obligatoires

**Constat.** Aucun prototype ne comporte de conditions d'utilisation, de politique de confidentialité, d'éditeur identifié, ni de moyen de signaler une proposition problématique. Ces éléments sont exigés pour toute publication, y compris web.

---

# C. Audit d'accessibilité

## 12 — Trois manquements vérifiés

- **Lecteur d'écran :** les changements de la barre (« je relis… », proposition, blocage) ne sont pas annoncés. Il manque une zone `aria-live` — un utilisateur non voyant ne saurait pas qu'une proposition est apparue.
- **Contraste :** le texte gris clair sur fond clair (`#7B8681` en 9,5 px pour le compteur) est en dessous du seuil recommandé.
- **Cibles tactiles :** plusieurs boutons secondaires font moins de 44 px de haut, minimum recommandé sur mobile.

---

# D. Audit de performance et de coût

## 13 — Le déclenchement automatique consomme plus que prévu

**Constat.** Chaque pause de frappe déclenche un appel complet. En rédaction hésitante, un seul message peut générer 4 à 6 analyses. Le mode « le plus rapide » (350 ms) aggrave nettement le phénomène.

**Recommandation :** conserver le déclenchement automatique mais ajouter un cache local sur le texte exact, un délai minimum de 800 ms, et un plafond d'appels par message. Rejoint le constat 14 de l'audit n°2 et le constat 9 de l'audit n°3 (plafond de dépense).

---

# E. Audit de cohérence documentaire

## 14 — Le dépôt décrit un produit qui n'existe pas encore

**Constat.** Le `README.md` présente Nuance comme une application avec des fonctions actives, alors que rien n'est déployé et que le nom lui-même est juridiquement compromis. Un lecteur extérieur — ou le porteur dans six mois — s'y trompera.

**Recommandation :** en tête de `README.md`, une ligne d'état sans ambiguïté : nom de travail, aucun déploiement, prototypes utilisables uniquement dans l'environnement de conception.

## 15 — Sept versions, aucune trace des décisions d'ergonomie

**Constat.** Le passage de v1 à v7 a produit des décisions structurantes (interface neutralisée, ordre réponse/lecture, curseur remplacé, registres ajoutés) documentées dans les audits mais sans journal de décisions unifié. Le risque est de refaire un débat déjà tranché.

**Recommandation :** un journal de décisions bref, une ligne par arbitrage, avec la date et la raison.

---

# Synthèse

| # | Constat | Statut |
|---|---|---|
| F1 | Barre invisible sous le clavier système | **Corrigé** (clavier-v2) |
| F2 | Blocage après erreur réseau | **Corrigé** |
| F3 | Aucun délai d'expiration | **Corrigé** |
| F4 | Contexte de conversation périmé | **Corrigé** |
| F5 | Défilement perturbant la saisie | **Corrigé** |
| 6 | Prompt dupliqué en 4 exemplaires | Ouvert — à régler par le serveur |
| 7 | Substitution grammaticale non contrôlée | Ouvert |
| 8 | Proposition non éditable à la main | Ouvert — manque fonctionnel |
| 9 | « Rien n'est enregistré » imprécis | Ouvert — avant tout usage public |
| 10 | Garde-fous côté client, contournables | Ouvert — bloquant en production |
| 11 | Mentions légales et signalement absents | Ouvert — bloquant en production |
| 12 | Accessibilité : annonces, contraste, cibles | Ouvert |
| 13 | Coût du déclenchement automatique | Ouvert |
| 14 | README décrit un produit inexistant | Ouvert |
| 15 | Pas de journal de décisions | Ouvert |

## Leçon de méthode retenue

Le défaut fatal F1 n'a pas été trouvé par un raisonnement mais par la lecture du code après un retour d'usage. Les quatre autres défauts de robustesse ont été trouvés de la même manière, en vérifiant les fichiers plutôt qu'en se fiant à la mémoire de ce qui avait été écrit.

**Conclusion applicable à la suite du projet, et notamment au clavier natif :** aucune version ne doit être présentée comme utilisable sans avoir été éprouvée dans les conditions réelles — écran de téléphone, clavier ouvert, réseau lent, texte inattendu.
