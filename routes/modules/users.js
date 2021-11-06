const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User

router.get('/login', (req, res) => {
  res.render('login')
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureMessage: true
  })
)

router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body
  const errors = []
  User.findOne({ where: { email } }).then((user) => {
    if (!name || !email || !password || !confirmPassword) {
      errors.push({ message: '每一個欄位都要填寫喔!' })
    }
    if (password !== confirmPassword) {
      errors.push({ message: '密碼與確認密碼要一致。' })
    }
    if (errors.length) {
      return res.render('register', {
        errors,
        name,
        email,
        password,
        confirmPassword
      })
    }
    if (user) {
      errors.push({ message: '此帳號己經註冊過了，請更改。' })
      return res.render('register', {
        errors,
        name,
        email,
        password,
        confirmPassword
      })
    }
    return bcrypt
      .genSalt(10)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hash) =>
        User.create({
          name,
          email,
          password: hash
        })
      )
      .then(() => res.redirect('/'))
      .catch((error) => console.log(error))
  })
})

router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', '你己成功登出。')
  res.redirect('login')
})

module.exports = router