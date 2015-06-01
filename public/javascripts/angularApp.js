var app = angular.module('seenit', ['ui.router'])
.config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
		.state('home', {
			url:'/',
			templateUrl: '/home.html',
			controller: 'MainCtrl',
			resolve: {
				postPromise: ['posts', function(posts) {
					return posts.getAll();
				}]
			}
		})
		.state('posts', {
			url:'/posts/{id}',
			templateUrl: '/posts.html',
			controller: 'PostsCtrl'
		});

		$urlRouterProvider.otherwise('/');
	}
]);

app.factory('posts', ['$http', function($http) {
	
	var o = {
		posts: []
	};

	o.getAll = function() {
		//Read and copy the posts from the backend.
		return $http.get('/posts').success(function(data) {
			//Copy on the lowest level to make sure change proliferates.
			angular.copy(data, o.posts);
		});
	};

	o.create = function(post) {
		return $http.post('/posts', post).success(function(data) {
			o.posts.push(data);
		});
	};

	return o;
}]);

app.controller('MainCtrl', ['$scope', 'posts', function($scope, posts){

		$scope.test = 'Hello world!';

		$scope.posts = posts.posts;

		$scope.addPost = function(){
			if(!$scope.title || $scope.title === '') return;

			posts.create({
				title: $scope.title, 
				link: $scope.link
			});

			/*$scope.posts.push({
				title: $scope.title, 
				link: $scope.link, 
				upvotes: 0,
				comments: [
					{author: 'Bill', body: 'Excellent!!', upvotes: 0},
					{author: 'Ted', body: 'Awesome!!', upvotes: 0}
				]
			});*/
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