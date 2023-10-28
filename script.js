const input = document.querySelector('.input');
const form = document.querySelector('.form');
const message = document.querySelector('.message');
const todoItem = document.querySelector('.todoItem');

let todos = [];

loadTodosFromLocalStorage();

form.addEventListener('submit', function(event) {
    event.preventDefault();

    if (input.value.trim() !== '') {
        addTodo();
    }
});

todoItem.addEventListener('click', function(event) {
    const target = event.target;
    if (target.classList.contains('itemTask')) {
        target.classList.toggle("checked");
        savetoLocalStorage();
    } else if (target.classList.contains('spanCloseButton')) {
        const li = target.parentElement;
        const todoId = li.getAttribute('data-id');
        deleteTodoById(todoId);
    } else if (target.classList.contains('edit')) {
        editTodoItem(target);
    }
});

function messages(msg) {
    return msg;
}

function savetoLocalStorage() {
    localStorage.setItem("todos", JSON.stringify(todos));
}

function loadTodosFromLocalStorage() {
    const storedTodos = localStorage.getItem("todos");
    if (storedTodos) {
        todos = JSON.parse(storedTodos);
    }
}

function removeTodoFromLocalStorage(todoId) {
    todos = todos.filter(todo => todo.id !== todoId);
    localStorage.setItem("todos", JSON.stringify(todos));
}

function deleteTodoById(todoId) {
    const li = document.querySelector(`[data-id="${todoId}"]`);
    if (!li) return;

    const deletedTodo = todos.find(todo => todo.id === todoId);
    li.remove();

    if (deletedTodo) {
        displayMessage(messages(`${deletedTodo.text} Successfully deleted.`));
        removeTodoFromLocalStorage(todoId);
    }
}

function showTaskItems() {
    todoItem.innerHTML = '';
    if (todos.length === 0) {
        displayMessage(messages('No task available.'));
    } else {
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.textContent = todo.text;
            li.classList.add('itemTask');
            li.setAttribute('data-id', todo.id);

            let editItem = document.createElement('p');
            editItem.textContent = '✎';
            editItem.classList.add('edit');
            li.appendChild(editItem);

            let span = document.createElement('span');
            span.textContent = '\u00d7';
            span.classList.add('spanCloseButton');
            li.appendChild(span);

            todoItem.appendChild(li);
        });
    }
}

showTaskItems();

function addTodo() {
    const text = input.value.trim();

    if (text === '') {
        displayMessage(messages('Input is required!'));
        return;
    }

    const taskExists = todos.some(todo => todo.text === text);

    if (taskExists) {
        displayMessage(messages('Task already exists!'));
        return;
    }

    const todoId = `todo_${todos.length}`;
    todos.push({
        id: todoId,
        text,
        isEditing: false,
    });

    const li = document.createElement('li');
    li.textContent = text;
    li.classList.add('itemTask');

    let editItem = document.createElement('p');
    editItem.textContent = '✎';
    editItem.classList.add('edit');
    li.appendChild(editItem);

    let span = document.createElement('span');
    span.textContent = '\u00d7';
    span.classList.add('spanCloseButton');
    li.appendChild(span);

    li.setAttribute('data-id', todoId);

    todoItem.appendChild(li);

    displayMessage(messages('New Todo Added.'));
    input.value = '';
    savetoLocalStorage();
}

function editTodoItem(editButton) {
    const li = editButton.parentElement;
    const todoId = li.getAttribute('data-id');
    const editTodo = todos.find(todo => todo.id === todoId);

    if (editTodo && !editTodo.isEditing) {
        editTodo.isEditing = true;

        const taskElement = li.childNodes[0];

        if (taskElement) {
            let inputElement = document.createElement('input');
            inputElement.value = taskElement.textContent;
            inputElement.classList.add('editing-input')
            li.replaceChild(inputElement, taskElement);
            inputElement.focus();

            let isEditing = true; // Flag to track the editing state

            inputElement.addEventListener('blur', function() {
                if (isEditing) {
                    taskElement.textContent = inputElement.value;
                }
                editTodo.isEditing = false;
                isEditing = false;
            });

            inputElement.addEventListener('keyup', function(event) {
                if (event.key === "Enter") {
                    if (isEditing) {
                        const newTaskText = inputElement.value;

                        if(isDuplicateTask(newTaskText)) {
                            displayMessage(messages('Task already exists!'));
                            return;
                        }

                        taskElement.textContent = inputElement.value;
                        displayMessage(messages('Edit success.'));
                        editTodo.text = newTaskText;
                    }
                    editTodo.isEditing = false;
                    li.replaceChild(taskElement, inputElement);
                    savetoLocalStorage();
                }
            });
        }
    }
}

function isDuplicateTask(newTaskText) {
    return todos.some(todo => todo.text === newTaskText);
}


function displayMessage(msg, timeout = 3000) {
    message.textContent = msg;
    message.classList.add('success-msg');
    setTimeout(() => {
        message.textContent = '';
    }, timeout);
}