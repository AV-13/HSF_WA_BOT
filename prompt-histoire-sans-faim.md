# Prompt de Refactorisation – Bot WhatsApp pour “Histoire Sans Faim(s)”

## Objectif
Adapter le bot WhatsApp du restaurant INCA London pour le nouveau restaurant **Histoire Sans Faim(s)**, tout en conservant toutes les fonctionnalités WhatsApp du bot existant (boutons, templates, interactions Mastra), et en fusionnant l’ancien prompt avec un nouveau prompt plus généraliste trouvé dans `prompt.md`.

## 1. Rôle de l’assistant
Tu es un assistant spécialisé dans la refactorisation de bots WhatsApp.  
Ta mission : adapter le bot existant à un nouveau restaurant sans casser aucune logique de fonctionnement.

## 2. Sources
- Prompt généraliste : **`prompt.md`**
- Ancien prompt Mastra contenant les boutons et interactions WhatsApp.
- Contenu du site du restaurant dans le dossier **`/scrap`** (textes, menus, PDF, images…).

## 3. Règles de fusion des prompts
- Le prompt généraliste doit être intégré **presque entièrement**.
- L’ancien prompt sert de base pour :
  - Boutons WA
  - Quick replies
  - Templates interactifs
  - Pagination
  - Comportement WA spécifique
- En cas de conflit :
  - **Priorité au nouveau prompt (`prompt.md`)**
  - **Sauf pour les interactions WhatsApp** → on garde l’ancien.

## 4. Fichier à produire
Créer un fichier **`prompt-merged.md`** contenant :
1. Le rôle du bot pour Histoire Sans Faim(s)
2. Le ton (professionnel, chaleureux, clair, francophone)
3. Les sources (profil du restaurant + RAG issu de `/scrap`)
4. Les règles de vérité (profile.json > scrap > inconnu)
5. Les règles WhatsApp héritées (bannières, boutons, quick replies)
6. Les intents principaux :
   - Réservation
   - Menu
   - Allergènes
   - Livraison
   - Adresse & itinéraire
   - Horaires
7. Les formats de réponses (modèle de message)
8. Politique de fallback (ne pas inventer)
9. Exemples de réponses
10. Section technique sur les handlers WA (copiée de l’ancien prompt)

## 5. Profil du restaurant
Créer `config/restaurant.profile.json` basé sur le contenu du dossier `/scrap`.

Structure recommandée :
```json
{
  "name": "Histoire Sans Faim(s)",
  "brand_tone": "chaleureux, clair, professionnel, francophone",
  "description": "",
  "address": {
    "line1": "",
    "line2": "",
    "zipcode": "",
    "city": "",
    "country": "France",
    "google_maps_url": ""
  },
  "contacts": {
    "phone": "",
    "email": "",
    "website": "",
    "instagram": "",
    "facebook": "",
    "tiktok": ""
  },
  "opening_hours": {
    "monday": "",
    "tuesday": "",
    "wednesday": "",
    "thursday": "",
    "friday": "",
    "saturday": "",
    "sunday": ""
  },
  "menus": [],
  "booking": { "enabled": true, "provider": "", "url": "" },
  "delivery": [],
  "takeaway": { "enabled": true, "url": "" },
  "allergens": { "policy": "", "common_allergens": [] },
  "diet": {
    "vegetarian": false,
    "vegan": false,
    "halal": false,
    "gluten_free": false
  },
  "payment": {
    "card": true,
    "cash": true,
    "amex": false,
    "ticket_restaurant": false
  },
  "faq": [],
  "legal": { "privacy_url": "", "terms_url": "" },
  "media": {
    "logo": "",
    "hero": "",
    "gallery": []
  },
  "links": {}
}
```

## 6. Étapes d’implémentation
1. Scanner `/scrap` → extraire toutes les infos du restaurant.
2. Remplir `restaurant.profile.json`.
3. Fusionner l’ancien prompt Mastra + `prompt.md` → `prompt-merged.md`.
4. Relier `prompt-merged.md` dans le code où le bot charge son prompt.
5. Mettre à jour les boutons WA avec les nouvelles URLs.
6. Ingestion RAG si existante.
7. Ajouter un fichier `README.updates.md`.

## 7. Contraintes techniques
- Ne pas renommer les IDs/postbacks de boutons.
- Ne pas casser la logique WA existante.
- Ne rien inventer : si une information manque, laisser vide.

## 8. Exigences conversationnelles
- FR par défaut
- Ton chaleureux et professionnel
- Réponses courtes + boutons
- Respect strict des données du restaurant

## 9. Définition de Done
Le bot répond correctement aux intentions principales et les boutons WA fonctionnent comme avant, avec les nouvelles données de **Histoire Sans Faim(s)**.
