const User = require('./user')
const bcrypt = require('bcryptjs')
const localStrategy = require('passport-local').Strategy
const user = require('./user')

module.exports = function(passport)
{
    passport.use(
        new localStrategy((username, password, done) =>
        {
            user.findOne({username: username}, (err, user) =>
            {
                if (err) throw err
                if(!user) return done(null, false)
                bcrypt.compare(password, user.password, (err, result) =>
                {
                    if(err) throw err
                    if(result === true)
                    {
                        return done(null, user)
                    } else
                    {
                        return done(null, false)
                    }
                })
            })
        })
    )

    passport.serializeUser((user, cb) =>
    {
        cb(null, user.id)
    })
    passport.deserializeUser((id, cb) =>
    {
        user.findOne({_id:id}, (err, user) =>
        {
            cb(err, user)
        })
    })
}