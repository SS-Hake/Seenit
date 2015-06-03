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
router.post('/posts', function(req, res, next) {
	//Assigned the value of the requests' text.
	var post = new Post(req.body);

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
router.put('/posts/:post/upvote', function(req, res, next) {
	req.post.upvote(function(err, post) {
		if(err) return next(err);

		res.json(post);
	})
});

//Comments route.
//Save the comment to the correct post id.
router.post('/posts/:post/comments', function(req, res, next) {
	var comment = new Comment(req.body);
	comment.post = req.post;

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
router.put('/posts/:post/comments/:comment/upvote', function(req, res, next) {
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



module.exports = router;
