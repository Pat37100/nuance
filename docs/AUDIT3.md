# Nuance — Audit final n°3

*16 août 2026. Audit du modèle après v6. Les audits n°1 (16 constats) et n°2 (14 constats) ont couvert produit, UX, éthique, RGPD, technique, sécurité, stores, accessibilité, benchmark DeepL, direction artistique et déploiement. Cet audit final ne les répète pas : il examine **uniquement les angles jamais ouverts**.*

**Bilan : 12 constats nouveaux, dont 2 risques existentiels non traités (X1, X2).**

---

## X1 — Le risque porteur : personne unique, non développeur

**Constat.** Le projet repose entièrement sur une personne qui n'est pas développeuse, exerce un métier à temps plein exigeant (DRH), et mène déjà d'autres projets en parallèle. Aucun des audits précédents n'a examiné cette dépendance. C'est pourtant le premier facteur d'échec statistique de ce type de projet — avant le marché, avant la technique.

**Trois expositions concrètes :**
- **Dépendance à l'assistance IA.** Tout le code est produit par un assistant. Sans capacité à lire ou corriger soi-même, chaque bug en production devient bloquant tant qu'une session n'est pas ouverte. Acceptable pour un prototype, risqué pour un service utilisé par des tiers.
- **Charge d'exploitation sous-estimée.** Un service en ligne, même petit, demande du temps récurrent : pannes, questions d'utilisateurs, coûts à surveiller, mises à jour. Ce n'est pas un projet qu'on livre puis qu'on oublie.
- **Continuité.** Si le projet s'arrête trois mois, il ne redémarre généralement pas.

**Recommandation.** Décider explicitement du **régime d'ambition** avant d'aller plus loin, car tout le reste en dépend :
- **Régime A — outil personnel et proches.** Aucun engagement, aucun support, aucune monétisation, RGPD sans enjeu. Coût quasi nul. Le projet reste sain indéfiniment.
- **Régime B — service public gratuit.** Support, disponibilité, conformité, coûts d'inférence à absorber. Demande quelques heures par mois, durablement.
- **Régime C — produit commercial.** Facturation, obligations de vente à distance, service client, comptabilité. Change de nature : ce n'est plus un projet du soir.

Aucun n'est meilleur que l'autre. Mais le concept est actuellement écrit comme un C, alors que les conditions réelles sont celles d'un A. **C'est l'incohérence la plus structurante du dossier.**

## X2 — Le problème de distribution n'a jamais été posé

**Constat.** Tous les audits ont traité *quoi construire* et *comment déployer techniquement*. Aucun n'a traité **comment les gens le découvrent**. Or c'est le vrai goulot d'étranglement : le magasin d'applications n'est pas un canal de distribution, c'est un rayon dans lequel personne n'entre par hasard.

**Aggravant propre à Nuance :** c'est un produit qu'on n'a **aucune envie de recommander publiquement**. Personne ne poste « j'utilise une app pour ne pas envoyer de messages agressifs ». La honte d'usage bloque le bouche-à-oreille, qui est pourtant le seul canal gratuit. Ce point n'a jamais été identifié et il est sérieux.

**Recommandation.** Si régime B ou C, définir un canal avant de construire : contenu écrit sur les messages difficiles (terrain naturel pour un DRH), usage professionnel via des managers, ou intégration à un contexte existant (formation, accompagnement RH). Si aucun canal ne se dégage, rester en régime A — ce qui est une conclusion parfaitement acceptable.

---

## Volet juridique — au-delà du RGPD

## 3 — Responsabilité sur les propositions générées

**Constat.** Nuance suggère des mots dans des situations à enjeu (rupture, conflit professionnel, litige de voisinage). Un utilisateur pourrait imputer au service une conséquence dommageable : « la formulation proposée m'a fait perdre mon procès / mon emploi ». Le risque juridique réel est faible, mais l'exposition réputationnelle ne l'est pas.

**Recommandation.** Conditions d'utilisation courtes et claires dès la mise en ligne publique : outil d'aide à la rédaction, l'utilisateur reste seul auteur et responsable de ce qu'il envoie, aucune valeur de conseil juridique ou psychologique. Deux paragraphes suffisent — mais ils doivent exister.

## 4 — Le message d'un tiers, en droit et pas seulement en RGPD

**Constat.** L'audit n°1 a traité le mode « Je reçois » sous l'angle RGPD. Il existe un angle distinct : la correspondance privée d'autrui est protégée. Coller le message d'un tiers dans un service qui l'envoie à un fournisseur IA n'est pas neutre, même sans stockage.

**Recommandation.** Renforce l'exigence déjà posée : traitement strictement éphémère, aucun entraînement, mention explicite. C'est aussi un argument de communication.

## 5 — Mineurs

**Constat.** Le cas d'usage « adolescents » figure dans le concept. Un service traitant des messages de mineurs déclenche des obligations renforcées (consentement parental, modération, classification store). Aucun audit ne l'avait relevé.

**Recommandation.** En régime B ou C, réserver explicitement l'usage aux majeurs en v1. Élargir plus tard, en connaissance de cause.

## 6 — Dépendance à un fournisseur unique

**Constat.** Le service dépend entièrement d'un fournisseur d'IA : changement de prix, de politique d'usage, ou fermeture d'accès mettent le produit à l'arrêt. Aucun plan de repli n'existe.

**Recommandation.** Isoler l'appel au moteur derrière une seule fonction dans le code, pour pouvoir changer de fournisseur sans réécrire l'application. Coût nul si fait dès le départ, coûteux après.

---

## Volet économique

## 7 — Le prix testé (3 €/mois) est probablement en dessous du seuil de viabilité

**Constat.** Le protocole de test propose 3 €/mois. À ce prix, après commissions des magasins (jusqu'à 30 %) et coûts d'inférence, la marge unitaire est très faible — et il faut des milliers d'abonnés pour que le projet ait un sens économique. Or l'usage est **épisodique** (on n'écrit pas un message difficile tous les jours), ce qui est le pire profil pour un abonnement : l'utilisateur ne voit pas la valeur du prélèvement mensuel et se désabonne.

**Recommandation.** Si régime C, tester deux modèles alternatifs : paiement unique (achat définitif, cohérent avec un usage épisodique) ou modèle professionnel (licence pour une équipe, un service RH, un organisme de formation) — beaucoup plus cohérent avec le réseau du porteur qu'un marché grand public.

## 8 — Le marché grand public est probablement le mauvais marché

**Constat.** Le benchmark n°1 a montré des concurrents grand public bien financés. Aucun audit n'a envisagé le marché **professionnel**, où le porteur a un accès direct, une crédibilité et un réseau : managers qui doivent recadrer, RH qui annoncent des décisions difficiles, service client.

**Recommandation.** Poser sérieusement la question avant le test utilisateur, car elle change la cible du test lui-même. C'est peut-être le repositionnement le plus rentable du dossier.

## 9 — Le coût du succès

**Constat.** Le risque financier ne vient pas de l'échec mais de la réussite : une diffusion inattendue sans quotas génère une facture d'inférence non plafonnée.

**Recommandation.** Plafond de dépense absolu configuré chez le fournisseur dès le premier jour de mise en ligne, avant même les quotas par utilisateur. Non négociable.

---

## Volet exploitation et qualité

## 10 — Aucun dispositif de mesure ni de correction

**Constat.** L'audit n°2 a proposé le taux d'envoi comme métrique. Il manque le reste de la boucle : que se passe-t-il quand le moteur produit une mauvaise proposition ? Aucun canal de signalement, aucun moyen de reproduire le cas, aucun processus de correction.

**Recommandation.** Un bouton « cette proposition ne va pas » qui enregistre le cas anonymisé, et une revue régulière. C'est aussi une exigence des magasins pour les applications à contenu génératif.

## 11 — Aucun jeu de tests de non-régression

**Constat.** Toute modification des consignes du moteur peut dégrader silencieusement des cas qui fonctionnaient. C'est le risque classique et invisible des produits pilotés par prompt.

**Recommandation.** Constituer un jeu de 20 à 30 cas de référence (dont les cas limites : message coercitif, message en danger, message déjà adapté, message ferme légitime) et le repasser à chaque modification du moteur. Directement transposable de la doctrine d'audit déjà appliquée sur un autre projet du porteur.

## 12 — Aucune condition d'arrêt définie

**Constat.** Le dossier prévoit comment avancer, jamais comment s'arrêter. Un projet sans condition de sortie continue par inertie longtemps après avoir cessé d'être utile.

**Recommandation.** Fixer maintenant, à froid, deux seuils : *« si moins de la moitié des propositions sont jugées envoyables au test, on retravaille le moteur ou on arrête »* et *« si après six semaines en ligne le taux d'envoi reste faible, on repasse en régime A »*. Décider ces seuils avant d'être engagé émotionnellement est le meilleur service à se rendre.

---

## Synthèse

| # | Constat | Priorité |
|---|---|---|
| X1 | Choisir le régime d'ambition (A / B / C) | **À trancher avant tout le reste** |
| X2 | Canal de distribution — la honte d'usage bloque le bouche-à-oreille | Haute, avant de construire |
| 8 | Marché professionnel plutôt que grand public ? | Haute, change la cible du test |
| 9 | Plafond de dépense chez le fournisseur | Haute, dès la mise en ligne |
| 3, 4, 5 | CGU, correspondance de tiers, majeurs uniquement | Avant ouverture publique |
| 6 | Isoler l'appel moteur (indépendance fournisseur) | Dès la V1, coût nul |
| 7 | Modèle de prix : usage épisodique ≠ abonnement | Si régime C |
| 10, 11 | Signalement, correction, tests de non-régression | V1 |
| 12 | Conditions d'arrêt définies à froid | Maintenant |

## Conclusion des trois audits

Le concept produit est solide et différencié. Les deux vraies questions ouvertes ne sont plus produit ni technique — elles sont **d'ambition** (X1) et **de marché** (X2, 8). Elles se tranchent en réfléchissant, pas en construisant.

**Rien ne justifie une ligne de code supplémentaire avant le test d'usage réel.**
