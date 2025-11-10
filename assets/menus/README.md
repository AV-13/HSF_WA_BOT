# Menus PDF

Placez vos fichiers PDF de menu dans ce dossier :

1. **menu_du_moment_1.pdf** - Le menu du moment (carte principale)
2. **menu_du_moment_2.pdf** - Le menu brunch

Ces fichiers seront servis via :
- http://localhost:3000/menus/menu_du_moment_1.pdf
- http://localhost:3000/menus/menu_du_moment_2.pdf

En production (avec ngrok) :
- https://[votre-url-ngrok]/menus/menu_du_moment_1.pdf
- https://[votre-url-ngrok]/menus/menu_brunch.pdf

## Important

Assurez-vous que :
- Les fichiers sont bien nommés exactement comme indiqué ci-dessus
- Les fichiers sont au format PDF
- Les fichiers ne sont pas trop volumineux (< 5 MB recommandé pour WhatsApp)
