
var routes = [
  {
    path: '/',
    componentUrl: './pages/home.html'
  },
  {
    path: '/homeFriend',
    componentUrl: './pages/homeFriend.html'
  },
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
