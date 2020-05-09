
var routes = [
  
  // Afficher la page d'accueil (dev)
  {
    path: '/',
    componentUrl: './pages/dev_home.html'
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
  // Afficher une requete d'amitiée (dev)
  {
    path: '/friends/:friendId?',
    componentUrl: './pages/dev_friend.html',
  },
  // Default route (404 page). MUST BE THE LAST
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];