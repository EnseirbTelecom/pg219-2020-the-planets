
var routes = [
  
  // Afficher la page d'accueil
  {
    path: '/',
    componentUrl: './pages/home.html'
  },
  // Afficher la page des amis
  {
    path: '/homeFriend',
    componentUrl: './pages/homeFriend.html'
  },
  // Afficher une amitié
  {
    path: '/friendRequest/',
    componentUrl: './pages/friendRequest.html'
  },
  // Afficher une demande d'ami envoyée
  {
    path: '/friendRequestSender/:mailReceiver?',
    componentUrl: './pages/friendRequest.html'
  },
  // Afficher une demande d'ami reçue
  {
    path: '/friendRequestReceiver/:mailSender?',
    componentUrl: './pages/friendRequest.html'
  },



  // Afficher une requete d'amitiée (dev)
  {
    path: '/friends/:friendId?',
    componentUrl: './pages/friend.html',
  },



  // Default route (404 page). MUST BE THE LAST
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];
