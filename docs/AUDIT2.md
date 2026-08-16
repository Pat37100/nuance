# Nuance — Audit indépendant n°2

*16 août 2026. Audit du concept après prototypes v1–v5 et identité v1. Doctrine : un audit qui ne trouve rien est un audit raté. Angle demandé : que peut-on encore améliorer, et comment déployer concrètement.*

**Bilan : 14 constats, dont 3 remises en cause de choix déjà faits (R1–R3) et 5 propositions d'enrichissement du concept.**

---

# Partie A — Ce que DeepL nous apprend vraiment

Le benchmark était demandé parce que DeepL est la référence. Il l'est pour des raisons précises, dont trois n'ont pas été exploitées jusqu'ici.

## R1 — La direction artistique actuelle contredit le modèle DeepL (remise en cause)

**Constat.** <cite>L'interface de DeepL est décrite comme simple et directe, centrée sur la zone de traduction sans encombrement superflu ; le design minimaliste facilite la saisie et la lecture rapide</cite>, là où Google Translate mise sur des couleurs vives. C'est précisément l'inverse de la planche d'identité produite : logotype en dégradé braise→prune→sauge, zone de saisie rose, zone de sortie verte, badges de tension colorés.

**Analyse critique.** La justification donnée (« la couleur raconte le passage du chaud au posé ») est une idée de directeur artistique, pas un service rendu à l'utilisateur. Elle a trois coûts réels :
- elle **dramatise** un moment où l'utilisateur est déjà tendu — un fond rose « à chaud » signale à quelqu'un d'énervé qu'il est énervé ;
- elle **catégorise** l'utilisateur (badge « Très tendu ») avec un jugement implicite, ce qui rejoint le répulsif du développement personnel identifié en audit n°1 ;
- elle **date** : les palettes expressives vieillissent, la neutralité non.

**Recommandation.** Revenir à une interface quasi neutre : fond clair unique, deux zones différenciées par un simple filet ou une nuance de gris, une seule couleur d'accent (le vert sauge) réservée aux actions. Le dégradé est conservé **uniquement** pour le logotype (identité de marque), pas dans l'app. Supprimer les badges de tension colorés : l'information « très tendu » n'aide pas l'utilisateur à décider, elle le juge.

**Contre-argument à garder en tête :** une différenciation visuelle minimale entrée/sortie reste nécessaire, sinon on ne sait plus ce qu'on lit. Neutre ne veut pas dire indifférencié.

## 2 — L'alternative par mot : la fonction la plus copiable et la plus décisive

**Constat.** La fonction la plus distinctive de DeepL est peu commentée : <cite>on peut cliquer sur n'importe quel mot traduit pour voir des traductions alternatives, et si l'on en choisit une autre, le reste du texte se met automatiquement à jour pour rester cohérent</cite>.

**Pourquoi c'est majeur pour Nuance.** C'est exactement le chaînon manquant du produit. Aujourd'hui l'utilisateur subit une proposition en bloc : il la prend ou la laisse. Or dans un message personnel, c'est souvent **un seul mot** qui coince (« déçu » est trop fort, « gêné » trop faible). Permettre de toucher un passage surligné pour voir 2–3 variantes d'intensité, et voir la phrase se réajuster, transformerait Nuance d'un correcteur en **instrument de dosage**. Cela sert directement la promesse du nom.

**Recommandation.** En faire la fonction phare de la v6. Techniquement peu coûteux : les alternatives sont générées dans le même appel que la proposition initiale.

## 3 — Le curseur à 3 crans est moins bon que le modèle DeepL

**Constat.** DeepL n'offre pas trois intensités de traduction : il offre **un axe binaire de registre** (formel / informel). <cite>Un simple sélecteur permet de choisir entre registre formel et informel, ce qui est déterminant dans les langues où la formalité change significativement le texte.</cite>

**Analyse.** Le curseur actuel (Au plus près / Apaisé / Repensé) mélange deux dimensions distinctes : *combien on s'éloigne du texte d'origine* et *quel ton on vise*. Les crans 2 et 3 se ressemblent souvent à l'usage — c'était déjà l'intuition en fin de v3, elle se confirme.

**Recommandation.** Séparer les deux : un réglage d'**intensité** (au plus près ↔ refonte) et un réglage de **posture** (ouvrir ↔ poser une limite), ce dernier étant l'équivalent du formel/informel de DeepL. Alternative plus sobre, à tester : ne garder que « Au plus près » par défaut + un seul bouton « Aller plus loin ». À trancher par le test utilisateur, pas par intuition.

## 4 — La confidentialité comme argument commercial, pas comme contrainte

**Constat.** <cite>Les versions gratuites de Google Translate comme de DeepL conservent l'historique des textes traduits ; DeepL Pro, en revanche, offre des standards de protection des données de premier plan et supprime les textes immédiatement après traduction.</cite> DeepL a fait de la confidentialité un **argument de vente**, pas une mention légale.

**Recommandation.** Nuance traite des messages plus intimes que des documents professionnels. La suppression immédiate doit être affichée en clair sur l'écran d'accueil et dans la fiche store — c'est un différenciateur, pas une contrainte à subir.

---

# Partie B — La valeur ajoutée propriétaire : le glossaire de techniques

## 5 — L'équivalent du glossaire DeepL est le chaînon manquant du modèle économique

**Constat.** La fonction que DeepL réserve à ses offres payantes est le **glossaire** : <cite>les équipes peuvent définir des traductions de termes personnalisées pour garantir la cohérence, ce qui a une valeur particulière pour les contenus techniques ou de marque</cite>. C'est ce qui transforme un traducteur générique en outil qui *vous* appartient.

**Transposition à Nuance.** Un utilisateur qui écrit à son adolescent, à son N+1 ou à son syndic n'a pas besoin du même registre. Un **profil de destinataire** (2–3 fiches : « travail », « famille », « administratif ») qui mémorise le registre, le tutoiement, les formulations à éviter, serait l'équivalent exact du glossaire — et le meilleur candidat à la fonction payante. Il crée en plus un effet de rétention : plus on l'utilise, plus il devient juste.

**Attention RGPD :** un profil mémorisé = du stockage, donc l'inverse du « zéro donnée » revendiqué. À concevoir en **stockage local sur l'appareil** exclusivement, jamais serveur.

## 6 — Les techniques à intégrer au moteur (demande explicite du porteur)

Le moteur applique aujourd'hui un principe général de reformulation. Il peut faire beaucoup mieux en s'appuyant sur des techniques identifiées, **nommées en interne mais jamais affichées** (règle éditoriale de l'audit n°1). Six leviers à spécifier dans le prompt système, avec leur traduction en langage courant :

| Technique (interne) | Ce que ça fait concrètement | Formulation visible côté UI |
|---|---|---|
| Observation vs évaluation (CNV) | « Tu es irrespectueux » → « Tu n'as pas répondu à mes deux messages » | « Un fait précis plutôt qu'un jugement » |
| Message au « je » | Retire l'accusation sans retirer le fond | « Parler de soi plutôt que de l'autre » |
| Demande claire et négociable | Une demande concrète remplace le reproche implicite | « Une demande à laquelle on peut dire oui » |
| Question d'échelle / exception (approche orientée solution) | « Quand est-ce que ça s'est bien passé ? » ouvre une issue | « Chercher ce qui marche déjà » |
| Recadrage temporel | « Tu ne fais jamais » → « ces dernières semaines » | « Éviter les jamais et les toujours » |
| Séparer la personne du problème (négociation raisonnée) | Attaque l'enjeu, pas l'interlocuteur | « S'en prendre au problème, pas à la personne » |

**Recommandation.** Ces six leviers deviennent la spécification du moteur, avec l'exigence qu'il indique lequel il a appliqué (affiché seulement en mode « Détails »). C'est ce qui rend les propositions reproductibles et auditables — et c'est **l'actif propriétaire du projet** : n'importe qui peut appeler une IA, personne d'autre n'a cette grille.

## 7 — Le corpus de cas est le vrai avantage défendable à long terme

**Constat.** L'IA est une commodité : le concurrent qui recopie le concept aura le même moteur. Le seul actif non copiable serait un **corpus de cas** (message d'origine → reformulation validée → retour d'usage : envoyé ? a-t-il désamorcé ?).

**Recommandation.** Dès le test utilisateur, consigner méthodiquement chaque cas. Ce corpus servira à régler le moteur, à mesurer la qualité et, plus tard, à démontrer la valeur. Aucune donnée d'utilisateur tiers sans consentement explicite.

---

# Partie C — Angles morts non traités par l'audit n°1

## 8 — Aucune mesure de qualité n'existe

Le projet n'a aucun indicateur : rien ne dit si une proposition est bonne. **Recommandation :** définir la métrique unique du produit — **le taux d'envoi** (proportion de propositions effectivement copiées/envoyées). Simple, honnête, non déclaratif. Tout le reste en découle.

## 9 — Le cas du message long et du fil de discussion

Les protos supposent un message court et isolé. En réalité, un conflit écrit est souvent un **fil** de plusieurs messages, et parfois un mail long. Le comportement est indéfini dans les deux cas. **Recommandation :** cadrer explicitement la v1 sur le message court isolé, et l'assumer comme une limite plutôt que de produire des résultats médiocres sur les fils.

## 10 — L'utilisateur qui a raison

Le concept suppose implicitement qu'il faut toujours adoucir. Or parfois le message brut est **légitime et proportionné** : quelqu'un a le droit d'être ferme. Un outil qui adoucit systématiquement peut pousser à l'auto-effacement — un risque réel, en particulier pour des profils déjà en difficulté à poser des limites. **Recommandation :** le moteur doit pouvoir répondre « votre message est adapté tel quel ». C'est une fonction de confiance majeure, et un contrepoids éthique nécessaire.

## 11 — Le nom reste le risque le plus concret (rappel R2)

Constat B1 de l'audit n°1 toujours ouvert et non traité. Rappel : collision probable avec Nuance Communications (Microsoft), acteur du traitement du langage. Chaque semaine de travail supplémentaire sous ce nom augmente le coût d'un changement. **Action : recherche INPI/EUIPO avant tout dépôt de domaine ou de fiche store.**

## 12 — Anglais et international (R3)

Le concept, le moteur et l'identité sont entièrement pensés en français. Les techniques de reformulation sont pourtant largement culturelles : le registre direct est valorisé dans certaines cultures, mal vu dans d'autres. **Recommandation :** assumer le français comme marché initial et ne pas prétendre à l'international avant d'avoir validé l'usage. Le nom « Nuance » fonctionne dans les deux langues, c'est son seul avantage.

---

# Partie D — Déploiement concret

## 13 — Architecture minimale de la V1

| Brique | Choix recommandé | Coût |
|---|---|---|
| Front | Page statique, GitHub Pages (dépôt existant) | 0 € |
| Backend | Cloudflare Workers — porte la clé API, le prompt système, les garde-fous, les quotas | 0 € jusqu'à 100k requêtes/jour |
| Moteur IA | Modèle rapide pour « au plus près », modèle plus puissant pour les refontes | quelques centimes / message |
| Stockage | Aucun côté serveur. Profils destinataires en local sur l'appareil | 0 € |
| Mesure | Compteur anonyme du taux d'envoi | 0 € |

**Point non négociable :** le prompt système et les garde-fous doivent vivre **côté serveur**. Dans les prototypes actuels ils sont côté client, donc lisibles et contournables — acceptable pour un prototype, disqualifiant en production.

## 14 — Séquence de déploiement recommandée

1. **Test d'usage** (protocole existant, `docs/TEST.md`) — sans rien construire. *Critère de passage : plus de la moitié des propositions envoyables telles quelles.*
2. **Recherche d'antériorité du nom** — en parallèle, 30 minutes.
3. **v6 du prototype** — DA neutralisée (R1), alternatives par mot (constat 2), réponse « votre message est adapté » (constat 10), six techniques dans le moteur (constat 6).
4. **V1 en ligne** — Cloudflare Workers + page statique, accessible par lien, testable par n'importe qui sur son téléphone. C'est le premier vrai jalon public.
5. **Mesure du taux d'envoi sur 4–6 semaines.**
6. **Décision Play Store / clavier** — seulement si la fréquence d'usage est démontrée.

**Ce qu'il ne faut pas faire :** développer le clavier, l'application native ou le compte utilisateur avant l'étape 5. Ce sont les trois postes qui coûtent cher et qui ne servent à rien si l'usage n'est pas prouvé.

---

## Synthèse des priorités

| # | Constat | Priorité |
|---|---|---|
| R1 | Neutraliser la direction artistique (modèle DeepL) | Haute — v6 |
| 2 | Alternatives par mot avec réajustement | Haute — v6, fonction phare |
| 10 | Pouvoir dire « votre message est adapté » | Haute — v6, enjeu éthique |
| 6 | Six techniques spécifiées dans le moteur | Haute — v6 |
| 11 | Antériorité du nom | Haute — avant tout investissement |
| 3 | Séparer intensité et posture | Moyenne — à trancher par le test |
| 5 | Profils destinataires (stockage local) | Moyenne — candidat payant |
| 8 | Taux d'envoi comme métrique unique | Moyenne — V1 |
| 13 | Prompt et garde-fous côté serveur | Haute — V1, non négociable |
| 4, 7, 9, 12 | Confidentialité affichée, corpus, périmètre, langue | À intégrer au fil |

*Prochain audit : après le test d'usage réel, avec les données du terrain.*
