var $$ = Dom7;

var app = new Framework7({
  root: '#app', // App root element
  id: 'fr.theplanets.friendfinder', // App bundle ID
  name: 'FriendFinder', // App name
  theme: 'md', // Automatic theme detection
  // App routes
  routes: routes,
  // Input settings
  input: {
    scrollIntoViewOnFocus: Framework7.device.cordova && !Framework7.device.electron,
    scrollIntoViewCentered: Framework7.device.cordova && !Framework7.device.electron,
  },
  // Cordova Statusbar settings
  statusbar: {
    iosOverlaysWebView: true,
    androidOverlaysWebView: false,
  },
  on: {
    init: function () {
      var f7 = this;
      if (f7.device.cordova) {
        // Init cordova APIs (see cordova-app.js)
        cordovaApp.init(f7);
      }
    },
  },
});

app.views.create('.view-main', {
  url: '/'
})

