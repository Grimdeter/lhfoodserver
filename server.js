const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const passport = require('passport')
const passportLocal = require('passport-local').Strategy
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs')
const expressSession = require('express-session')
const bodyParser = require('body-parser')
let User = require('./user')
const TeleBot = require("telebot");



mongoose.connect("mongodb+srv://john:1234@cluster0.eb0po.mongodb.net/lhfood?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log('mongoose is connected')
})

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(cors({
    origin: "https://35.246.57.142",
    credentials: true
}))

app.use(expressSession({
    secret: "sercretcode",
    resave: true,
    saveUninitialized: true
}))
app.use(cookieParser("secretcode"))
app.use(passport.initialize())
app.use(passport.session())
require('./passportConfig')(passport)


app.post("/login", (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) throw err
        if (!user) res.send('no user exists')
        else {
            req.logIn((user, err) => {
                if (err) throw err
                res.send('success!')
                console.log(req.user)
            })
        }
    })(req, res, next)
})

app.post("/register", (req, res) => {
    console.log(`hello from register`)
    User.findOne({
        username: req.body.username
    }, async (err, doc) => {
        if (err) console.log(err);
        if (doc) res.send("User Already Exists");
        if (!doc) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const newUser = new User({
                username: req.body.username,
                password: hashedPassword,
            });
            await newUser.save();
            res.send("User Created");
        }
    })
});

app.get("/user", (req, res) => {
    res.send(req.user)
})

const bot = new TeleBot({
    token: "1530562815:AAHsl78h62OKQCFxJI5JKyEx4F2l7n2IhYA",
});

bot.on(["/start", "/hello"], (msg) => {
    //all the information about user will come with the msg
    // console.log(msg);
    bot.sendMessage(msg.from.id, `SAMPLE TEXT SAMPLE TEXT SAMPLE TEXT SAMPLE TEXT SAMPLE TEXT SAMPLE TEXT`);
});

bot.on("/help", (msg) => {
    bot.sendMessage(msg.chat.id, `SAMPLE TEXT SAMPLE TEXT SAMPLE TEXT SAMPLE TEXT SAMPLE TEXT SAMPLE TEXT`)
});

bot.start();


app.listen(4000, () => {
    console.log(`server has started`)
})