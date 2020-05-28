var routes = [

  // Afficher la page d'accueil
  {
    path: '/',
    componentUrl: './pages/home.html'
  },
  // Afficher la page d'accueil une fois connecté
  {
    path: '/homeApp',
    componentUrl: './pages/homeApp.html'
  },
  // Afficher la page des amis
  {
    path: '/homeFriend',
    componentUrl: './pages/homeFriend.html'
  },
  // Afficher une amitié
  {
    path: '/friend/:mail?',
    componentUrl: './pages/friendDelete.html'
  },
  // Afficher une demande d'ami envoyée
  {
    path: '/friendRequestSender/:mailReceiver?',
    componentUrl: './pages/friendDelete.html'
  },
  // Afficher une demande d'ami reçue
  {
    path: '/friendRequestReceiver/:mailSender?',
    componentUrl: './pages/friendRequest.html'
  },
  // Afficher la page de la collection friends (dev)
  {
    path: '/devFriends',
    componentUrl: './pages/dev_friendsDB.html'
  },
  // Afficher une requete d'amitiée (dev)
  {
    path: '/friends/:friendId?',
    componentUrl: './pages/dev_friend.html',
  },
  // Afficher la page de la collection users (dev)
  {
    path: '/devUsers',
    componentUrl: './pages/dev_usersDB.html'
  },
  // Afficher un utilisateur (dev)
  {
    path: '/user/:userId?',
    componentUrl: './pages/dev_user.html',
  },
  {
    path: '/connection',
    componentUrl: './pages/connection.html',
  },
  {
    path: '/inscription',
    componentUrl: './pages/inscription.html',
  },
  {
    path: '/postpos',
    componentUrl: './pages/postpos.html',
  },
  {
    path: '/map',
    componentUrl: './pages/map.html',
  },
  {
    path: '/friendspos',
    componentUrl: './pages/friendspos.html',
  },
  {
    path: '/FriendList',
    componentUrl: './pages/FriendList.html',
  },
  {
    path: '/historique',
    componentUrl: './pages/historique.html',
    reloadCurrent: true,
    ignoreCache: true,
  },
  // Default route (404 page). MUST BE THE LAST
  {
    path: '(.*)',
    url: './pages/404.html',
    componentUrl: './pages/home.html',
  },
];
