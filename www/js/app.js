// Global variable of our database
var db = null;

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('fireExMonitor', ['ionic', 'fireExMonitor.controllers', 'fireExMonitor.services'])

.run(function($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    
    // Open SQLite database
    if(window.cordova){
        // App syntax
        db = $cordovaSQLite.openDB({name:'fireExDB', location: 1});
    } else {
        // Ionic serve syntax
        db = window.openDatabase("fireEx.db", "1.0", "FireEx app", -1);
    }
    
    // Create tables
    $cordovaSQLite.execute(db,
    "CREATE TABLE IF NOT EXISTS companies(id integer primary key, name text unique, person text, contact_no int, inspect_date text, start boolean)");
    $cordovaSQLite.execute(db,
    "CREATE TABLE IF NOT EXISTS units(id integer primary key, company_id integer, model text, serial_no text unique, inspection_date default 'New', dop text default 'n/a', expiration_date text default 'n/a', date_refilled text default 'n/a', location text default 'n/a', checklist1 text default 'passed', checklist2 text default 'passed', checklist3 text default 'passed', checklist4 text default 'passed', checklist5 text default 'passed', checklist6 text default 'passed', checklist7 text default 'passed', checklist8 text default 'passed', status text default 'operational', missing text default 'no')");
    $cordovaSQLite.execute(db, 
    "CREATE TABLE IF NOT EXISTS photos(id integer primary key, unit_serial text, description text, imgURI text, date_taken text)");  
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html'
      }
    }
  })
  
  .state('app.records', {
    url: '/records',
    views: {
        'menuContent': {
            templateUrl: 'templates/records.html',
            controller: 'RecordsCtrl'
        }
    }
  })
  
  .state('app.company', {
    url: '/company/:id/:name',
    views: {
       'menuContent': {
        templateUrl: 'templates/company.html',
        controller: 'CompanyCtrl'
       }
    }
  })

  .state('app.locations', {
    url: '/locations/:id/:name',
    views: {
      'menuContent': {
        templateUrl: 'templates/locations-list.html',
        controller: 'LocationsCtrl'
      }
    }
  })

  .state('app.unitsList', {
    url: '/unitsList/:id/:location/:name',
    views: {
      'menuContent' : {
        templateUrl: 'templates/units-list.html',
        controller: 'UnitsListCtrl'
      }
    }
  })

  .state('app.unitRecords', {
    url: '/unitRecords/:serial/:name/:companyId',
    views: {
      'menuContent': {
        templateUrl: 'templates/unit-records.html',
        controller: 'UnitRecordsCtrl'
      }
    }
  })

  .state('app.galery', {
    url : '/galery/:unitSerial',
    views : {
      'menuContent' : {
        templateUrl : 'templates/galery.html',
        controller : 'GaleryCtrl'
      }
    }
  })

  .state('app.import', {
    url: '/import/:companyId',
    views : {
      'menuContent' : {
        templateUrl : 'templates/import.html',
        controller : 'ImportRecordsCtrl'
      }
    }
  })

  .state('app.report', {
    url : '/report',
    views : {
      'menuContent' : {
        templateUrl : 'templates/report.html',
        controller : 'ReportCtrl'
      }
    }
  })

  .state('app.reportsBrowser',{
    url : '/reportsBrowser/:companyName',
    views : {
      'menuContent' : {
        templateUrl : 'templates/reportsBrowser.html',
        controller : 'ReportsBrowserCtrl'
      }
    }
  })
  
  .state('app.share', {
    url: '/share',
    views: {
        'menuContent': {
            templateUrl: 'templates/share.html'
        }
    }
  })
  
  .state('app.backup', {
    url: '/backup',
    views: {
        'menuContent': {
            templateUrl: 'templates/backup.html'
        }    
    }
  })

  .state('app.search', {
    url: '/search',
    views : {
        'menuContent': {
            templateUrl: 'templates/search.html',
            controller: 'SearchCtrl'
        }
    }
  });
  
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
