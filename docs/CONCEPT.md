# Nuance — Concept

*Version 2 — 16 août 2026. Document de référence produit.*

> **Alerte nom.** « Nuance » est une marque déposée de Nuance Communications (Microsoft), en classe 9 — la classe des applications. « Nuance » ne doit être utilisé que comme **nom de travail interne**. Voir `docs/POSITIONNEMENT.md` § 5. Le symbole, lui, survit à un changement de nom.

## Vision

Nuance est un **assistant d'écriture pour les messages délicats**. Il aide à dire les choses avec justesse : ni trop fort, ni trop faible, ni à côté. Il aide aussi à prendre du recul sur un message reçu avant d'y répondre.

Ce n'est pas un outil réservé aux conflits. La plupart des messages difficiles de la vie ne sont pas des médiations : annoncer une mauvaise nouvelle, refuser une demande, recadrer un collègue, demander quelque chose d'inconfortable, s'excuser, relancer sans harceler. Nuance couvre tout ça.

## Ce que Nuance n'est PAS (règle éditoriale ferme)

Le savoir-faire de fond (médiation, communication non violente, coaching) reste **dans le moteur**, jamais **dans la vitrine**. Une partie des utilisateurs est allergique au vocabulaire du développement personnel ; il ne doit jamais apparaître dans l'interface.

**Lexique banni de l'UI** : coaching, coach, médiation, médiateur, CNV, communication non violente, bienveillance, thérapie, développement personnel, émotions (comme étiquette), « travail sur soi ».

**Lexique de la marque** : nuance, recul, justesse, ton, dire, clarté, posé, relire, ajuster.

Nuance se présente comme un **outil d'écriture**, au même titre qu'un correcteur — pas comme un accompagnement psychologique. La pédagogie (pourquoi telle formulation marche mieux) existe mais elle est **discrète et optionnelle**, jamais imposée, jamais moralisatrice.

## Les deux modes

### J'écris
Je tape mon message tel qu'il vient. Nuance me rend **ma propre phrase, retouchée au minimum**, avec les changements visibles (surlignés). Un curseur permet d'aller plus loin si besoin :

- **Au plus près** — mes mots, seuls les passages qui desservent sont ajustés. *C'est le mode par défaut et le cœur du produit : l'utilisateur reste l'auteur.*
- **Apaisé** — reformulation qui ouvre.
- **Repensé** — refonte complète, orientée solution.

### Je reçois
Je colle un message reçu qui me met en difficulté. Nuance me propose d'abord **un projet de réponse** (deux tons : ouvert / ferme). En option repliée : **« L'autre côté »** — une lecture prudente de ce que l'expéditeur cherche probablement à dire, formulée comme des hypothèses, jamais comme un diagnostic.

> Ordre volontaire : la réponse d'abord, la lecture ensuite. Ceux qui veulent juste répondre ne se voient pas imposer d'introspection.

## Principes produit

1. **Intervention minimale d'abord.** La version la plus proche des mots de l'utilisateur est toujours la proposition par défaut. C'est un différenciateur face aux réécriveurs de ton du marché, et une protection d'authenticité : un message qui ne ressemble plus à son auteur se retourne contre lui.
2. **L'utilisateur décide.** Nuance propose, ne corrige jamais d'autorité, n'envoie jamais rien.
3. **Sobriété.** Une app qui aide à se poser doit elle-même respirer : peu d'écrans, peu d'options, beaucoup d'espace.
4. **Confidentialité par construction.** Rien n'est stocké par défaut. Pas d'historique sans opt-in explicite. Voir AUDIT.md § RGPD.
5. **Prudence sur autrui.** Toute lecture du message d'un tiers est une hypothèse, dite comme telle.

## Cible : tout le monde

Décision arrêtée : la cible est le **grand public**, pas un segment professionnel. Toute personne qui a du mal à dire les choses, ou du mal à comprendre ce que l'autre veut vraiment dire. Couple, famille, amis, voisinage — et accessoirement le travail, mais ce n'est pas l'angle.

Cas d'usage : refuser, recadrer, demander, s'excuser, relancer, annoncer une nouvelle difficile, répondre à un message blessant.

## Le registre de réception (différenciateur central)

Les concurrents règlent le **ton**. Nuance règle en plus la **langue de réception** : un message parfaitement formulé peut manquer sa cible parce qu'il parle une langue que le destinataire n'entend pas.

Cinq registres, proposés en langage courant et facultatifs : reconnaissance, concret, temps partagé, réassurance du lien, autonomie. Inspirés de travaux connus sur les différences de réception, **jamais nommés comme tels dans l'interface**. Détail et réserves dans `docs/POSITIONNEMENT.md` § 2.

## Universalité (« plug sur tout type de message »)

Aucune messagerie n'ouvre ses conversations aux apps tierces. L'universalité passe par les mécanismes natifs du téléphone :

1. **Phase 1 — web app + copier/coller et menu Partager** : simple, conforme, universel.
2. **Phase 2 — clavier personnalisé (IME)** : présence dans toutes les apps de saisie. Chantier lourd (technique + confiance), seulement si la phase 1 valide l'usage.

## Modèle économique (esquisse)

Chaque analyse a un coût d'inférence IA. Piste : gratuit limité (ex. 10 analyses/mois) puis abonnement léger. À valider après le test d'usage. Aucune monétisation par la donnée, jamais — incompatible avec la promesse.

## Feuille de route

1. ✅ Prototypes d'ergonomie (v1 → v4) et identité visuelle.
2. Test des reformulations sur cas réels avec 4–6 proches (sans app : captures + retours).
3. V1 web déployée (front GitHub Pages + petit backend pour l'appel IA).
4. Décision Play Store / clavier selon les retours.
