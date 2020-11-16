require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => {
  console.log(`connection to database established`)
}).catch(err => {
  console.log(`db error ${err.message}`);
  process.exit(-1)
})
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String
});


const movieSchema = new mongoose.Schema({
  id: String,
  moviename: String,
  name: String,
  email: String,
  seats: String,
  phone: String,
  tickets: Number
});

const complainSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  complain: String
});

const adminSchema = new mongoose.Schema({
  username: String,
  password: String
});


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const Moviedetails = new mongoose.model("Moviedetails", movieSchema);
const Complaindetails = new mongoose.model("Complaindetails", complainSchema);
const Admindetails = new mongoose.model("Admindetails", adminSchema);

passport.use(User.createStrategy());
var id = "";
passport.serializeUser(function(user, done) {
  done(null, user.id);
  id = user.id;
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/index",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({
      googleId: profile.id
    }, function(err, user) {
      return cb(err, user);
    });
  }
));

var Na = "";
var Ph = "";
var No = "";
var Pr = "";

// ============== //

app.get("/", function(req, res) {
  res.render("login");
});

app.get("/auth/google",
  passport.authenticate('google', {
    scope: ["profile"]
  })
);

app.get("/auth/google/index",
  passport.authenticate('google', {
    failureRedirect: "/"
  }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/index");
  });

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/ad", function(req, res) {
  res.render("ad");
});

app.get("/ad1", function(req, res) {
  User.find({
    "username": {
      $ne: null
    }
  }, function(err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        console.log(foundUsers);
        var uid = foundUsers.id;
        Moviedetails.find({
          "id": {
            $ne: null
          }
        }, function(error, foundUsers1) {
          if (error) {
            console.log(error);
          } else {
            if (foundUsers1) {
              res.render("ad1", {
                usersWithSecrets: foundUsers,
                usersWithmovie: foundUsers1
              });
            }
          }
        })

      }
    }
  });
});


app.get("/feedback", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("feedback");
  } else {
    res.redirect("/");
  }
});


app.get("/about", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("about");
  } else {
    res.redirect("/");
  }
});

app.get("/index", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("index");
  } else {
    res.redirect("/");
  }
});

app.get("/pr2", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("pr2");
  } else {
    res.redirect("/");
  }
});

app.get("/pr3", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("pr3");
  } else {
    res.redirect("/");
  }
});

app.get("/pr5", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("pr5");
  } else {
    res.redirect("/");
  }
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

// ============= //

app.post("/register", function(req, res) {

  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/");
      });
    }
  });

});
const user = "";
app.post("/", function(req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/index");
      });
    }
  });

});


app.post("/index", function(req, res) {
  res.redirect("pr2");
});
var x = "";
app.post("/pr2", function(req, res) {
  x = req.body.sasank;
  res.redirect("pr3")
});

var email = "";
var name = "";
var phone = "";
var tickets = 0;
var date = "";
var moviename = "";
var seatNo = "";

app.post("/pr3", function(req, res) {
  email = req.body.Email;
  name = req.body.myName1;
  phone = req.body.myName2;
  tickets = req.body.myName3;
  date = req.body.myName4;
  moviename = x;


  Na = name;
  Ph = phone;
  No = tickets;
  Pr = tickets * 100;
  var nos = tickets;
  res.render("seat", {
    nos: nos
  });

});

app.post("/seat", function(req, res) {
  seatNo = req.body.sub;
  No = seatNo;
  const newMovie = new Moviedetails({
    id: id,
    moviename: moviename,
    date: date,
    tickets: tickets,
    phone: phone,
    name: name,
    seats: seatNo
  });

  newMovie.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.render('pr4', {
        Na: Na,
        Ph: Ph,
        No: No,
        Pr: Pr
      });
    }
  });

});

app.post("/pr4", function(req, res) {
  res.redirect("pr5");
});

app.post("/ad", function(req, res) {

  var username = req.body.username;
  var password = req.body.password;

  if (username == "karthikdurgavajjala@gmail.com" && password === "coolkarthik") {
    res.redirect("/ad1");
  } else {
    res.redirect("/ad");
  }




});

app.post("/feedback", function(req, res) {
  const email = req.body.username;
  const name = req.body.name;
  const complain = req.body.complain;


  const newComplain = new Complaindetails({
    id: id,
    email: email,
    name: name,
    complain: complain
  });

  newComplain.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("index");
    }
  });

});


app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
