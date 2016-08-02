    var app = angular.module('starter', ["treeControl", "ui.router", "hljs", "ngFileUpload"]);
    app.constant('url', 'http://ubsvirt148.uni-muenster.de/api/v1');
    app.config(function($stateProvider, $urlRouterProvider, hljsServiceProvider){
      
      hljsServiceProvider.setOptions({
        tabReplace: '    '
      });
      // For any unmatched url, send to /route1
      $urlRouterProvider.otherwise("/home");
      
      $stateProvider
        .state('home', {
            url: "/home",
            templateUrl: "templates/home.html",
            controller: 'HomeCtrl'
        })
          
        .state('erc', {
            url: "/erc/:ercid",
            templateUrl: "templates/erc.html",
            controller: 'ErcCtrl'
        })

        .state('author', {
            url: "/author/:authorid",
            templateUrl: "templates/author.html",
            controller: 'AuthorCtrl',
        })

        .state('search', {
            url: "/search?term",
            templateUrl: "templates/search.html",
            controller: 'SearchCtrl'
        });
    });
    
app.controller('ErcCtrl', ['$scope', '$stateParams','publications', 'ercView', 'httpRequests', 'url', function($scope, $stateParams, publications, ercView, httpRequests, url){
    // id of compendium
    var ercId = $stateParams.ercid;

    // httpRequest for retrieving all metadata of a compendium
    publications.getRequest(ercId, function(){
        $scope.publication = publications.getPublications();
        $scope.getOne = function(path){
            var p = publications.getContentById(path);
            return p;
        };
        // checks for filesize and mimetype for displaying content of files
        // returns true, if file is not too big and not of type of pdf, image, audio, video
        $scope.displaySource = function(string){
            ercView.checkDisplayType(string);
        };
    });

    // getting job status  
    ercView.callJobs(ercId);

    // options for folderTree
    $scope.treeOptions = {
        nodeChildren: 'children',
        dirSelectable: false
    };

    // id of file in publication
    $scope.fileId;

    // set fileId
    $scope.setId = function(path){
        $scope.fileId = path;
    };

    $scope.execJob = ercView.executeJob(ercId);
    $scope.execStatus = ercView.getExecStatus();
    $scope.jobDone = true;
    
    $scope.$on('execStatus', function(){
        $scope.execStatus = ercView.getExecStatus();
    });

    $scope.$on('changedJobDone', function(){
        $scope.jobDone = ercView.getJobDone();
    });
}]);

app.controller('AuthorCtrl', ['$scope', '$stateParams', 'metadata', function($scope, $stateParams, metadata){
    // id from author
    var authorId = $stateParams.authorid;
    // function is called in asynchronous response from metadata.callMetadata_author()
    var getMeta_author = function(meta_author){
        //allPubs will be set to comp_meta from metadata factory
        $scope.allPubs = meta_author;
        // setter function for comp_id
        $scope.setId = function(id){
            metadata.setComp_id(id);
        };  
    };
    // httpRequest for retrieving all compendia from one author
    metadata.callMetadata_author(authorId, getMeta_author);
    // helper for sorting
    $scope.sortType = 'date';
    $scope.sortReverse = true;
    // helper for contentfilter
    $scope.filterContent = 'content';
}]);

app.controller('SearchCtrl', ['$scope', '$stateParams', 'metadata', function($scope, $stateParams, metadata){
	// reads term query from url
    var searchTerm = $stateParams.term;

    // function is called in asynchronous response from metadata.callMetadata_search()
    var getMeta_search = function(meta_search){
        $scope.allPubs = meta_search;
        // setter function for comp_id
        $scope.setId = function(id){
            metadata.setComp_id(id);
        };  
    };
   
   // httpRequest for retrieving all compendia fitting search parameters
    metadata.callMetadata_search(searchTerm, getMeta_search);

}]);

app.controller('HomeCtrl', ['$scope', '$location', function($scope, $location){
    
    $scope.submit = function(){
        var _query = $scope.searchModel.replace(/ /g, "+");
       // $location.path('/search').search('term=' + _query);
        $location.path('/search');
    };	
}]);

app.controller('MetadataCtrl', ['$scope', '$location', 'metadata', function($scope, $location, metadata){
    //Controller starts when previous httpRequest is finished
    $scope.$on('loadedAllComps', function(){
        $scope.compMeta = metadata.getLatestComp();
        metadata.callJobStatus($scope.compMeta.id, getJobMeta);
    });

    //function is called in asynchronous response from metadata.callJobStatus()
    var getJobMeta = function(meta){
        $scope.compMeta.status = meta;
    };
    
    //watch if comp_id changes in factory
    $scope.$on('changedComp_id', function(event, data){
        $scope.compMeta = metadata.getOneComp(data);
        metadata.callJobStatus($scope.compMeta.id, getJobMeta);
    });
    
    // triggered on GoTo Button. Gets the id of last clicked publication and calls url /erc/:ercid
    $scope.submit = function(){
        var _url = '/erc/' + $scope.compMeta.id;
        $location.path(_url);
    };

    // Changes first letter of word into capital letter
    $scope.caps = function(string){
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
}]);

app.controller('UploadCtrl', ['$scope', 'Upload', 'url', function($scope, Upload, url){
    $scope.submit = function(){
        if($scope.form.file.$valid && $scope.file){
            $scope.upload($scope.file);
        }
    };

    $scope.upload = function(file){
        Upload.upload({
            url: url + '/compendium',
            data: {compendium: file, 'content_type': 'compendium_v1'},
            headers: {
                'X-API-key': //HIER API-KEY EINTRAGEN
            }
        }).then(function(response){
            console.log('success');
            console.log(response);
        }, function(response){
            console.log('error');
            console.log(response);
        });
    };
}]);