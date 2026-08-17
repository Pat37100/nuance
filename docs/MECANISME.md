# Le mécanisme d'intégration — ce qui est possible, et ce qui ne l'est pas

*16 août 2026. Note technique décisive. Contexte : le porteur veut tout faire lui-même, sans développeur externe, et vise une reformulation quasi instantanée pendant un échange rapide.*

---

## 1. La petite fenêtre flottante au-dessus du message : impossible sur iOS

**Verdict : non, et ce n'est pas une question de difficulté — c'est interdit par conception.**

iOS isole chaque application dans un bac à sable. Aucune app tierce ne peut dessiner par-dessus une autre application. C'est une règle de sécurité fondamentale du système : si c'était possible, n'importe quelle app pourrait afficher un faux champ de mot de passe par-dessus une app bancaire. Aucune API n'existe, aucune permission ne l'autorise, et cela ne changera pas.

**Sur Android, c'est possible** (permission « superposition d'écran », les bulles flottantes type Messenger). Mais le porteur est sur iPhone : cette voie ne sert pas au test personnel, seulement à une éventuelle version Android ultérieure.

## 2. Le clavier est, fonctionnellement, exactement ce qui était décrit

L'intuition était bonne, seule l'implémentation diffère. Un clavier personnalisé occupe **la zone immédiatement sous le champ de saisie**, et peut afficher une barre de suggestion au-dessus des touches. Concrètement : on tape dans WhatsApp, la proposition apparaît dans cette barre, on la touche, le texte est remplacé sur place.

C'est bien « un petit écran, à côté du message, instantanément ». C'est ce que font tous les concurrents identifiés (Tonen, CleverType, BossAI) — et c'est ce que DeepL ne fait **pas** sur mobile, où il se contente du menu Partager. Ce serait donc un avantage réel sur la référence citée.

### Les contraintes réelles du clavier iOS

| Contrainte | Conséquence |
|---|---|
| Pas d'accès réseau sans « Autoriser l'accès complet » | L'utilisateur doit activer un réglage effrayant, qui donne accès à tout ce qu'il tape. Frein d'adoption majeur et point de vigilance des stores. |
| Budget mémoire très serré | Interface simple obligatoire. Pas de fantaisie graphique. |
| Pas de fenêtres, alertes ni dialogues | Tout doit tenir dans la barre du clavier. |
| Touche « globe » obligatoire | Imposée par Apple pour changer de clavier. |
| Activation manuelle par l'utilisateur | Réglages → Général → Clavier → Ajouter. Trois écrans avant le premier usage : c'est le principal point de perte d'utilisateurs. |

## 3. Est-ce faisable seul, sans développeur ?

**Oui, mais la marche est bien plus haute que tout ce qui a été fait jusqu'ici.**

Ce qui rend la chose envisageable : le code peut être entièrement écrit par l'assistant, comme cela a déjà été fait sur un autre projet. Ce qui la rend difficile : la boucle de fabrication n'a plus rien à voir avec une page web publiée sur GitHub Pages.

### Ce qu'il faut réellement

| Élément | Nécessaire ? | Coût |
|---|---|---|
| Compte développeur Apple | Oui, obligatoire pour installer sur son propre iPhone et publier | 99 €/an |
| Un Mac | **Non, contournable.** Les services de compilation dans le nuage (EAS Build) compilent des applications iOS depuis n'importe quel système d'exploitation | gratuit puis payant selon volume |
| Clé API pour le moteur | Oui | quelques euros |
| Backend (Cloudflare) | Oui, pour ne pas mettre la clé dans le clavier | gratuit |
| Validation App Store | Oui, avec examen renforcé du fait de l'accès complet | délai de quelques jours |

**Point de vigilance honnête :** le clavier étant une extension native, l'assistant écrit le code, mais chaque erreur de compilation, de signature ou de provisionnement devra être diagnostiquée à distance, sur la base de messages d'erreur transmis. C'est faisable — cela demande de la patience et plusieurs allers-retours, pas quelques heures.

**Estimation réaliste :** plusieurs semaines de travail par intermittence, pas un week-end.

## 4. La tension de fond, à trancher avant d'investir

Une objection sérieuse mérite d'être posée, parce qu'elle peut inverser toute la stratégie.

**L'instantanéité est-elle vraiment la bonne cible ?** La valeur du produit repose en partie sur le fait de **s'arrêter avant d'envoyer**. Un outil qui s'intercale sans ralentir du tout supprime précisément le temps de recul qu'il est censé créer. À l'inverse, un outil trop lent ne sera jamais utilisé dans un échange vif.

Le bon réglage n'est donc probablement ni l'un ni l'autre : **rapide d'accès, mais avec une pause volontaire d'une seconde.** Le clavier permet ce dosage ; le menu Partager ne le permet pas (trop lent) ; une superposition totalement transparente ne le permettrait pas non plus (trop rapide).

Cela renforce le choix du clavier — mais pour une raison différente de celle avancée au départ.

## 5. Séquence recommandée

1. **Valider le moteur au menu Partager** (raccourci iOS, `docs/RACCOURCI-IOS.md`). Coût : 5 €. Objectif : vérifier que les reformulations sont bonnes. **Ce test ne juge pas l'ergonomie** — on sait déjà qu'elle est insuffisante.
2. **Trancher le nom** (contrainte marque, `docs/POSITIONNEMENT.md` § 5) avant de créer quoi que ce soit chez Apple.
3. **Ouvrir le compte développeur Apple** (99 €/an) — condition d'entrée incontournable.
4. **Construire le clavier iOS**, étape par étape, avec accompagnement. Version minimale : une seule barre, un seul bouton, la reformulation la plus proche du texte. Rien d'autre.
5. **Ajouter les fonctions** (registres, alternatives par mot, mode « Je reçois ») seulement après que le mécanisme fonctionne.

**Erreur à éviter :** vouloir porter les fonctions de la v7 dans la première version du clavier. Le clavier doit d'abord prouver qu'il s'insère bien dans le geste quotidien. Tout le reste vient ensuite.
