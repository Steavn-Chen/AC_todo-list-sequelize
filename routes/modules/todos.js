const express = require('express')
const router = express.Router()
const db = require('../../models')
const Todo = db.Todo

router.get('/new', (req, res) => {
  res.render('new')
})

router.post('/', (req, res) => {
  const userId = req.user.id
  const name = req.body.name
  return Todo.create({
    name,
    UserId: userId,
  })
    .then(() => res.redirect('/'))
    .catch((err) => console.log(err))
})

router.get('/:id', (req, res) => {
  const id = req.params.id
  const UserId = req.user.id
  return Todo.findOne({ where:{ id, UserId } })
    .then((todo) => res.render('detail', { todo: todo.toJSON() }))
    .catch((error) => console.log(error))
})

router.get('/:id/edit', (req, res) => {
  const id = req.params.id
  const UserId = req.user.id
  return Todo.findOne({ where:{ id, UserId } })
    .then((todo) => res.render('edit', { todo: todo.toJSON() }))
    .catch((err) => console.log(err))
})

router.put('/:id', (req, res) => {
  const id = req.params.id
  const { name, isDone } = req.body
  const UserId = req.user.id
  return Todo.findOne({  where: { id, UserId } })
    .then((todo) => {
      (todo.name = name), (todo.isDone = isDone === 'on')
      return todo.save()
    })
    .then(() => res.redirect('/'))
    .catch((err) => console.log(err))
})

router.delete('/:id', (req, res) => {
  const id = req.params.id
  const UserId = req.user.id
  console.log(id, UserId)
  return Todo.findOne({  where: { id, UserId } })
    .then((todo) => todo.destroy())
    .then(() => res.redirect('/'))
    .catch((err) => console.log(err))
})

module.exports = router