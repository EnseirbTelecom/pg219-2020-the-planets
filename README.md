# Projet PG219

Réalisation d'une application de géo-localisation d’amis : **FriendFinder**.

## Groupe The Planets
-   Robin Balthazar
-   Ramboasolo Jérémy
-   Dubreuil Julien
-   Al Ktabe Amera

## Démo
Lien pour accéder à la démo : https://youtu.be/APtrIZKqfLE

## Informations diverses
 L'application comporte un serveur utilisant Node / Express / MongoDB, et un client destiné à s’exécuter sur plateforme Android, développé via Framework7 / Cordova.

Le dépot GitHub contient :
-   Le code source de la partie serveur dans le répertoire [src/api](src/api)
-   Le code source de la partie client dans le répertoire [src/client](src/client)
-   Une documentation exhaustive de l’API REST du serveur au format OpenAPi dans le répertoire doc/api, incluant une génération au format HTML.

## Guide d'installation
 -   Ouvrir un terminal et aller dans le dossier src/api
 -   Exécuter npm install
 -   Exécuter npm start
 -   Ouvrir un autre terminal et aller dans le dossier src/client
 -   Exécuter npm install
 -   Exécuter npm start
 -   Ouvrir un navigateur web et aller sur localhost:8080

Si vous souhaitez utiliser une autre base de données que la notre, changez la ligne 22 du fichier [server.js](src/api/server/server.js) en mettant votre lien dans la variable url.

## Informations supplémentaires

Nous n'avons pas réussi à faire la documentation avec Redoc
