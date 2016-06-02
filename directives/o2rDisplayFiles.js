"use strict";

app.directive('o2rDisplayFiles', ['publications', function(publications){
	return{
		restrict: 'E',
		link: function(scope, iElement, attrs){
			/*
			var index = window.location.href.split('/');
			index = index[index.length - 1];
			index = parseInt(index);
			*/

			
			attrs.$observe('o2rid', function(value){
				
				var file = publications.getContentById(value);
				if(typeof file.type !== "undefined"){
					$('o2r-display-files').empty();
					var mime = file.type.split('/');
					mime = mime[0];


					switch (mime){
						case 'application':
							if(file.size < 1000){
								var object = angular.element('<object class="pdf" type="application/pdf" data="' + file.path +  '"</object>');
							} else {
								var object = angular.element('<div class="jumbotron"><center><h2>Filesize is too big to display</h2><p><a href="">Download</a> file to see its content</p></center></div>'); 
							}
							iElement.append(object);
							break;
						case 'image':
							if(file.size < 1000){
								var object = angular.element('<img src="' + file.path + '">');
							} else {
								var object = angular.element('<div class="jumbotron"><center><h2>Filesize is too big to display</h2><p><a href="">Download</a> file to see its content</p></center></div>');
							}
							iElement.append(object);
							break;
						default: 
							if(file.size < 1000){
								var object = angular.element('<pre>' + file.path + '</pre>');
							} else {
								var object = angular.element('<div class="jumbotron"><center><h2>Filesize is too big to display</h2><p><a href="">Download</a> file to see its content</p></center></div>');
							}
							iElement.append(object);
					}

				}






			});
			
			


		}
	}
}]);