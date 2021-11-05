const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const passport = require('passport')

const app = express()
const PORT = 3000

const db = require('./models')
const Todo = db.Todo
const User = db.User

app.engine('hbs', exphbs({ defaultLayout: 'main', extname: 'hbs' }))
app.set('view engine', 'hbs')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(session({
  secret: 'ThisIsMySecret',
  resave: false,
  saveUninitialized: true
}))

const usePassport = require('./config/passport')
const todo = require('./models/todo')
usePassport(app)

app.get('/', (req, res) => {
  return Todo.findAll({
    raw: true,
    nest: true
  })
    .then(todos => { 
      return res.render('index', { todos:todos })
    })
    .catch(error => res.status(422).json(error))
})

app.get('/todos/new', (req, res) => {
  res.render('new')
})

app.post('/todos', (req, res) => {
  const userId = req.user.id
  const name = req.body.name
  return Todo.create({
    name,
    UserId: userId
  })
    .then(() => res.redirect('/'))
    .catch(err => console.log(err))
})

app.get('/todos/:id', (req, res) => {
  const id = req.params.id
  return Todo.findByPk(id)
    .then((todo) => res.render("detail", { todo: todo.toJSON() }))
    .catch((error) => console.log(error));
})

app.get("/todos/:id/edit", (req, res) => {
  const userId = req.user.id
  const id = req.params.id
  return Todo.findByPk(id)
    .then(todo => res.render('edit', { todo: todo.toJSON()}))
    .catch(err => console.log(err))
})

app.put('/todos/:id', (req, res) => {
  const id = req.params.id
  const { name, isDone } = req.body
  return Todo.findByPk(id)
    .then(todo => {
      todo.name = name,
      todo.isDone = isDone === 'on'
      return todo.save()
    })
    .then(() => res.redirect('/'))
    .catch(err => console.log(err))
})

app.delete('/todos/:id', (req, res) => {
  const id = req.params.id
  console.log(id)
  return Todo.findByPk(id)
    .then(todo =>  todo.destroy())
    .then(() => res.redirect('/'))
    .catch(err => console.log(err));
})

app.get('/users/login', (req, res) => {
  res.render('login')
})


app.post('/users/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login'
}))
// app.post('/users/login', (req, res) => {
//   res.send("login")
// })

app.get('/users/register', (req, res) => {
  res.render('register')
})

app.post('/users/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body
  User.findOne({ where: { email } }).then(user => {
    if(user) {
      console.log('User already exists')
      return res.render('register', {
        name,
        email,
        password,
        confirmPassword
      })
    }
    return bcrypt
      .genSalt(10)
      .then(salt => bcrypt.hash(password, salt))
      .then(hash => User.create({
        name,
        email,
        password: hash
      }))
      .then(() => res.redirect('/'))
      .catch(error => console.log(error))
  })
})

app.get('/users/logout', (req, res) => {
  req.logout()
  res.redirect('/users/login')
})



app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})
