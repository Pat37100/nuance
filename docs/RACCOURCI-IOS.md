# Tester depuis WhatsApp, aujourd'hui, sans développer d'application

*Objectif : éprouver l'ergonomie réelle de l'intégration à une messagerie, sur iPhone, avant tout développement.*

L'app **Raccourcis** (Apple, déjà installée) sait apparaître dans le menu Partager de n'importe quelle application, récupérer un texte, appeler un service et renvoyer un résultat. C'est le mécanisme universel décrit en phase 1 du concept — utilisable immédiatement.

**Ce que ça permet de tester :** le va-et-vient réel avec WhatsApp, le nombre de gestes, la latence, la friction. Autrement dit **exactement ce qui décidera si le clavier (phase 2) vaut son coût**.

---

## Prérequis unique : une clé API

Un raccourci ne peut pas appeler l'IA sans clé. Elle est distincte de l'abonnement Claude.

1. Aller sur `console.anthropic.com`, créer un compte.
2. Ajouter un crédit minimal (5 € suffisent très largement pour des centaines de tests).
3. Menu **API Keys** → **Create Key** → copier la clé (`sk-ant-…`). Elle ne s'affiche qu'une fois.

> Cette clé est un moyen de paiement : ne la partager avec personne, ne pas la mettre dans un message.

---

## Créer le raccourci (10 minutes)

Ouvrir **Raccourcis** → **+** → nommer *Nuance*.

### 1. Recevoir le texte
- Toucher le nom du raccourci en haut → **Détails** → activer **Afficher dans la feuille de partage**.
- Type d'entrée accepté : **Texte**.

### 2. Action « Obtenir le contenu de l'URL »
Rechercher l'action *Obtenir le contenu de l'URL*, puis dérouler **Afficher plus** :

- **URL** : `https://api.anthropic.com/v1/messages`
- **Méthode** : `POST`
- **En-têtes** (3 lignes) :
  - `x-api-key` → votre clé `sk-ant-…`
  - `anthropic-version` → `2023-06-01`
  - `content-type` → `application/json`
- **Corps de la requête** : `JSON`, avec les champs suivants :

| Clé | Type | Valeur |
|---|---|---|
| `model` | Texte | `claude-sonnet-4-6` |
| `max_tokens` | Nombre | `1000` |
| `system` | Texte | *le texte du § Consigne ci-dessous* |
| `messages` | Tableau | un élément, Dictionnaire : `role` = `user`, `content` = **Entrée du raccourci** |

### 3. Extraire la réponse
- Action **Obtenir la valeur du dictionnaire** → clé `content`
- Action **Obtenir l'élément d'une liste** → **Premier élément**
- Action **Obtenir la valeur du dictionnaire** → clé `text`

### 4. Rendre le résultat
- Action **Copier dans le presse-papiers**
- Action **Afficher le résultat**

---

## Consigne à coller dans le champ `system`

> Tu es un assistant d'écriture pour messages délicats. On te donne un message écrit à chaud, que la personne s'apprête à envoyer.
>
> Réécris-le avec une intervention MINIMALE : ne touche QUE les passages qui desservent son auteur (attaques, généralisations « tu ne fais jamais », jugements, agressivité). Garde tout le reste identique, ainsi que sa voix, son niveau de langue et son registre (tutoiement ou vouvoiement).
>
> Techniques à appliquer sans jamais les nommer : un fait précis plutôt qu'un jugement ; parler de soi plutôt que de l'autre ; une demande claire à laquelle on peut dire oui ; supprimer « jamais » et « toujours » au profit d'une période précise ; s'en prendre au problème, pas à la personne.
>
> Si le message est déjà proportionné — y compris s'il est ferme ou en net désaccord — ne l'adoucis pas : réponds exactement « Votre message est adapté tel quel. » Une personne a le droit d'être ferme.
>
> Si le message contient une menace, un chantage, une pression ou du contrôle sur quelqu'un, ne le reformule pas : réponds « Ce message ne sera pas reformulé. »
>
> Si le message évoque des violences ou une détresse vitale, ne le reformule pas : réponds « Cette situation dépasse une question de formulation. 3919 (violences), 3114 (souffrance psychique), 17 en cas d'urgence. »
>
> N'emploie jamais les mots : coaching, médiation, communication non violente, bienveillance, thérapie, développement personnel.
>
> Réponds UNIQUEMENT par le message reformulé, sans guillemets, sans commentaire, sans préambule.

---

## L'usage à tester dans WhatsApp

1. Écrire le message dans WhatsApp **sans l'envoyer**.
2. Le sélectionner, **Copier**.
3. Menu Partager → **Nuance** (ou : rester appuyé, Partager selon le contexte).
4. La reformulation s'affiche et est déjà dans le presse-papiers.
5. Revenir dans WhatsApp, tout sélectionner, **Coller**, relire, envoyer.

**Variante à comparer :** placer le raccourci en widget sur l'écran d'accueil, ou le déclencher par un double-tap au dos de l'iPhone (Réglages → Accessibilité → Toucher → Toucher le dos). Cela change beaucoup la fluidité perçue.

---

## Ce qu'il faut observer

C'est le vrai objet du test — noter les réponses, elles décident de la suite :

| Question | Pourquoi elle compte |
|---|---|
| Combien de gestes du début à la fin ? | Au-delà de 5-6, l'usage ne s'installe pas |
| Le temps d'attente est-il acceptable ? | Détermine si la reformulation doit être déclenchée manuellement |
| A-t-on envie de recommencer une deuxième fois ? | Le meilleur indicateur de friction réelle |
| Le copier-coller casse-t-il l'élan ? | Si oui, le clavier (phase 2) devient justifié — sinon il est inutile |
| Y a-t-on pensé au bon moment, ou après avoir envoyé ? | Le vrai enjeu du produit : être présent **avant** l'envoi |

Cette dernière question est la plus importante. Un outil parfait auquel on ne pense pas au bon moment ne sert à rien — et c'est un problème d'accès, pas de qualité de reformulation.

---

## Limites assumées de ce test

- Pas d'interface soignée : on teste **le flux**, pas le design.
- Pas de mode « Je reçois », pas de registres, pas d'alternatives par mot. Un second raccourci peut être créé pour le mode « Je reçois » sur le même modèle, en changeant la consigne.
- La clé API est en clair dans le raccourci : acceptable sur son propre téléphone, à ne jamais diffuser à des testeurs. Pour faire tester d'autres personnes, il faut la version en ligne avec backend.
