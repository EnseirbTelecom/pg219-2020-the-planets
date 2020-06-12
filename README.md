# Projet PG219

Réalisation d'une application de géo-localisation d’amis : **FriendFinder**.

## Groupe The Planets
Robin Balthazar
Ramboasolo Jérémy
Dubreuil Julien
Al Ktabe Amera

## Démo 
lien pour accéder à la démo : https://youtu.be/gWLcmgNrQNE

## Informations diverses 
 L'application comporte un serveur utilisant Node / Express / MongoDB, et un client destiné à s’exécuter sur plateforme Android, développé via Framework7 / Cordova.

Le dépot GitHub contient : 
-   Le code source de la partie serveur dans le répertoire src/api
-   Le code source de la partie client dans le répertoire src/client
-   Une documentation exhaustive de l’API REST du serveur au format OpenAPi dans le répertoire doc/api, incluant une génération au format HTML.

## Guide d'installation
 -   Ouvrir un terminal et aller dans le dossier src/api
 -   Exécuter npm install
 -   Exécuter npm start
 -   Ouvrir un autre terminal et aller dans le dossier src/client
 -   Exécuter npm install
 -   Exécuter npm start
 -   Ouvrir un navigateur web et aller sur localhost:8080

Si vous souhaitez utiliser une autre base de données que la notre, changez la ligne 22 du fichier src/api/server/server.js en mettant votre lien dans la variable url.