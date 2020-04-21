var routes = [
  {
    path: '/',
    componentUrl: './pages/home.html',
  },
  {
    path: '/connection',
    componentUrl: './pages/connection.html',
  },
  {
    path:'/inscription',
    componentUrl: './pages/inscription.html',
  },
  {
    path: '(.*)',
    url: './pages/error.html',
  },
];
