# Documentation des Mises à Jour - Bot WhatsApp Histoire Sans Faim(s)

## Date de Refactorisation
**Date**: 2025-11-07

## Objectif
Adapter le bot WhatsApp du restaurant INCA London pour le nouveau restaurant **Histoire Sans Faim(s)**, tout en conservant toutes les fonctionnalités WhatsApp existantes (boutons, templates, interactions Mastra).

---

## Fichiers Créés

### 1. `config/restaurant.profile.json`
**Description**: Profil complet du restaurant avec toutes les informations extraites du dossier `/scrap`.

**Contenu**:
- Informations générales (nom, description, fondateurs, équipe)
- Adresse complète et accès (parking, transports publics)
- Contacts (téléphone, email, réseaux sociaux)
- Horaires (cuisine et bar, 7j/7)
- Menus (à la carte et brunch)
- Politiques de réservation
- Spécialités et atmosphère
- Reconnaissance presse (Top 3 pizzas Lausanne - Gault & Millau)

**Source des données**: Dossier `/scrap` contenant les pages scrappées du site histoiresansfaim.ch

---

### 2. `prompt-merged.md`
**Description**: Prompt système fusionné combinant le prompt généraliste avec les fonctionnalités WhatsApp spécifiques.

**Structure**:
- **BLOC 1**: Identité & Mission (adapté pour Histoire Sans Faim)
- **BLOC 2**: Style Conversationnel (copié intégralement de `prompt.md`)
- **BLOC 3**: Objectifs & Philosophie (copié intégralement)
- **BLOC 4**: Compréhension & Réponse Intelligente (copié intégralement)
- **BLOC 5**: Informations Restaurant (données de `restaurant.profile.json`)
- **BLOC 6**: Gestion Spécifique WhatsApp & Menus (fonctionnalités boutons/templates)
- **BLOC 7**: Limitations & Signature
- **BLOC 8**: Directives de Ton Finales
- **RAPPEL FINAL**: Sources de vérité (hiérarchie: profile.json > /scrap > inconnu)

**Longueur**: 1212 lignes

**Sources**:
- Prompt généraliste: `prompt.md`
- Fonctionnalités WhatsApp: ancien prompt dans `src/agent/mastra.ts`
- Informations restaurant: `config/restaurant.profile.json` + `/scrap`

---

### 3. `src/agent/promptLoader.ts`
**Description**: Module utilitaire pour charger le prompt système et le profil restaurant depuis des fichiers externes.

**Fonctions**:
- `loadSystemInstructions()`: Charge le prompt depuis `prompt-merged.md`
- `loadRestaurantProfile()`: Charge le profil JSON depuis `config/restaurant.profile.json`

**Avantages**:
- Séparation du code et de la configuration
- Facilité de mise à jour du prompt sans modifier le code
- Meilleure maintenabilité

---

## Fichiers Modifiés

### 1. `src/agent/mastra.ts`

**Changements**:
1. **Import ajouté**: `import { loadSystemInstructions } from './promptLoader';`

2. **Chargement du prompt**:
   - Avant: Prompt inline de 1140 lignes dans le code
   - Après: `const SYSTEM_INSTRUCTIONS = loadSystemInstructions();`

3. **Renommage de l'agent**:
   - Avant: `incaLondonAgent`
   - Après: `histoireSansFaimAgent`

4. **Nouvelle fonction**: `getHistoireSansFaimAgent(mastra: Mastra)`
   - Remplace `getIncaAgent` (conservé pour rétrocompatibilité)

5. **Documentation mise à jour**:
   ```typescript
   /**
    * System instructions for the Histoire Sans Faim agent
    * Loaded from prompt-merged.md which combines:
    * - Premium conversational style from prompt.md
    * - WhatsApp-specific features (buttons, templates, multilingual)
    * - Restaurant-specific information from config/restaurant.profile.json
    */
   ```

---

## Adaptations Principales

### Ton & Style
- **Avant (INCA London)**: Haut de gamme VIP, prestige, élégant, formel
- **Après (Histoire Sans Faim)**: Convivial, familial, chaleureux, italien authentique

### Public Cible
- **Avant**: Adultes 18+ uniquement, code vestimentaire strict, expérience club
- **Après**: Familles bienvenues, enfants acceptés, ambiance conviviale

### Type d'Établissement
- **Avant**: Restaurant latino-américain avec dîner-spectacle immersif, club Luna Lounge
- **Après**: Restaurant italien familial et pizzeria, pizzas napolitaines, brunch week-end

### Emplacement
- **Avant**: Londres (Soho)
- **Après**: Lausanne (Parc du Loup)

### Système de Réservation
- **Avant**: SevenRooms (`https://www.sevenrooms.com/reservations/incalondon`)
- **Après**: Fulleapps (`https://webshop.fulleapps.io/tr/histoire-sans-faim/mzewnzi3xzy2ngm`)

### Menus
- **Avant**: 4 menus (À la Carte, Wagyu Platter, Vin, Boissons)
- **Après**: 2 menus (À la Carte, Brunch)

---

## Fonctionnalités Conservées

### ✅ Interactions WhatsApp
- Boutons interactifs pour la sélection des menus
- Quick replies
- Templates de messages
- Pagination

### ✅ Détection Multilingue
- Détection automatique de la langue du client
- Support français, anglais, allemand, italien, espagnol, portugais
- **Priorité**: Français (contexte Lausanne)

### ✅ Gestion des Menus
- Système de boutons automatiques
- Détection de mots-clés multilingues
- Envoi proactif de suggestions de réservation après consultation du menu

### ✅ Format WhatsApp
- Pas de markdown (*, _, etc.)
- Texte brut uniquement
- Messages courts et aérés

### ✅ Philosophie de Service
- 4 piliers: Clarté, Chaleur, Efficacité, Humanité
- Ton professionnel mais chaleureux
- Anticipation des besoins clients
- Proactivité dans les propositions

---

## Règles de Vérité (Hiérarchie des Sources)

Lors de la recherche d'une information, le bot suit cet ordre de priorité :

1. **`config/restaurant.profile.json`** (source de vérité principale)
2. **Documents `/scrap`** (informations complémentaires)
3. **`prompt-merged.md`** (instructions et guidelines)
4. **Si information non disponible**: Ne pas inventer, rediriger vers le restaurant

---

## Intents Principaux Supportés

- `reservation_demande`
- `reservation_confirmation`
- `reservation_question`
- `modification` / `annulation`
- `horaires`
- `adresse_acces`
- `menu`
- `brunch` (nouveau)
- `allergenes`
- `options_specifiques` (végétarien, etc.)
- `groupes`
- `prix`
- `ambiance`
- `info_generale`
- `reclamation`
- `compliment`
- `hors_perimetre`

---

## Tests Recommandés

### Tests Fonctionnels
1. ✅ Demande de menu → Affichage des boutons
2. ✅ Sélection d'un menu → Proposition de réservation
3. ✅ Demande d'horaires → Réponse complète + proposition de réservation
4. ✅ Demande d'adresse → Adresse + accès + parking
5. ✅ Demande de réservation → Lien Fulleapps
6. ✅ Questions sur le brunch → Info week-end + lien menu
7. ✅ Questions avec enfants → Confirmation que familles sont bienvenues

### Tests Multilingues
1. ✅ Message en français
2. ✅ Message en anglais
3. ✅ Message en allemand
4. ✅ Message en italien

### Tests WhatsApp
1. ✅ Boutons interactifs fonctionnent
2. ✅ Pas de markdown dans les réponses
3. ✅ Messages courts et lisibles

---

## Configuration Requise

### Variables d'Environnement
```env
OPENAI_API_KEY=your_openai_api_key
```

### Fichiers Requis
- `prompt-merged.md` (à la racine)
- `config/restaurant.profile.json`
- `/scrap/*.md` (données de référence)

---

## Commandes de Vérification

### Vérifier que le prompt se charge correctement
```bash
node -e "const { loadSystemInstructions } = require('./src/agent/promptLoader'); console.log('Prompt loaded:', loadSystemInstructions().substring(0, 100));"
```

### Vérifier que le profil se charge correctement
```bash
node -e "const { loadRestaurantProfile } = require('./src/agent/promptLoader'); const profile = loadRestaurantProfile(); console.log('Restaurant:', profile.name);"
```

### Lancer le bot en mode développement
```bash
npm run dev
```

---

## Points d'Attention

### ⚠️ Ne pas oublier
1. Le bot doit **toujours** rediriger vers Fulleapps pour les réservations (ne jamais prendre de réservations directes)
2. Mentionner que le restaurant est **ouvert 7j/7**
3. Spécifier les **deux services** le week-end (durée 1h30 pour le premier service)
4. Insister sur le fait que les réservations sont **uniquement pour manger au restaurant** (bar sans réservation)
5. **Familles et enfants sont les bienvenus** (inverse d'INCA 18+)

### 🚫 Limitations
1. Le bot ne doit **jamais** inventer d'informations
2. Le bot ne prend **jamais** de réservations directes
3. Le bot ne gère **jamais** de paiements
4. Le bot ne répond **que** sur Histoire Sans Faim (refuse poliment les questions hors-sujet)

---

## Prochaines Étapes Recommandées

### Court Terme
1. ✅ Tester le bot avec des messages réels
2. ✅ Vérifier les boutons WhatsApp fonctionnent
3. ✅ Valider les liens de réservation

### Moyen Terme
1. ⏳ Ajouter un système de RAG pour les menus (si PDFs disponibles)
2. ⏳ Intégrer l'API Fulleapps pour vérifier disponibilités en temps réel
3. ⏳ Ajouter des métriques (nombre de conversations, taux de conversion)

### Long Terme
1. ⏳ Ajouter support pour commandes à emporter
2. ⏳ Intégrer système de feedback client
3. ⏳ Analyse sentiment des conversations

---

## Contact & Support

Pour toute question sur cette refactorisation:
- Documentation technique: `prompt-merged.md`
- Configuration restaurant: `config/restaurant.profile.json`
- Code source: `src/agent/mastra.ts` + `src/agent/promptLoader.ts`

---

## Changelog

### Version 1.0.0 (2025-11-07)
- ✅ Migration complète d'INCA London vers Histoire Sans Faim(s)
- ✅ Création de `restaurant.profile.json`
- ✅ Fusion des prompts dans `prompt-merged.md`
- ✅ Refactorisation de `mastra.ts` avec chargement externe
- ✅ Conservation de toutes les fonctionnalités WhatsApp
- ✅ Documentation complète des changements

---

**Définition of Done**:
Le bot répond correctement aux intentions principales et les boutons WA fonctionnent comme avant, avec les nouvelles données de **Histoire Sans Faim(s)**.

✅ **STATUT**: Refactorisation terminée et documentée.
