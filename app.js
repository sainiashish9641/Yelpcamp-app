var express      =require("express"),
    app          =express(),
    bodyParser   =require("body-parser"),
    mongoose     =require("mongoose"),
    flash        =require("connect-flash"),
    passport     =require("passport"),
    LocalStrategy=require("passport-local"),
    middlewareObj=require("./middleware/index.js"),
    methodOverride=require("method-override"),
    Campground   =require("./models/campground"),
    Comment      =require("./models/comment"),
    User         =require("./models/user"),
    seedDB       =require("./seeds");

//it is the seed function data for the index page which uses two models comment & campgound    
// seedDB();    
// connect mongoose with DB    
mongoose.connect('mongodb://localhost:27017/Yelp_app_8', { useNewUrlParser: true });

// flash is used to show the error and success msgs
app.use(flash());

// passport configuration
app.use(require("express-session")({
    // this sententence is used for decoding the session
    secret:"I love my India!",
    resave:false,
    saveUninitialized:false,
}));

app.use(passport.initialize());
app.use(passport.session());

// it is used for handle the login logic
// User.authenticate() take the data from the plugin
passport.use(new LocalStrategy(User.authenticate()));

// these two methods are used to reading the data of the session 
// and encode or decode it by using User model methods because of the plugin
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// // add new campgrounds to the DB
// Campground.create({
//     name:"marine",
//     img:"https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=8c8fc5a023e80b24f9fa26451a3c52cc&auto=format&fit=crop&w=750&q=80",
//     desc:"this is one of the awesome place to visit"
// },function(err,campground){
//     if(err){
//         console.log(err);
//     }else{
//         console.log("New campground is added to DB");
//         console.log(campground);
//     }
// });



app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine","ejs");

app.use(express.static( __dirname +"/public"));

// use method override for edit and update routes
app.use(methodOverride("_method"));


// this middleware is used for the index page currentUser logic 
// by using it we currentUser will not affect other pages which uses the navbar
app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    res.locals.error=req.flash("error");
    res.locals.success=req.flash("success");
    next();
});

// =========
// ROUTES
// =========
app.get("/",function(req,res){
    res.render("landing");
});
 

// INDEX- to show the list of all the items
// it uses a function as middleware
app.get("/campgrounds",function(req,res){
        // console.log(req.user);
        // show all campgrounds
        Campground.find({},function(err,allCampgrounds){
        if(err){
            console.log(err);
        }else{
           res.render("campgrounds/index",{campgrounds:allCampgrounds , currentUser:req.user});  
        }
    });
    
});
// NEW-to add a new item from form
app.get("/campgrounds/new",middlewareObj.isLoggedIn,function(req,res){
    res.render("campgrounds/campgroundsNew");
});

// CREATE- to create a new campground 
app.post("/campgrounds",middlewareObj.isLoggedIn,function(req,res){
    console.log(req.user);
    var name=req.body.name;
    var img=req.body.img;
    var desc=req.body.imgDesc;
    var username=req.user.username;
    var userId=req.user._id;
    var price=req.body.price;
    // take form input and put into DB
    Campground.create(
        {
            name: name,
            img:img,
            desc:desc,
            price:price,
            creater:{
                id:userId,
                username:username,
            }
        },function(err,campground){
            if(err){
                req.flash("error",err.message);
                
            }else{
                console.log("New campground is added to DB");
                console.log(campground);
            }
            
        });
    res.redirect("/campgrounds");
});

// SHOW- to show the information one particular item
app.get("/campgrounds/:id",function(req,res){
    // find the campground with provided id
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
        if(err){
            console.log(err);
        }else{
            console.log(foundCampground);
            // foundCampground.creater.id=req.user._id;
            // foundCampground.creater.username=req.user.username;
            // foundCampground.save();
            // render the show page
            res.render("campgrounds/show",{campground:foundCampground , currentUser:req.user});
        }
    });
 
});

// EDIT ROUTE
app.get("/campgrounds/:id/edit",middlewareObj.checkCampgroundOwnership,function(req,res){
    Campground.findById(req.params.id,function(err,foundCampground){
        res.render("campgrounds/edit",{campground:foundCampground}); 
    });            
});            


// UPDATE ROUTE
app.put("/campgrounds/:id",middlewareObj.checkCampgroundOwnership,function(req,res){
    // find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedCampground){
        if(err){
            req.flash("error",err.message);
            res.redirect("/campgrounds");
        } else{
            console.log(updatedCampground);
            req.flash("success","You have successfully updated the campground!");
            // redirect to the show page
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
    
});

// DESTROY ROUTE
app.delete("/campgrounds/:id",middlewareObj.checkCampgroundOwnership,function(req,res){
    Campground.findByIdAndRemove(req.params.id,function(err){
        if(err){
            req.flash("error",err.message);
            res.redirect("/campgrounds");
        } else{
            req.flash("success","You have successfully delete the campground!");
            res.redirect("/campgrounds");
        }
    });
});

// ================
// COMMENTS ROUTES
// ================
// NEW--> render the comment form
app.get("/campgrounds/:id/comments/new",middlewareObj.isLoggedIn,function(req,res){
    //find campground by id
    Campground.findById(req.params.id, function(err,foundCampground){
        if(err){
            console.log(err);
        } else{
            res.render("comments/new",{campground: foundCampground});
        }
    });
});
//CREATE--> handle the comment post logic
app.post("/campgrounds/:id/comments",middlewareObj.isLoggedIn,function(req,res){
    // lookup campground using id
    Campground.findById(req.params.id,function(err ,foundCampground){
        if(err){
            console.log(err);
            req.flash("error",err.message);
            res.redirect("/campgrounds");
        } else{
            // create new comment
            Comment.create(req.body.comments,function(err,comment){
                // add username and id to comment
                comment.auther.id=req.user._id;
                comment.auther.username=req.user.username;
                comment.save();
                // connect the new comment to campground    
                foundCampground.comments.push(comment);
                foundCampground.save();
                req.flash("success","New comment is added successfully!");
                // redirect campground showpage
                res.redirect("/campgrounds/"+ foundCampground._id);
            });
        }
    });
});

// COMMENT EDIT--> edit the comments
app.get("/campgrounds/:id/comments/:comment_id/edit",middlewareObj.checkCommentOwnership,function(req,res){
    Comment.findById(req.params.comment_id,function(err,foundComment){
        res.render("comments/edit",{campground_id:req.params.id, comment:foundComment});
    });    
});

// COMMENT UPDATE--> handle the update of comments
app.put("/campgrounds/:id/comments/:comment_id",middlewareObj.checkCommentOwnership,function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedCampground){
        if(err){
            req.flash("error",err.message);
            res.redirect("back");
        } else {
            console.log(updatedCampground);
            req.flash("success","You have successfully updated the comment!");
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

// COMMENT DESTROY
app.delete("/campgrounds/:id/comments/:comment_id",middlewareObj.checkCommentOwnership,function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err){
            req.flash("error",err.message);
            res.redirect("/campgrounds/"+req.params.id);
        } else {
            req.flash("success","You have successfully deleted the comment!");
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

// ************
// AUTH ROUTES
// ************
// show signup form
app.get("/register",function(req,res){
    res.render("register");
});
// handling user signup
app.post("/register",function(req,res){
    // here we are creating a new object odf user and passing just username in the constructor 
    // we will pass the password as another perameter and it will save in DB in hashed format
    // it will create a new user after register and open the secret page
    User.register(new User({username:req.body.username}), req.body.password,function(err,user){
        if(err){
            req.flash("error",err.message);
            return res.render("register");
        }
        // it will logged the user in with the use of serialize method and local statragy
        passport.authenticate("local")(req,res,function(){
            req.flash("success","Welcome to Yelpcamp "+req.user.username);
            res.redirect("/campgrounds");
        });
    });
});

// ************
// LOGIN ROUTES
// ************
// show login form
app.get("/login",function(req,res){
    res.render("login");
});
//handle the login request using middleware method
app.post("/login",passport.authenticate("local",{
    successRedirect:"/campgrounds",
    failureRedirect:"/login"
}),function(req,res){
});

// *************
// LOGOUT ROUTES
// *************
app.get("/logout",function(req,res){
    // it will not perform any transaction in the DB it just flushout the session data 
    req.logout();
    // it throws the data to the header with the use of a middleware 
    req.flash("success","You have successfully logged out!");
    res.redirect("/campgrounds");
});


app.listen(process.env.PORT,process.env.IP,function(){
    console.log("Server is listening...");
});