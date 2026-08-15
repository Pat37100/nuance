# Protocole de test — Nuance

*Étape 2 de la feuille de route. Objectif : savoir si Nuance sert vraiment, avant de construire davantage.*

## Pourquoi ce protocole

Le risque principal du projet n'est pas technique : c'est de construire quelque chose que personne n'utilise. Ce test coûte zéro euro et prend une semaine. Il doit produire un verdict, pas des compliments.

**Piège à éviter :** les proches disent « c'est sympa ». C'est une réponse polie, pas une donnée. Tout ce protocole vise à obtenir autre chose que ça.

## Le test à faire soi-même d'abord (30 minutes)

Rassembler **6 vrais messages délicats** déjà vécus, pas des exemples inventés — c'est la condition n°1 de validité :

| # | Type | Contexte |
|---|---|---|
| 1 | Recadrage pro | un message qu'on a hésité à envoyer à un collègue |
| 2 | Refus | une demande qu'on a dû décliner |
| 3 | Perso tendu | couple, famille ou adolescent |
| 4 | Message reçu blessant | mode « Je reçois » |
| 5 | Message simplement ferme | ex. « Je ne validerai pas ce budget en l'état » — **ne doit PAS être bloqué** |
| 6 | Message de pression | ex. chantage voilé — **doit être refusé** |

Pour chacun, une seule question, binaire :

> **Est-ce que j'aurais envoyé cette proposition telle quelle ?** Oui / Non / Après retouche

**Seuil de décision :** si moins de la moitié des propositions sont envoyables telles quelles, le moteur n'est pas au point — inutile de développer plus loin, il faut d'abord retravailler les consignes du moteur.

## Le test avec 4 à 6 personnes

**Qui :** Mélanie, 2 collègues (dont un plutôt réfractaire au développement personnel — c'est le test décisif du repositionnement), 1 ou 2 amis. Éviter les seuls enthousiastes.

**Comment :** l'app n'étant pas encore en ligne, faire tester en direct (téléphone en main) ou par captures. 15 minutes par personne suffisent.

**Ce qu'on observe (plus important que ce qui est dit) :**
- Comprend-elle l'écran sans explication ?
- Utilise-t-elle le curseur, ou reste-t-elle sur « Au plus près » ?
- Ouvre-t-elle « L'autre côté » ?
- Hésite-t-elle avant de copier ? À quel endroit exactement ?

**Les 5 questions à poser (dans cet ordre) :**
1. « Qu'est-ce que fait cette app, selon toi ? » *(teste la clarté du positionnement)*
2. « Aurais-tu envoyé cette version ? » *(la seule qui compte)*
3. « Est-ce que ça te ressemble encore, ou ça ne parle plus comme toi ? » *(teste l'authenticité)*
4. « Dans quelle situation tu l'aurais sorti cette semaine ? » *(teste la fréquence réelle du besoin — si personne ne trouve d'occasion, il n'y a pas de marché)*
5. « Est-ce que tu paierais 3 € par mois pour ça ? » *(poser la question du prix crûment ; l'embarras de la réponse est en soi une information)*

**Question à ne PAS poser :** « Tu aimes bien ? » — elle ne produit que de la politesse.

## Critères de décision

| Signal | Interprétation |
|---|---|
| Les gens trouvent spontanément des occasions d'usage récentes | Le besoin existe → continuer |
| « C'est bien fait mais je ne sais pas quand je m'en servirais » | Pas de fréquence → repenser la cible avant de construire |
| « Ça ne parle plus comme moi » | Le mode « Au plus près » n'est pas assez proche → corriger le moteur |
| Le testeur réfractaire n'a pas tiqué sur le ton | Le repositionnement fonctionne |
| Le message ferme (#5) a été bloqué | Faux positif du garde-fou → recalibrer |

## Ce qu'on décide ensuite

- **Signaux positifs** → V1 déployée (backend + quotas + cache, cf. AUDIT constats 11 et 14).
- **Signaux mitigés** → retravailler le moteur et retester, sans rien construire.
- **Signaux négatifs** → l'idée n'est pas morte, mais la cible ou le cas d'usage sont à revoir.

*Ne rien développer de plus avant d'avoir ces réponses.*
