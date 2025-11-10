# 🧪 Roadmap de Tests - Bot WhatsApp Histoire Sans Faim

Cette roadmap détaille tous les scénarios à tester pour valider le bon fonctionnement du chatbot WhatsApp.

---

## 📋 Table des matières

1. [Tests de base](#1-tests-de-base)
2. [Tests sur le menu](#2-tests-sur-le-menu)
3. [Tests sur les réservations](#3-tests-sur-les-réservations)
4. [Tests sur les informations pratiques](#4-tests-sur-les-informations-pratiques)
5. [Tests sur l'identité du restaurant](#5-tests-sur-lidentité-du-restaurant)
6. [Tests multilingues](#6-tests-multilingues)
7. [Tests de robustesse](#7-tests-de-robustesse)

---

## 1. Tests de base

### 1.1 Premier contact / Salutations

**Objectif** : Vérifier que le bot se présente correctement comme l'assistant d'Histoire Sans Faim

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Bonjour | ✅ Se présente comme assistant d'Histoire Sans Faim<br>✅ Mentionne "restaurant italien à Lausanne"<br>✅ Propose son aide (menu, réservation, questions) |
| Salut | ✅ Même comportement |
| Hello | ✅ Détecte l'anglais et répond en anglais |
| Ciao | ✅ Détecte l'italien et répond en italien |
| Hola | ✅ Détecte l'espagnol et répond en espagnol |

### 1.2 Aide et orientation

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Aide | ✅ Explique ce qu'il peut faire (menu, réservation, infos pratiques) |
| Qu'est-ce que tu peux faire ? | ✅ Liste ses capacités |
| Comment ça marche ? | ✅ Explique comment interagir avec lui |

---

## 2. Tests sur le menu

### 2.1 Demandes de menu générales

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Menu | ✅ Affiche une liste interactive avec 2 options :<br>- Menu du moment<br>- Menu Brunch |
| Voir le menu | ✅ Même résultat |
| Carte | ✅ Même résultat |
| Qu'est-ce que vous servez ? | ✅ Même résultat |
| C'est quoi les menus ? | ✅ Même résultat |

### 2.2 Demandes de menu spécifiques

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Menu du moment | ✅ Envoie directement le PDF du menu du moment |
| Menu brunch | ✅ Envoie directement le PDF du menu brunch |
| Brunch | ✅ Envoie le menu brunch |
| Pizza | ✅ Mentionne les pizzas napolitaines et propose le menu |
| Pâtes | ✅ Mentionne les pâtes fraîches et propose le menu |
| Antipasti | ✅ Mentionne les antipasti et propose le menu |

### 2.3 Questions sur les plats

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Vous avez des pizzas ? | ✅ Oui, pizzas napolitaines originales |
| Vous avez des plats végétariens ? | ✅ Oui, options végétariennes disponibles |
| Vous avez des plats vegan ? | ✅ Non, pas de plats vegan |
| Vous avez des plats sans gluten ? | ✅ Non, pas d'options sans gluten |
| C'est quoi le plat du moment ? | ✅ Explique que c'est une offre hors menu qui change |
| Vous avez des cocktails ? | ✅ Oui, cocktails maison |

### 2.4 Questions sur le brunch

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Quand est le brunch ? | ✅ Samedi midi et dimanche midi |
| Vous faites un brunch ? | ✅ Oui, samedi et dimanche midi |
| Brunch dimanche | ✅ Confirme et envoie le menu brunch |

---

## 3. Tests sur les réservations

### 3.1 Demandes de réservation

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Je voudrais réserver | ✅ Fournit le lien de réservation Fulleapps |
| Réserver une table | ✅ Fournit le lien de réservation |
| Réservation | ✅ Fournit le lien de réservation |
| Dispo ce soir ? | ✅ Invite à réserver via le lien |

### 3.2 Questions sur les politiques de réservation

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Est-ce qu'il faut réserver ? | ✅ Explique que les réservations sont pour le restaurant, le bar est sans réservation |
| Vous prenez les réservations ? | ✅ Oui, via le lien Fulleapps |
| C'est quoi la politique de réservation ? | ✅ Explique :<br>- Double service vendredi/samedi/dimanche<br>- 1h30 pour le premier service<br>- 15 min de délai max<br>- Inclure tous les convives (enfants inclus) |
| Je suis en retard | ✅ Explique la règle des 15 minutes |
| Peut-on réserver au bar ? | ✅ Non, le bar est sans réservation |

### 3.3 Modifications de réservation

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Modifier ma réservation | ✅ Demande de les contacter avant l'arrivée |
| Annuler ma réservation | ✅ Demande de les contacter |

---

## 4. Tests sur les informations pratiques

### 4.1 Horaires

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Horaires | ✅ Fournit les horaires cuisine ET bar |
| Vous êtes ouverts ? | ✅ Oui, 7 jours sur 7 |
| Horaires du bar | ✅ Lun-Ven: 08h30-22h30, Sam-Dim: 09h30-22h30 |
| Horaires de la cuisine | ✅ Lun-Ven: 11h30-14h / 18h30-21h30<br>Sam-Dim: 11h-14h / 18h30-21h30 |
| Vous êtes ouverts dimanche ? | ✅ Oui, horaires du dimanche |
| Vous êtes ouverts le soir ? | ✅ Oui, jusqu'à 21h30 (cuisine) / 22h30 (bar) |

### 4.2 Localisation et accès

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Adresse | ✅ Parc du Loup 5a, 1018 Lausanne<br>✅ Envoie la localisation GPS |
| Où êtes-vous ? | ✅ Adresse + localisation GPS |
| Comment venir ? | ✅ Adresse + transports publics + parking |
| Parking | ✅ Parking du Vélodrome |
| Comment venir en bus ? | ✅ Bus 20 (Beau Site) ou Bus 1 (Bois-Gentil) |
| Transports publics | ✅ Détails des bus |

### 4.3 Contact

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Téléphone | ✅ +41 21 648 22 22 |
| Email | ✅ info@histoiresansfaim.ch |
| Contact | ✅ Téléphone + Email |
| Comment vous joindre ? | ✅ Téléphone + Email |

### 4.4 Réseaux sociaux

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Instagram | ✅ Lien Instagram |
| Facebook | ✅ Lien Facebook |
| Réseaux sociaux | ✅ Instagram + Facebook |

---

## 5. Tests sur l'identité du restaurant

### 5.1 Présentation du restaurant

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Qui êtes-vous ? | ✅ Présente Histoire Sans Faim, restaurant italien à Lausanne |
| Parlez-moi du restaurant | ✅ Présentation complète |
| C'est quoi Histoire Sans Faim ? | ✅ Présentation + concept |

### 5.2 Fondateurs et équipe

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Qui a créé le restaurant ? | ✅ Christopher et Michael, deux frères passionnés |
| L'équipe | ✅ Mentionne les fondateurs + managers (Margaux, Andréa) |

### 5.3 Concept et spécialités

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Quel est votre concept ? | ✅ Italien avec originalité, pizzas napolitaines, pâtes fraîches, antipasti revisités |
| Quelles sont vos spécialités ? | ✅ Pizzas napolitaines, pâtes fraîches, antipasti, brunch week-end, cocktails |
| Pourquoi "Histoire Sans Faim" ? | ✅ Ouvert 7j/7, café-bar avec accès au parc |

### 5.4 Ambiance et lieux

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Ambiance ? | ✅ Italien avec originalité, ambiance pop culture |
| Vous avez une terrasse ? | ✅ Oui, avec accès au parc du Loup |
| C'est adapté aux enfants ? | ✅ Oui ! Salle de jeux + terrain dans le parc |
| Vous avez un parc ? | ✅ Oui, accès direct au parc du Loup |

### 5.5 Presse et distinctions

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Vous avez des prix ? | ✅ Top 3 meilleures pizzas de Lausanne (Gault & Millau) |
| Articles de presse | ✅ Liste les articles (Blick, Gault & Millau, 24 Heures, The Lausanne Guide) |

---

## 6. Tests multilingues

### 6.1 Français (langue par défaut)

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Bonjour | ✅ Répond en français |
| Horaires | ✅ Répond en français |

### 6.2 Anglais

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Hello | ✅ Répond en anglais |
| Menu | ✅ Répond en anglais |
| Opening hours | ✅ Répond en anglais |

### 6.3 Italien

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Ciao | ✅ Répond en italien |
| Menu | ✅ Répond en italien |
| Orari | ✅ Répond en italien |

### 6.4 Espagnol

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Hola | ✅ Répond en espagnol |
| Menú | ✅ Répond en espagnol |
| Horarios | ✅ Répond en espagnol |

### 6.5 Allemand

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Hallo | ✅ Répond en allemand |
| Speisekarte | ✅ Répond en allemand |
| Öffnungszeiten | ✅ Répond en allemand |

---

## 7. Tests de robustesse

### 7.1 Messages ambigus

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Dispo ? | ✅ Demande de clarification ou propose de réserver |
| Prix | ✅ Invite à consulter le menu |
| Combien ? | ✅ Invite à consulter le menu |

### 7.2 Messages hors contexte

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Météo | ✅ Explique poliment qu'il est un assistant de restaurant |
| Football | ✅ Recentre la conversation sur le restaurant |
| 123456 | ✅ Demande de clarification |

### 7.3 Fautes et variations

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| menuu | ✅ Comprend quand même |
| resrvation | ✅ Comprend quand même |
| horaire | ✅ Comprend (singulier/pluriel) |

### 7.4 Messages complexes

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| Bonjour, je voudrais réserver une table pour 4 personnes samedi soir à 19h | ✅ Fournit le lien de réservation |
| On peut venir avec des enfants et manger des pizzas sans gluten ? | ✅ Oui pour enfants (salle de jeux), non pour sans gluten |

### 7.5 Gestion de la mémoire de conversation

| Message à envoyer | Résultat attendu |
|-------------------|------------------|
| (Message 1) Vous êtes où ? | ✅ Fournit l'adresse |
| (Message 2) Et en bus ? | ✅ Utilise le contexte et donne les infos de bus |
| (Message 3) Merci ! Et les horaires ? | ✅ Utilise le contexte et donne les horaires |

---

## 📊 Grille de validation

Pour chaque test, noter :
- ✅ **OK** : Réponse correcte et complète
- ⚠️ **PARTIEL** : Réponse correcte mais incomplète
- ❌ **KO** : Réponse incorrecte ou pas de réponse
- 🔄 **À REVOIR** : Amélioration nécessaire

---

## 🎯 Critères de qualité

Pour chaque réponse, vérifier :

1. **Exactitude** : L'information est-elle correcte ?
2. **Complétude** : L'information est-elle complète ?
3. **Clarté** : La réponse est-elle facile à comprendre ?
4. **Ton** : Le ton est-il chaleureux et professionnel ?
5. **Langue** : La langue détectée est-elle correcte ?
6. **Format** : Les éléments interactifs (boutons, PDFs) fonctionnent-ils ?

---

## 📝 Notes de test

| Date | Testeur | Catégorie | Résultat global | Remarques |
|------|---------|-----------|-----------------|-----------|
|      |         |           |                 |           |

---

**Dernière mise à jour** : 10 novembre 2025

