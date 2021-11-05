const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
module.exports = app => {
  app.use(passport.initialize())
  app.use(passport.session())
  passport.use(new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, (req, email, password, done) => {
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) {
          return done(null, false, req.flash('checkLogin_msg', '此帳號不存在請先去註冊。'))
        }
        return bcrypt.compare(password, user.password).then(isMatch => {
          if (!isMatch) {
            return done(null, false, req.flash('checkLogin_msg', '密碼錯誤請重新確認。'))
          }
          return done(null, user)
        })
      })
      .catch(err => done(err, false))
  }))

  passport.use(new FacebookStrategy({
    clientID: '927929051180387',
    clientSecret: '68a636c0b4deef2edf9ab3a57852b864',
    callbackURL:"http://localhost:3000/auth/facebook/callback",
    profileFields: ['email', 'displayName']
  }, (accessToken, refreshToken, profile, done) => {
     const { name, email } = profile._json
     User.findOne({ where: { email } })
        .then(user => {
          if (user) return done(null, user)
          const randomPassword = Math.random().toString(36).slice(-8)
          bcrypt
            .genSalt(10)
            .then(salt => bcrypt.hash(randomPassword, salt))
            .then(hash =>  User.create({
              name,
              email,
              password: hash
            }))
            .then(user => done(null,user))
            .catch(err => done(err, false))       
        })
  }))

  passport.use(new GoogleStrategy({
    clientID: '1074980343957-c0ie7q6orbogovdegkps8935h0hrs3c5.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL:"http://localhost:3000/auth/google/callback",
    profileFields: ['email', 'displayName']
    }, (accessToken, refreshToken, profile, done) => {
      const { email, name } = profile._json
       User.findOne({ where: { email } }).then(user => {
         if (user) return done(null, user)
         const randomPassword = Math.random().toString(36).slice(-8)
         bcrypt
           .genSalt(10)
           .then(salt => bcrypt.hash(randomPassword, salt))
           .then(hash => User.create({
             name,
             email,
             password: hash
           }))
           .then(user => done(null, user))
           .catch(err => done(err, false))
        })
    }))

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser((id, done) => {
    User.findByPk(id)
      .then((user) => {
        user = user.toJSON()
        done(null, user)
      }).catch(err => done(err, null))
  })
}


