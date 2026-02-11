const mongoose = require("mongoose");
const passportLocalMongoose=require("passport-local-mongoose");

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    }
    //username and password is automatic added by passportLocalMongoose 
});

userSchema.plugin(passportLocalMongoose.default);

module.exports=mongoose.model("User",userSchema);