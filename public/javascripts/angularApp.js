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
			controller: 'PostsCtrl',
			resolve: {
				post: ['$stateParams', 'posts', function($stateParams, posts) {
					return posts.get($stateParams.id);
				}]
			}
		});

		$urlRouterProvider.otherwise('/');
	}
]);

//Handles posts comments and upvotes from backend
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

	o.del = function(post) {
		return $http.post('/posts/' + post._id).success(function(data) {
			o.posts.pop();
		});
	};

	//Post to increment backend upvote, then reflect change client side.
	o.upvote = function(post) {
		return $http.put('/posts/' + post._id + '/upvote')
			.success(function(data) {
				post.upvotes += 1;
			});
	};

	//Get the single selected post from backend.
	o.get = function(id) {
		return $http.get('/posts/' + id).then(function(res) {
			return res.data;
		});
	};

	o.addComment = function(id, comment) {
		return $http.post('/posts/' + id + '/comments', comment);
	};

	o.upvoteComment = function(post, comment) {
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote')
			.success(function(data) {
				comment.upvotes += 1;
			});
	};

	return o;
}]);

//Handles authentication
app.factory('auth', ['$http', '$window', function($http, $window) {
	var auth = {};

	auth.saveToken = function(token) {
		$window.localStorage['seenit-news-token'] = token;
	};

	auth.getToken = function() {
		return $window.localStorage['seenit-news-token'];
	};

	auth.isLoggedIn = function() {
		var token = auth.getToken();

		if(token) {
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	 auth.currentUser = function() {
	 	if(auth.isLoggedIn()) {
	 		var token = auth.getToken();
	 		var payload = JSON.parse($window.atob(token.splot('.')[1]));

	 		return payload.username;
	 	}
	 };

	 auth.register = function(user) {
	 	return $http.post('/register', user).success(function(data) {
	 		auth.saveToken(data.token);
	 	});
	 };

	 auth.logIn = function(user) {
	 	return $http.post('/login', user).success(function(data) {
	 		auth.saveToken(data.token);
	 	});
	 };

	 auth.logOut = function() {
	 	$window.localStorage.removeItem('seenit-news-token');
	 };

	return auth;
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

		$scope.delPost = function(post) {
			posts.del(post);
		}

		$scope.incrementUpvotes = function(post) {
			posts.upvote(post);
		}
	}
])
.controller('PostsCtrl', ['$scope', 'posts', 'post', function($scope, posts, post) {

	$scope.post = post;


	$scope.addComment = function() {
		if($scope.body === '') return;
		posts.addComment(post._id, {
			body: $scope.body,
			author: 'user',
		}).success(function(comment) {
			$scope.post.comments.push(comment);
		});
			
		$scope.body = null;
	};

	$scope.incrementUpvotes = function(comment) {
		posts.upvoteComment(post, comment);
	};

}]);