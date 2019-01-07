var mongoose=require("mongoose");
// define schema for campgrounds
var campgroundSchema =new mongoose.Schema({
    name:String,
    price:String,
    img:String,
    desc:String,
    creater:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        },
        username:String,
    },
    comments:[
        {
          type:mongoose.Schema.Types.ObjectId,
          ref:"Comment",
        }
    ],
});

// convert/model campgroundSchema into a object so that we can use its methods
module.exports=mongoose.model("campground",campgroundSchema);