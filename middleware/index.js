var Campground   =require("../models/campground");
var    Comment   =require("../models/comment");

//all middleware will goes here
var middlewareObj={};


//fuction of middleware that checks that if a user is logged out 
// then it will not show the the secret page and it is used with secret route as middleware
middlewareObj.isLoggedIn=function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        // next is the method which automatecally knows that where to go next
        return next();
    }
    // this line will not render anything while is used to assign a error msg
    // which is show the error msg with the help of login.ejs file, which get the data from app.js 
    req.flash("error","You have to login first!");
    res.redirect("/login");
}

// another middleware that is used in edit update and destroy routes 
// it checks that only the owner of the particular post can have the rights to change it
middlewareObj.checkCampgroundOwnership =function checkCampgroundOwnership(req,res,next){
    // is user logged in?
    if(req.isAuthenticated()){
            Campground.findById(req.params.id,function(err,foundCampground){
            if(err){
                req.flash("error",err.message);
                res.redirect("back");
            } else {
                //does user own the campground?
                // we use mongo function for comparing two id here instead of using ===
                // because req.user have a string id while creater has an object id
                if(foundCampground.creater.id.equals(req.user._id)){
                   next(); 
                } else {
                    req.flash("error","You don't have the permission!");
                    //otherwise,redirect somewhere
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error","You have to login first!");
        // if not,redirect somewhere
        res.redirect("back");
    }
}

// middleware function for checking the comment ownerships
middlewareObj.checkCommentOwnership = function checkCommentOwnership(req,res,next){
    // is user logged in?
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id,function(err,foundComment){
            if(err){
                req.flash("error",err.message);
                res.redirect("back");
            } else {
                //does user owns the comment?
                if(foundComment.auther.id.equals(req.user._id)){
                    // if yes,redirect to edit form
                    next();
                    // res.render("comments/edit",{campground_id:req.params.id, comment:foundComment});
                } else {
                    req.flash("error","You don't have the permission to do so!");
                    // otherwise,redirect to somewhere else
                    res.redirect("back");
                }
            }    
        });
    } else {
        req.flash("error","You need to login first!");
        //if not logged in,redirect to somewhere else
        res.redirect("back");
    }
}




module.exports=middlewareObj;