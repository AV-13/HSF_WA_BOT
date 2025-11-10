# TODO

- Il faut que l'utilisateur sache qu'il y a 4 menus et pas juste le menu à la carte.
J'aimerais utiliser les boutons interactifs de whatsApp Business pour gérer différentes réponses : 
  - Donner la possibilité d'afficher 4 menus dans 4 boutons différents. Si on clique dessus, on affiche le menu en question (le PDF directement)
  - J'aimerais que l'utilisateur puisse récupérer tous les menus d'un coup si il le demande => on envoie les 4 pdf d'un coup.
- J'aimerais enlever l'affichage markdown qui est géré pour certaines réponses : mots en gras qui s'affichent dans le message whatsapp par *motengras* au lieu de motengras.
- J'aimerais éviter tout lien complet vers les images PDF dans le texte, si ce n'est pas déjà complétement géré. Lorsque l'on envoie le pdf d'un menu, on envoie le document PDF directement et on ne passe jamais par un lien.

  - Parfait pour la gestion des menus, il faut aussi que ce soit traduit dans la langue de l'utilisateur (laisser faire mastra)
  - Pour les boutons interactifs, tu mets un bouton voir tous les menus qui affichent ensuite les différents choix. J'aimerais avoir directement les différents choix via les boutons, pour éviter un clic en plus.
  Idée pour les réservations: pas possible de mettre l'iFrame de réservation directement dans WhatsApp.
  On peut par contre :
- Faire un parcours avec des boutons interactifs :
  - Bouton 1 : Nombre de personnes.
  - Bouton 2 : Date et heure.
  - Bouton 3 : Durée du repas (1h30, 2h, 2h30)
  - Bouton 3 : envoyez le lien avec les query params associés.
    https://www.sevenrooms.com/explore/incalondon/reservations/create/search?date=2025-10-17&halo=120&party_size=6&start_time=07%3A30
  - date : YYYY-MM-DD
  - halo : durée en minutes
  - party_size : nombre de personnes
  - start_time : heure de début au format HH:MM (24h)
  
  - J'aimerais finalement garder un bouton intermédiaire "voir les menus qui affiche ensuite les boutons interactifs pour chaque menu.
  - Lister les mots en durs pour assurer la réservation n'est pas scalable ni multi-lingue. Il faut utiliser Mastra pour obtenir la langue et faire la traduction du message de l'utilisateur (étape intermédiaire). Ensuite on traite la version traduite (ou l'intention détectée) dans le code. => Plus besoin de gérer les mots clés dans toutes les langues.
  - Il faut intégrer une base de données supabase pour garder en mémoire les derniers messages, et permettre à mastra de savoir si il s'adresse à un ancien ou un nouvel utilisateur.
    - Project URL: https://xkqjvytqgdzgmxmfgbwb.supabase.co // 
    - API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoYnlmYWFqZHhycWx6endvZ2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTc4NjksImV4cCI6MjA3NjA5Mzg2OX0.0TE5tD1HodgB5VnsVdbri0GnopNtNMO5y7gjY-RuWow
      - dans le .env tu as toutes les informations pour faire correctement la connexion à la base de données:
        SUPABASE_URL=
        SUPABASE_API_KEY=
        SUPABASE_PROJECT_ID=
        SUPABASE_DB_PORT=
        SUPABASE_DB_HOST=
        SUPABASE_DB_USER=
        SUPABASE_DB_PASSWORD=
        SUPABASE_SERVICE_ROLE_KEY=
      postgresql://SUPABASE_DB_USER:SUPABASE_DB_PASSWORD@SUPABASE_DB_HOST:SUPABASE_DB_PORT/postgres
      J'ai déjà tout configurer et effectuer mes migrations. Il faut maintenant l'intégrer dans le code.
      - Voici le schéma des deux tables :
        -- WARNING: This schema is for context only and is not meant to be run.
        -- Table order and constraints may not be valid for execution.

    CREATE TABLE public.conversations (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        user_phone text NOT NULL,
        status text NOT NULL DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'closed'::text])),
        started_at timestamp with time zone NOT NULL DEFAULT now(),
        last_message_at timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT conversations_pkey PRIMARY KEY (id)
    );
    CREATE TABLE public.messages (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        conversation_id uuid NOT NULL,
        wa_message_id text,
        direction text NOT NULL CHECK (direction = ANY (ARRAY['in'::text, 'out'::text])),
        sender text NOT NULL CHECK (sender = ANY (ARRAY['user'::text, 'bot'::text])),
        message_type text NOT NULL DEFAULT 'text'::text,
        text_content text,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        delivered_at timestamp with time zone,
        read_at timestamp with time zone,
        CONSTRAINT messages_pkey PRIMARY KEY (id),
        CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id)
    );
      On identifie l'utilisateur via son numéro de téléphone.
      On permet à mastra de savoir si c'est un nouvel utilisateur ou un ancien.
      On permet à mastra de consulter l'historique des messages avant de répondre.
      On permet aussi de savoir si c'est une nouvelle conversation ou une conversation en cours.
  J'aimerais que mastra prenne des initiatives pour guider l'utilisateur dans la conversation : exemple de conversation => demande de menu => l'utilisateur fait son choix => le bot lui envoie le menu puis demande ensuite si l'utilisateur veut réserver ?
  - Il ne faut jamais envoyer des messages dans une langue fixe, y compris pour les messages accompagnant les menus : "Voici le menu à la carte"
  - Il est important de TOUJOURS répondre dans la langue de l'utilisateur, pour le nom des menus INCLUS : "Voici le menu à la carte" => "Here is the à la carte menu" pour un utilisateur anglais, etc. On doit pouvoir gérer toutes les langues grâce à mastra.
  - Il faut aussi documenter au maximum le code (jsdoc) et faire un README complet et détaillé.

context seven pour les docs des outils.


Actuellement, énormément de choses sont hardcodées en anglais dans le code, il faut tout rendre dynamique et multi-lingue. Pour ça, il faut à chaque fois passer par l'IA qui est extrémement performante pour générer du texte dans tout type de langues.
Cela passe aussi par retirer le dictionnaire dans webhook.ts qui ne prend en compte que certaines langues (5 à 6) alors que je veux que mon bot puisse s'exprimer dans chaque langue.
Aussi, pour chaque formulaire ou WhatsApp Flows (menus, réservation) Il faut laisser l'IA générer le texte dans la langue de l'utilisateur pour accompagner chaque étape du "formulaire".
Ou chaque label accompagnant les boutons interactifs/document.
Il faut aussi ajouter whisper pour gérer le speech to text et ensuite traiter le texte comme un message classique.
Il faut ajouter une map pour gérer la location proprement et accompagner la demande d'adresse précise.
Pour la date on peut inclure un datepicker via whatsapp flow : {
"version": "7.2",
"data_api_version": "3.0",
"routing_model": {},
"screens": [
{
"id": "DEMO_SCREEN",
"terminal": true,
"title": "Demo screen",
"layout": {
"type": "SingleColumnLayout",
"children": [
{
"type": "DatePicker",
"name": "date",
"label": "Date",
"min-date": "2024-10-21",
"max-date": "2024-11-12",
"unavailable-dates": [
"2024-10-28",
"2024-11-01"
],
"on-select-action": {
"name": "data_exchange",
"payload": {
"date": "${form.date}"
}
}
},
{
"type": "Footer",
"label": "Continue",
"on-click-action": {
"name": "data_exchange",
"payload": {}
}
}
]
}
}
]
}On va pas passer par google map API pour la location on va juste renvoyer une réponse avec whatsapp: extrait de l'API :
{
"messaging_product": "whatsapp",
"recipient_type": "individual",
"to": "<WHATSAPP_USER_PHONE_NUMBER>",
"type": "location",
"location": {
"latitude": "<LOCATION_LATITUDE>",
"longitude": "<LOCATION_LONGITUDE>",
"name": "<LOCATION_NAME>",
"address": "<LOCATION_ADDRESS>"
}
}'

Quand on demande l'adresse, accompagne la d'une localisation whatsapp avec les longitudes et latitudes suivantes :
Latitude : 51.514682
Longitude: -0.140592
Actuellement, on a juste un message qui renvoie l'adresse à l'écrit, et pas la localisation exacte via une carte (whatsapp location) qui va avec.

🌍 Detected language: fr for message: "Je veux resa une table..."
🌍 Generated text for "date_picker_prompt" in fr: "Veuillez sélectionner une date pour votre réservation."
🌍 Generated text for "date_picker_button" in fr: "Sélectionner une date"
🌍 Generated text for "The phrase "This Week" (2-3 words)" in fr: "Cette semaine"
🌍 Generated text for "The phrase "Next Week" (2-3 words)" in fr: "La semaine prochaine"
🌍 Generated text for "The phrase "Week 3" (2-3 words)" in fr: "Semaine 3"
🌍 Generated text for "The phrase "Week 4" (2-3 words)" in fr: "Semaine 4"
📤 Sending interactive list to 33649712311
❌ Error sending interactive list: {
error: {
message: '(#131009) Parameter value is not valid',
type: 'OAuthException',
code: 131009,
error_data: {
messaging_product: 'whatsapp',
details: 'Button label is too long. Max length is 20'                                                                                                                         
},
fbtrace_id: 'AV58I0yAx_-tdwVY4fnz5_Y'                                                                                                                                           
}
}
❌ Error processing incoming message: Error: Failed to send interactive list: Request failed with status code 400
at WhatsAppClient.sendInteractiveList (file:///C:/Users/augus/WebstormProjects/Inca_London/dist/whatsapp/client.js:174:19)                                                      
at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
at async sendDateRequest (file:///C:/Users/augus/WebstormProjects/Inca_London/dist/whatsapp/webhook.js:365:5)                                                                   
at async handleReservationButtonClick (file:///C:/Users/augus/WebstormProjects/Inca_London/dist/whatsapp/webhook.js:447:9)                                                      
at async processIncomingMessage (file:///C:/Users/augus/WebstormProjects/Inca_London/dist/whatsapp/webhook.js:628:13)                                                           
at async handleWebhook (file:///C:/Users/augus/WebstormProjects/Inca_London/dist/whatsapp/webhook.js:106:25)                                                                    
at async file:///C:/Users/augus/WebstormProjects/Inca_London/dist/index.js:74:5
🌍 Generated text for "Apologize for a technical issue and provide contact information: Phone: +44 (0)20 7734 6066, Email: reservations@incalondon.com" in en: "We apologize for the technical issue. Please contact us at Phone: +44 (0)20 7734 6066, Email: reservations@incalondon.com."
📤 Sending message to 33649712311: We apologize for the technical issue. Please conta...
✅ Message sent successfully
[2025-10-16T14:35:56.782Z] POST /webhook
📊 Message status update: sent for message wamid.HBgLMzM2NDk3MTIzMTEVAgARGBI3RkU4NDkzRDQ2NzM3Qjk5NjAA
[2025-10-16T14:35:57.315Z] POST /webhook
📊 Message status update: read for message wamid.HBgLMzM2NDk3MTIzMTEVAgARGBI3RkU4NDkzRDQ2NzM3Qjk5NjAA
[2025-10-16T14:35:57.474Z] POST /webhook
📊 Message status update: delivered for message wamid.HBgLMzM2NDk3MTIzMTEVAgARGBI3RkU4NDkzRDQ2NzM3Qjk5NjAA
J'ai un problème avec le datepicker, la manière dont c'est fait génère des bugs

Aussi, Enlever les - dans les forms, affiche juste les labels

au bout d'1 heure => envoyer un message si pas de réponses.
1h en plus => fermer la conversation automatiquement.


🌍 Detected language: fr for message: "Je veux resa une table..."
🌍 Generated text for "Ask how many people they want to reserve for" in fr: "Pour combien de personnes souhaitez-vous faire une réservation ?"
🌍 Generated text for "Button text for "Choose" or "Select" (1-2 words)" in fr: "Choisir"
🌍 Generated text for "The word "People" or "Guests" (1 word)" in fr: "Invités"

Enlever le tiret dans les réponses, et dans les boutons des formulaires.
Réponse à tout les demandes dans le cas d'un message assez long.
Ne pas se mélanger dans les demandes. bien répondre au prompt de l'utilisateur.
trop d'émojis, messages de conclusion pour une simple question => pas nécessaire : "D'ailleurs j'ai un anniversaire la semaine prochaine donc t je cherche un endroit pour un évent privée pour 50 personnes est ce que inca peu faire ça ? Nous allons commandé des bouteilles de champagne etc"

tu peux m'aider à envoyer un calendar à l'API directement en format JSON via le format suivant (extrait de la doc) ?

{ "version": "7.2", "data_api_version": "3.0", "routing_model": {}, "screens": [ { "id": "DEMO_SCREEN", "terminal": true, "title": "Demo screen", "layout": { "type": "SingleColumnLayout", "children": [ { "type": "CalendarPicker", "name": "calendar", "label": "Single date", "helper-text": "Select a date", "required": true, "mode": "single", "min-date": "2024-10-21", "max-date": "2025-12-12", "unavailable-dates": [ "2024-11-28", "2024-11-01" ], "include-days": [ "Mon", "Tue", "Wed", "Thu", "Fri" ], "init-value": "2024-10-23", "on-select-action": { "name": "data_exchange", "payload": { "calendar": "${form.calendar}" } } }, { "type": "Footer", "label": "Continue", "on-click-action": { "name": "data_exchange", "payload": {} } } ] } } ] }

Paramètre Description type (required) String "CalendarPicker" name (required) String
title String Dynamic "<span>{data.title}" Only available when 'mode' is set to 'range' description String Dynamic "</span>{data.description}" Only available when 'mode' is set to 'range' label (required) String Dynamic "<span>{data.label}" When 'mode' is set to 'range' the value should be in '{"start-date": String, "end-date": String}' format helper-text String Dynamic "</span>{data.helper_text}" When 'mode' is set to 'range' the value should be in '{"start-date": String, "end-date": String}' format required Boolean Dynamic "<span>{data.is_required}" Default: False When 'mode' is set to 'range' the value should be in '{"start-date": Boolean, "end-date": Boolean}' format visible Boolean Dynamic "</span>{data.is_visible}" Default: True enabled Boolean Dynamic "<span>{data.is_enabled}" Default: True mode enum {"single", "range"} Dynamic "</span>{data.mode}" Default: "single" Allows to select one date in 'single' mode or start and end dates in 'range' mode min-date String Dynamic "<span>{data.min_date}" Formatted date string in the format "YYYY-MM-DD" Disallows selecting dates before specified
min-date max-date String Dynamic "</span>{data.max_date}" Formatted date string in the format "YYYY-MM-DD" Disallows selecting dates after specified max-date unavailable-dates Array<string> Dynamic "<span>{data.unavailable_dates}" Formatted date strings in the format "YYYY-MM-DD" Disallows selecting specific dates, should be in the range between min-date and max-date if specified include-days Array<enum> {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"} Dynamic "</enum></span>{data.include_days}" Default: all weekdays - ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] Enables specific weekdays, for example to enable only working days Monday through Friday and disallow selecting Saturdays and Sundays min-days Integer Dynamic "<span>{data.min_days}" Available only in 'range' mode to set the minimum number of days between start and end dates max-days Integer Dynamic "</span>{data.max_days}" Available only in 'range' mode to set the maximum number of days between start and end dates on-select-action Action Only 'data_exchange' is supported. Payload that is sent to a data channel business endpoint is a string in "YYYY-MM-DD" format for 'single' mode or dictionary
n {"start-date":"YYYY-MM-DD","end-date":"YYYY-MM-DD"} format for 'range' mode init-value String Dynamic "<span>{data.init-value}" When 'mode' is set to 'range' the value should be in '{"start-date": String, "end-date": String}' format Only available when component is outside Form component error-message String Dynamic "</span>{data.error-message}" When 'mode' is set to 'range' the value should be in '{"start-date": String, "end-date": String}' format Only available when component is outside Form component</string>

Voici un extrait de la doc, il faut pas passer par les fonctions qui ne permettent pas de configurer un datePicker via des fonctions, il faut envoyer le JSON construit et complet à l'API directement.
J'ai commencé à le faire dans webhook.ts et client.ts avec les fonction sendCalendar que je te laisse modifier/supprimer pour faire fonctionner la feature. Il faut donc aussi adapter les autres fichiers du projet pour adapter le flow de réservation à ma demande :
Exemple de flow idéal :
- Bouton 1 : Nombre de personnes.
- Bouton 2 : Calendar
- Bouton 3 : Heure.
- Bouton 4 : Durée du repas (1h30, 2h)
- Bouton 5 : envoyez le lien avec les query params associés.
Important : Actuellement, les réponses comme les dates YYYY-MM-DD ou les heures trompent mastra dans la détection de langue car il croit que c'est de l'anglais. Il faut que mastra ignore ces formats standards internationaux et se concentre sur le reste du message pour détecter la langue.

Oublier l'idée du formulaire
