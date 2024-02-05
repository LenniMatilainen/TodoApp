const cors = require('cors')
const express = require('express');
const app = express();
const fs   = require('fs');
const path = require('path');
const router = express.Router();
app.use(express.json());
app.use('/', router);
app.use(express.urlencoded({extended: true} ));
app.use(express.static(__dirname));
require('dotenv').config()
const PORT = 3001;

module.exports = app

// käyttää routeria kertoakseen mistä html-sivu löytyy 
router.get('/todo', (request,response) => {
  response.sendFile(path.join(__dirname + '/views/index.html'));
});

// cors - salli liikenne kaikista porteista ja domaneista
app.use(cors())

// Käännö json stringit objekteiksi
app.use(express.json())

const mongoose = require('mongoose')
const mongoDB = process.env.CONN_STRING
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true, dbName : 'TodoApp'})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log("Database test connected")
})

// Scheemat
const todoSchema = new mongoose.Schema({ 
  text: { type: String, required: false },
  completed: { type: Boolean, required: true},
  expiresAfter: { type: Date, default: new Date, required: true },
});

// Modelit
const Todo = mongoose.model('Todo', todoSchema, 'todos')

// ----------------------- To Do -osuus ----------------------------

// Funktio, joka tarkistaa onko tehtävää olemassa.
async function doesTodoExist(todoId) {
  const todo = await Todo.findById(todoId);
  return !!todo;
}

// Lisää tehtävän
app.post('/todos', async (request, response) => {
  const { text } = request.body
  const todo = new Todo({
    text: text,
    completed: false,
    expiresAfter: new Date
  })
  const savedTodo = await todo.save()
  response.json(savedTodo)  
})

// Hakee tehtävät
app.get('/todos', async (request, response) => {
  const todos = await Todo.find({})
  response.json(todos)
})

// Poistaa tietyn tehtävän
app.delete('/todos/:id', async (request, response) => {
  const todoExists = doesTodoExist(request.params.id)
  const deletedTodo = request.body.id 
  if (todoExists) {
    await Todo.findByIdAndRemove(deletedTodo)
    response.status(200).json({message: 'Todo removed successfully'});
  } else {
    response.status(404).json({ error: 'Todo not found' });
  }
})

// todos-route
app.get('/todos', (request, response) => {
  response.send('Todos')
})

// app listen port 3001
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})

// Muokakkaa tehtävää
app.put('/todos/:id', async (request, response) => {
  const todoId = request.params.id
  const updatedTodo = request.body.text;
  const todoExists = await doesTodoExist(todoId)
  if (todoExists) {
    await Todo.findByIdAndUpdate(todoId, { text: updatedTodo });
    response.status(200).json({ message: 'Todo updated successfully' });
  } else {
    response.status(404).json({ error: 'Todo not found' });
  }
})

// ----------------------- Completed -osuus ----------------------------

// Merkitsee tehtävän tehdyksi
app.put('/completed/:id', async (request, response) => {
  const todoId = request.params.id
  const updatedTodoText = request.body.text
  const updatedTodoCompletionStatus = !request.body.completed
  const todoExists = await doesTodoExist(todoId)

  if (todoExists) {
    await Todo.findByIdAndUpdate(todoId, { text: updatedTodoText, completed: updatedTodoCompletionStatus });
    response.status(200).json({ message: 'Todo updated successfully' });
  } else {
    response.status(404).json({ error: 'Todo not found' });
  }
})

// Hakee tietyn suoritetun tehtävän
app.get('/completed/:id', async (request, response) => {
  const todo = await completed.findById(request.params.id)
  if (todo) response.json(todo)
  else response.status(404).end()
})