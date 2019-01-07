var mongoose=require("mongoose");
var Campground=require("./models/campground");
var Comment=require("./models/comment");

var data=[
      {
          name:"new one",
          img:"https://images.unsplash.com/photo-1529968493954-06bbf3fdacc2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
          desc:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      },
      {
          name:"new one",
          img:"https://images.unsplash.com/photo-1529968493954-06bbf3fdacc2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
          desc:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      },
      {
          name:"new one",
          img:"https://images.unsplash.com/photo-1529968493954-06bbf3fdacc2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
          desc:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      },
    ]
function seedDB(){
    //remove all campgrounds
    Campground.remove({},function(err){
      if(err){
          console.log(err);
      }else{
          console.log("all campgrounds are removed!");
          //add a few campgrounds
          data.forEach(function(seed){
              Campground.create(seed,function(err,campground){
                  if(err){
                      console.log(err);
                  } else{
                      console.log("One campground is created");
                      //add few comments
                      Comment.create({
                          text:"the great wall of china",
                          auther:"allen turing",
                      },function(err,comment){
                          if(err){
                              console.log(err);
                          } else{
                              campground.comments.push(comment);
                              campground.save();
                              console.log("created new comment!");
                          }
                      });
                  }
              });
          });
      }
   });
   
   
}
module.exports=seedDB;