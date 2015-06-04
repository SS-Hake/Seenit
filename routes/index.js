var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//Import mongoose as well as post and comment models.
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');
//passport
var passport = require('passport');
var jwt = require('express-jwt');

var auth = jwt({secret: 'SECRETUPDATETHIS', userProperty: 'payload'});

//GET json list containing all posts.
router.get('/posts', function(req, res, next) {
	//Express get method defines URL for the route.
	Post.find(function(err, posts) {
		//If there's an error hand it off.
		if(err) {return next(err);}
		//Else send the posts back to the client.
		res.json(posts);
	});
});

//POST request to server
router.post('/posts', auth, function(req, res, next) {
	//Assigned the value of the requests' text.
	var post = new Post(req.body);

	post.author = req.payload.username;

	post.save(function(err, post) {
		//If there's an error, hand it off.
		if(err) return next(err);
		//Else send the post to the database.
		res.json(post);
	});
});

//Preloading posts.
router.param('post', function(req, res, next, id) {
	var query = Post.findById(id);

	query.exec(function(err, post) {
		if(err) return next(err);
		if(!post) return next(new Error('can\'t find post'));

		req.post = post;
		return next();
	});
});

//GET single post.
router.get('/posts/:post', function(req, res) {
	res.json(req.post);
});

router.delete('/posts/:post', function(req, res) {
	console.log("Del happened");
});

//Route for upvote schema method.
router.put('/posts/:post/upvote', auth, function(req, res, next) {
	req.post.upvote(function(err, post) {
		if(err) return next(err);

		res.json(post);
	})
});

//Comments route.
//Save the comment to the correct post id.
router.post('/posts/:post/comments', auth, function(req, res, next) {
	var comment = new Comment(req.body);
	comment.post = req.post;
	comment.author = req.payload.username;

	comment.save(function(err, comment) {
		if(err) return next(err);

		req.post.comments.push(comment);
		req.post.save(function(err, post) {
			if(err) return next(err);

			res.json(comment);
		});
	});
});

//Increment comment upvotes
router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next) {
	req.comment.upvote(function(err, comment) {
		if(err) return next(err);

		res.json(comment);
	})
});

//Preloading comments.
router.param('comment', function(req, res, next, id) {
	var query = Comment.findById(id);

	query.exec(function(err, comment) {
		if(err) return next(err);
		if(!post) return next(new Error('can\'t find comment'));

		req.comment = comment;
		return next();
	});
});

router.get('/posts/:post', function(req, res, next) {
	req.post.populate('comments', function(err, post) {
		if(err) return next(err);

		res.json(post);
	})
});


//Register with a username and password.
router.post('/register', function(req, res, next) {
	if(!req.body.username || !req.body.password) {
		return res.status(400).json({message: 'Please fill out all fields'});
	}

	var user = new User();

	user.username = req.body.username;
	console.log("Register route...")
	user.setPassword(req.body.password);

	user.save(function(err) {
		if(err) {
			console.log("error!");
			return next(err);
		}
		console.log("Register route...")
		return res.json({token: user.generateJWT()});
	});
});


//Authenticate user and return token.
router.post('/login', function(req, res, next) {
	if(!req.body.username || !req.body.password) {
		return req.status(400).json({message: 'Please fill out all fields'});
	}

	passport.authenticate('local', function(err, user, info) {
		if(err) return next(err);

		if(user) {
			return res.json({token: user.generateJWT()});
		} else {
			return res.status(401).json(info);
		}
	})(req, res, next);
});

module.exports = router;
