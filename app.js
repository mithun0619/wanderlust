if(process.env.NODE_ENV !="production"){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError=require("./utils/expressError.js");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const MONGO_URL=process.env.ATLAS_DB_URL;
const SESSION_SECRET =process.env.SESSION_SECRET;

const store=MongoStore.create({
  mongoUrl : MONGO_URL,
  crypto: {
  secret: SESSION_SECRET,
  },
  touchAfter: 24*60*60, // time period in seconds
});


store.on("error",function(e){
  console.log("Session store error",e);
});

const sessionOptions={
 store,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() +7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
  },
  httpOnly: true,
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); //user can go diffrent pages after login he do not need to login again on diffrent-diffrent pages
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); // serialize user in the session means store user info for session
passport.deserializeUser(User.deserializeUser()); // remove user info from session when he logout

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
})

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");



main()
  .then(() => {
    console.log("Connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main(params) {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

// Catch-all route for 404 errors - using regex for Express 5 compatibility
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }
    let {statusCode = 500, message = "Something went wrong!"} = err;
    return res.status(statusCode).render("error.ejs",{message})
    // res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("Listening");
});
