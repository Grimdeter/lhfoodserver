const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const passport = require('passport')
const passportLocal = require('passport-local').Strategy
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs')
const expressSession = require('express-session')
const bodyParser = require('body-parser')
const User = require('./user')

mongoose.connect("mongodb+srv://John:<123>@cluster0.eb0po.mongodb.net/<dbname>?retryWrites=true&w=majority",
{
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () =>
{
    console.log('mogoose is connected')
})

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors(
    {
        origin: "http://localhost:3000",
        credentials: true
    }
))

app.use(expressSession(
    {
        secret: "sercretcode",
        resave: true,
        saveUninitialized: true
    }
))
app.use(cookieParser("secretcode"))
app.use(passport.initialize())
app.use(passport.session())
require('./passportConfig')(passport)


app.post("/login", (req, res, next) => 
{
    passport.authenticate('local', (err, user, info) =>
    {
        if (err) throw err
        if (!user) res.send('no user exists')
        else
        {
            req.logIn((user, err) =>
            {
                if (err) throw err
                res.send('success!')
                console.log(req.user)
            })
        }
    })(req, res, next)
})

app.post("/register", (req, res) => 
{
    User.findOne({username: req.body.username}, async (err, doc) =>
    {
        if(err) throw err
        if (doc) res.send('User already exists')
        if(!doc)
        {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const newUser = new User(
                {
                    username: req.body.username,
                    password: hashedPassword
                }
            )
            await newUser.save()
            res.send('user created')
        }
    })
})

app.get("/user", (req, res) => 
{
    res.send(req.user)
})

app.listen(4000, () =>
{
    console.log(`server has started`)
})