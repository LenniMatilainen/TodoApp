// Kun ikkuna lataa, käynnistyy sovellus.
window.addEventListener("load", init())

// Käynnistää sovelluksen. Käskee lataamaan tehtävät.
function init() {
    let infoText = document.getElementById('infoText')
    infoText.innerHTML = 'Ladataan tehtävälista palvelimelta, odota...'
    loadTodos(false)
}

// Jos parametriksi on annettu false, lataa se tekemättömät tehtävät. Muuten se lataa tehdyt tehtävät.
async function loadTodos(isCompleted) {
    let response = await fetch('/todo/todos')
    let tasks = await response.json()
    let todos;
    isCompleted ? todos = tasks.filter(item => item.completed) : todos = tasks.filter(item => !item.completed)
    showTodos(todos, isCompleted)
}

// Lataa tehtävät näkyviin
function showTodos(todos, isCompleted) {
let todosList = document.getElementById('todosList')
let infoText = document.getElementById('infoText')
// Jos listassa ei ole yhtään tehtävää näyttää se tekstin riippuen kumpaa listaa pyydetään
if (todos.length === 0 && !isCompleted) {
    infoText.innerHTML = 'No Tasks To Be Done'
} else if (todos.length === 0 && isCompleted) {
  infoText.innerHTML = 'No Completed Tasks'
} else {
    // Silmukka lataa kaikki tehtävät listasta ja luo elementit sivulle.    
    for (let i = 0; i < todos.length; i++) {
      const todo = todos[i];
      // Tekee tehtävän tekstiosion. Joko input tai li.
      let taskText = createTodoListItem(todo, isCompleted)
      // Tekee tehtävälle poistopainikkeen.     
      let x = createRemoveNode(todo, isCompleted);
      // Tekee tehtävälle checkmarkin, jotta se voidaan merkata tehdyksi.
      let completedNode = createCompletedNode(taskText, todo, isCompleted);
      // Ottaa kaikki aikaisemmat elementit ja lisää ne yhden divin sisälle
      let wrapper = createTodoWrapper(todo, taskText, x, completedNode);
      // Puskee divin tehtävälistaan
      todosList.appendChild(wrapper);
    }
    // Jos pyydetään lataamaan suoritettuja tehtäviä, ruksitetaan kaikki checkmarkit.
    if (isCompleted) {
      const checkboxes = document.getElementsByClassName("checkbox");
      for (let i = 0; i < checkboxes.length; i++) {
        const checkbox = checkboxes[i];
        checkbox.checked = true;
      }
    }
    // Koska tehtäviä löytyi, poistetaan infoText.
    infoText.innerHTML = null;
  }
}

// Lisää yhden tehtävän listaan.
async function addTodo() {
  // Hakee kirjoituskentän tekstin...
  let newTodo = document.getElementById('newTodo')
  // ... ja lisää sen tietokantaan POST -metodilla. Tämän jälkeen on aika luoda siitä HTML -elementti.
  const data = { 'text': newTodo.value }
  const response = await fetch('/todo/todos', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  })
  let todo = await response.json()
  
  // Luodaan wrapper-div jonka sisällä on muut elementit.
  let taskText = createTodoListItem(todo, false)     
  let x = createRemoveNode(todo, false);
  let completed = createCompletedNode(taskText, todo, false);
  let wrapper = createTodoWrapper(todo, taskText, x, completed);
  todosList.appendChild(wrapper);

  let infoText = document.getElementById('infoText');
  infoText.innerHTML = null;
  newTodo.value = null;
  // Tehtävän lisäämisen jälkeen rullataan lista alas asti, jotta nähdään luotu tehtävä.
  todosList.scrollTop = todosList.scrollHeight;
}

// Luodaan tehtävän tekstiosio.
function createTodoListItem(todo, isCompleted) {
  let element;
  if (isCompleted) {
    element = "li"
  } else if (!isCompleted) {
    element = "input"
  }
  // Luo elementin.
  let taskText = document.createElement(element)
  // Luo id- attribuutin.
  let taskText_attr_id = document.createAttribute('id')
  // Luo class- attribuutin.
  let taskText_attr_class = document.createAttribute('class');
  // Antaa id-attribuutille arvon jossa on t_ ja taidon id
  taskText_attr_id.value = ('t_' + todo._id);
  
  // input elementille sopivat arvot
  if (!isCompleted) {
    taskText.setAttribute("value", todo.text)
    taskText.onclick = function() {focused(taskText)}
    taskText_attr_class.value = 'taskTextInput';
  // li elementille sopivat arvot  
  } else {
    taskText.innerHTML = todo.text
    taskText_attr_class.value = 'taskTextLi';
  }

  // Antaa lopuksi idn ja classin elementille.
  taskText.setAttributeNode(taskText_attr_id)
  taskText.setAttributeNode(taskText_attr_class)
  return taskText
}

// Luo tehtävänpoistonappulan.
function createRemoveNode(todo, isCompleted) {
    // Luo elementin span
    let x = document.createElement("span");
    // Tekee textNoden...
    let remove = document.createTextNode(' x ');
    // Ja asettaa sen span elementille.
    x.appendChild(remove);
    // Luo spanille classin...
    let removeNode_class = document.createAttribute('class');
    // ... jonka arvoksi tulee "remove"
    removeNode_class.value = 'remove';
    // Lopuksi asettaa spanille luodun classin 
    x.setAttributeNode(removeNode_class);
    // Spania painamalla käynnistyy removeTodo()
    x.onclick = function () { removeTodo(todo._id, isCompleted, false) };
    return x
}

// Luo checkmarkin, jolla voi merkitä tehtävän tehdyksi.
function createCompletedNode(taskText, todo, isCompleted) {
  const completed = document.createElement("input");

  const completed_class = document.createAttribute('class');
  const completed_id = document.createAttribute('id');
  const checkbox = document.createAttribute('type');

  completed_class.value = 'checkbox';
  completed_id.value = ('c_'+ todo._id);
  checkbox.value = 'checkbox'

  completed.setAttributeNode(checkbox)
  completed.setAttributeNode(completed_class);
  completed.setAttributeNode(completed_id);

  completed.onclick = function () {
    markCompleted(todo._id, taskText.id, isCompleted) };
    return completed
}

// Luo div -elementin, jonka sisälle laitetaan aikaisemmin luodut elementit.
function createTodoWrapper(todo, taskText, x, checkbox) {
  let wrapper = document.createElement("div");

  let wrapper_attr_id = document.createAttribute('id');
  let wrapper_attr_class = document.createAttribute('class');

  wrapper_attr_id.value = todo._id;
  wrapper_attr_class.value = "task";

  wrapper.setAttributeNode(wrapper_attr_id);
  wrapper.setAttributeNode(wrapper_attr_class);

  wrapper.appendChild(checkbox);
  wrapper.appendChild(taskText);
  wrapper.appendChild(x);
  return wrapper
}

// Poistaa tehtävän DELETE -metodilla.
async function removeTodo(id, isCompleted, completionStatusChanged) {
  if (!completionStatusChanged) {
    await fetch('/todo/todos/' + id, {
      method: 'DELETE'
    })
  }

  // Suorittaa poiston loppuun poistamalla elementin DOM:ista.
  let task = document.getElementById(id)
  task.remove(id)
  todosList = document.getElementById("todosList");
  let infoText = document.getElementById('infoText')
  // Jos poiston jälkeen ei ole tehtäviä näyttää, näyttää se oikean tekstin.
  if (!isCompleted && !todosList.hasChildNodes()) {
    infoText.innerHTML = 'No Tasks To Be Done'
  } else if (isCompleted && !todosList.hasChildNodes()) {
    infoText.innerHTML = 'No Completed Tasks'
  }
}

// Päivittää olemassa olevan tehtävän.
async function saveTodo(element) {
  let identif = element.parentNode.id
  const data = { 'text': element.value }
  // Etsii tehtävän tietokantaan tallennetun id:n tehtävän ja päivittää sen PUT -metodilla
  const response = await fetch('/todo/todos/' + identif, {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  })

  if (response.status === 404) {
    alert(`The task ${element.value} got automatically deleted or does not exist.`)
    removeTodo(identif, true, true)
  }
}

// Jos funktio vastaanottaa elementin, se tarkoittaa sitä, että elementti on tarkennettu.
function focused(element) {
  // Jos kentän tarkennus otetaan pois tallentaa se kentän muutokset saveTodo() funktiolla.
  element.addEventListener("blur", function() {
    saveTodo(element)
  });
}

// Uuden tehtävän voi listä nappia painamalla
let addButton = document.getElementById("addButton");
addButton.addEventListener("click", function (event) {
  let input = document.getElementById("newTodo");
  if (input.value != "") {
    addTodo();
  }
});


// Jos sivulla painetaa jotain näppäimistön näppäintä käynnistyy funktio.
document.addEventListener("keyup", function(event){
  let input = document.getElementById("newTodo")
  // Jos painettu näppäin on "enter", alin tekstikenttä on tarkennettu ja kenttä ei ole tyhjä, tallentaa se kentän tiedot tietokantaan.
  if(event.key === "Enter" && input === document.activeElement && input.value !== "") {
      addTodo();
  }
  // Enterin painallus asettaa kohdennuksen uudestaan tekstikenttään.
  else if (event.key === "Enter") {
    input.focus();
  }
  // Escapella tarkennus lähtee pois.
  else if (event.key === "Escape") {
    input.blur();
  }
});

// Merkkaa valitun tehtävän suoritetuksi tai ei suoritetuksi.
async function markCompleted(taskID, inputID, isCompleted) {
  const task = document.getElementById(inputID);

  let data = !isCompleted ? { 'text': task.value } : { 'text': task.innerHTML }

  // Objektin completed -arvo kääntyy index.js -tiedostossa.
  response = await fetch(`/todo/completed/${taskID}`, {
    method: 'PUT',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  // Suoritettu tehtävä poistetaan vain DOMista
  removeTodo(taskID, isCompleted, true)
  if (response.status === 404) {
    alert(`The task ${task.value} got automatically deleted or does not exist.`)
  }
} 

// Tehtävänäkymän vaihtava painike
let taskTurn = document.getElementById("showTasks")
// Painamalla tätä käynnistyy showTab
taskTurn.onclick = function() { showTab() };

// Näyttää joko suoritetut tai suorittamattomat tehtävät
function showTab() {
  const todosList = document.getElementById("todosList");
  const tasksText = document.getElementById("tasks");
  const addSection = document.getElementById("addSection") 
  // Jos painike sisältää tekstin "Show Completed Tasks", poistaa se tehtävälistan, tehtävänlisäyskentän ja lataa suoritetut tehtävät.
  if (taskTurn.innerHTML === "Show Completed Tasks") {
    taskTurn.innerHTML = "Show tasks to be completed"
    tasksText.innerHTML = "Completed Tasks:"
    todosList.innerHTML = "";
    addSection.style.display = "none";
    loadTodos(true)
  }
  // Jos painikeen teksti on jotain muuta, lisää se tehtävän lisäyskentän takaisin, sekä lataa suorittamattomat tehtävät. 
  else {
    taskTurn.innerHTML = "Show Completed Tasks"
    tasksText.innerHTML = "Tasks:"
    addSection.style.display = "block";
    todosList.innerHTML = null;
    init()
  }
}
