const express = require('express');
const app = express();
const path = require('path');
const PORT = 3000;
app.use(express.urlencoded({extended: true}));
require('dotenv').config();

// Asettaa staattisen hakemiston
app.use('/todo', express.static(path.join(__dirname, 'public')));

// Kääntää json stringit objekteiksi
app.use(express.json());

const mongoose = require('mongoose');
const mongoDB = process.env.CONN_STRING;
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true, dbName: 'TodoApp'});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Database test connected");
});

// Scheemat
const todoSchema = new mongoose.Schema({
  text: {type: String, required: false},
  completed: {type: Boolean, required: true},
  expiresAfter: {type: Date, default: new Date, required: true},
});

// Modelit
const Todo = mongoose.model('Todo', todoSchema, 'todos');

// ----------------------- To Do -osuus ----------------------------

// Funktio, joka tarkistaa onko tehtävää olemassa.
async function doesTodoExist(todoId) {
  const todo = await Todo.findById(todoId);
  return !!todo;
}

// Lisää tehtävän
app.post('/todo/todos', async (request, response) => {
  const {text} = request.body;
  const todo = new Todo({
    text: text,
    completed: false,
    expiresAfter: new Date
  });
  const savedTodo = await todo.save();
  response.json(savedTodo);
});

// Hakee tehtävät
app.get('/todo/todos', async (request, response) => {
  const todos = await Todo.find({});
  response.json(todos);
});

// Poistaa tietyn tehtävän
app.delete('/todo/todos/:id', async (request, response) => {
  const todoExists = doesTodoExist(request.params.id);
  if (todoExists) {
    await Todo.findByIdAndRemove(request.params.id);
    console.log("DELETED!")
    response.status(200).json({message: 'Todo removed successfully'});
  } else {
    response.status(404).json({error: 'Todo not found'});
  }
});

// Muokkaa tehtävää
app.put('/todo/todos/:id', async (request, response) => {
  const todoId = request.params.id;
  const updatedTodo = request.body.text;
  const todoExists = await doesTodoExist(todoId);
  if (todoExists) {
    await Todo.findByIdAndUpdate(todoId, {text: updatedTodo});
    response.status(200).json({message: 'Todo updated successfully'});
  } else {
    response.status(404).json({error: 'Todo not found'});
  }
});

// ----------------------- Completed -osuus ----------------------------

// Merkitsee tehtävän tehdyksi
app.put('/todo/completed/:id', async (request, response) => {
  const todoId = request.params.id;
  const updatedTodoText = request.body.text;
  const updatedTodoCompletionStatus = !request.body.completed;
  const todoExists = await doesTodoExist(todoId);
  if (todoExists) {
    await Todo.findByIdAndUpdate(todoId, {text: updatedTodoText, completed: updatedTodoCompletionStatus});
    response.status(200).json({message: 'Todo updated successfully'});
  } else {
    response.status(404).json({error: 'Todo not found'});
  }
});

// Hakee tietyn suoritetun tehtävän
app.get('/todo/completed/:id', async (request, response) => {
  const todo = await completed.findById(request.params.id);
  if (todo) response.json(todo);
  else response.status(404).end();
});

// app listen port 3000
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
