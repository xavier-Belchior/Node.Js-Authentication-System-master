if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

//IMPORTING LIBRAIES THAT WE INSTALL  USING NPM
const express = require("express")
const app = express()
const bcrypt = require("bcrypt") //import bcrypt package
const passport = require("passport")
const initializePassport = require("./passport-config.js")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride=require("method-override")

// Configura o mecanismo de visualização EJS
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []

app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, //WE CAN RESAVE THE SESSION VARIABLE IF NOTHING IS CHANGED
    saveUninitialized: false

}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))
//CONFIGURING THE LOGIN POST FUNCTONALITY
app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))



//CONFIGURING THE REGISTER POST FUNCTONALITY
app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        })
        console.log(users);//display newly registered in the console
        res.redirect("/login")
    } catch (e) {
        console.log(e);
        res.redirect("/register")

    }
})

//ROUTER
app.get('/', checkAuthenticated, (req, res) => {
    console.log(req.user.name)

    res.render("index.ejs", { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
})
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})
//END ROUTER

// app.delete("logout", (req, res)=>{
//     req.logOut()
//     res.redirect("/login")
// })
app.delete('/logout', (req, res)=>{
   req.logout(req.user, err => {
    if(err) return next(err)
    res.redirect("/")
   })
})

//I HAVE THAT AUTHENTICATED THIS FORM TO USE REQ.USER I USED THIS FUNCTION THERE UP isAuthenticated
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
       return res.redirect('/');
    }
    return next();
}

app.listen(3000)