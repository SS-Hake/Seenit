var app = angular.module('seenit', ['ui.router'])
.config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
		.state('home', {
			url:'/home',
			templateUrl: '/home.html',
			controller: 'MainCtrl'
		})
		.state('posts', {
			url:'/posts/{id}',
			templateUrl: '/posts.html',
			controller: 'PostsCtrl'
		});

		$urlRouterProvider.otherwise('/');
	}
]);

app.factory('posts', [function() {
	
	var o = {
		posts: []
	};

	return o;
}]);

app.controller('MainCtrl', ['$scope', 'posts', function($scope, posts){

		$scope.test = 'Hello world!';

		$scope.posts = posts.posts;

		$scope.addPost = function(){
			if(!$scope.title || $scope.title === '') return;

			$scope.posts.push({
				title: $scope.title, 
				link: $scope.link, 
				upvotes: 0,
				comments: [
					{author: 'Bill', body: 'Excellent!!', upvotes: 0},
					{author: 'Ted', body: 'Awesome!!', upvotes: 0}
				]
			});
			$scope.title = null;
			$scope.link = null;
		}

		$scope.incrementUpvotes = function(post) {
			post.upvotes += 1;
		}
	}
])
.controller('PostsCtrl', ['$scope', '$stateParams', 'posts', function($scope, $stateParams, posts) {

	$scope.post = posts.posts[$stateParams.id]

	$scope.addComment = function() {
		$scope.post.comments.push({
			body: $scope.body,
			author: 'user',
			upvotes: 0
		});
		$scope.body = null;
	};

	$scope.incrementUpvotes = function(comment) {
		comment.upvotes += 1;
	}

}]);