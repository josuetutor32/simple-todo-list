const input = document.querySelector('.input');
const form = document.querySelector('.form');
const message = document.querySelector('.message');
const todoItem = document.querySelector('.todoItem');
const showTodoEl = document.querySelector('.show-todo');

let todos = [];

loadTodosFromLocalStorage();
showTodo();

const checkInputSearch = input;
checkInputSearch.addEventListener('keyup', e => {
    const inputSearch = e.target.value;
    if(isDuplicateTask(inputSearch.trim())) {
        displayMessage(messages('Task already exists!'));
        return;
    }else{
        displayMessage(messages('Task is available.'));
        return;
    }
})

form.addEventListener('submit', function(event) {
    event.preventDefault();

    if (input.value.trim() !== '') {
        addTodo();
        showTodo();
    }
});

todoItem.addEventListener('click', function(event) {
    const target = event.target;
    if (target.classList.contains('itemTask')) {
        target.classList.toggle('checked'); 

        savetoLocalStorage();
    }
    if (target.classList.contains('spanCloseButton')) {
        const li = target.parentElement;
        const todoId = li.getAttribute('data-id');
        deleteTodoById(todoId);
    }
    if (target.classList.contains('edit')) {
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
        todos = JSON.parse(storedTodos).map(todo => ({
            ...todo,
            children: todo.children || [] // Initialize children as an empty array if not present
        }));
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
    const confimDelete = confirm('Are you sure you want to delete this task?');

    if(confimDelete) {
        li.remove();

        if (deletedTodo) {
            displayMessage(messages(`${deletedTodo.text} Successfully deleted.`));
            removeTodoFromLocalStorage(todoId);
        } else {
            displayMessage(messages(`${deletedTodo.text} Task deletion canceled.`));
        }
    }

    showTodo()
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

function showTodo() {
    const localStorageKey = 'todos';

    function savetoLocalStorage(tasks) {
        localStorage.setItem(localStorageKey, JSON.stringify(tasks));
    }

    function renderTasksRecursive(tasks, parentId) {
        return tasks.map(todo => {
            const childrenHtml = Array.isArray(todo.children) && todo.children.length > 0
                ? `<ul>${renderTasksRecursive(todo.children, todo.id)}</ul>`
                : '';
            return `<li class="todo-children" data-id="${todo.id}" data-parent-id="${parentId}">${todo.text}${childrenHtml}</li>`;
        }).join('');
    }
    
    const storedTodos = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    const todos = storedTodos.map(todo => ({
        ...todo,
        children: todo.children || []
    }));
    
    showTodoEl.innerHTML = todos.length > 0
        ? `<ul class="ulShowTodo">${renderTasksRecursive(todos, null)}</ul>`
        : 'No task available';    
    
    const taskElements = showTodoEl.querySelectorAll('.ulShowTodo li');
    taskElements.forEach(taskElement => {
        taskElement.addEventListener('click', (event) => {
            const targetEl = event.target;
            targetEl.classList.add('targetEl');
            const existingInput = targetEl.querySelector('input');

            taskElements.forEach(otherTask => {
                const otherInput = otherTask.querySelector('input');
                if (otherInput && otherTask !== targetEl) {
                    otherInput.remove();
                    otherTask.classList.remove('targetEl');
                }
            });

            if (!existingInput) {
                const formEl = document.createElement('form');
                const taskInputEl = document.createElement('input');
                taskInputEl.classList.add('taskInputEl');
                taskInputEl.placeholder = "Create task list";
                formEl.appendChild(taskInputEl);
                targetEl.appendChild(formEl);
                
                formEl.addEventListener('submit', function (evt) {
                    evt.preventDefault();
                
                    const containerEl = document.createElement('ul');
                    const liEl = document.createElement('li');
                    liEl.setAttribute = ""
                    containerEl.appendChild(liEl);
                    targetEl.appendChild(containerEl);
                    liEl.textContent = taskInputEl.value;
                
                    const newTask = {
                        parentId: targetEl.getAttribute('data-id'),
                        text: taskInputEl.value
                    };
                
                    const parentTodo = todos.find(todo => todo.id === newTask.parentId);
                
                    if (!parentTodo.children) {
                        parentTodo.children = [];
                    }

                    const existingChild = parentTodo.children.find(child => child.text === newTask.text);
                
                    if (!existingChild) {
                        parentTodo.children.push({
                            text: newTask.text,
                            children: []
                        });
            
                        savetoLocalStorage(todos);
                        loadTodosFromLocalStorage();
                    }
                
                    taskInputEl.value = '';
                    taskInputEl.focus();
                
                    showTodo();
                });                                                                  

                taskInputEl.focus();
            } else {
                existingInput.focus();
            }
        });
    });

    taskElements.forEach(taskElement => {
        taskElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();

            const parentId = taskElement.getAttribute('data-id');
            const newTodos = todos.filter(todo => todo.parentId !== parentId);
            savetoLocalStorage(newTodos);
            showTodo();
        });
    });
}

showTaskItems();

function addTodo() {
    const text = input.value.trim();
    if (text === '') {
        displayMessage(messages('Input is required!'));
        return;
    }

    const taskExists = todos.some(todo => todo.text === text);
    const inputTaskExists = todos.filter(todo => todo.text === text);
    if (taskExists && inputTaskExists) {
        displayMessage(messages('Task already exists!'));
        return;
    }

    const todoId = `todo_${todos.length}`;
    todos.push({
        id: todoId,
        text,
        isEditing: false,
    });

    console.log(todoId)

    const li = document.createElement('li');
    li.textContent = text;
    li.classList.add('itemTask');

    const editItem = document.createElement('p');
    editItem.textContent = '✎';
    editItem.classList.add('edit');
    li.appendChild(editItem);

    const span = document.createElement('span');
    span.textContent = '\u00d7';
    span.classList.add('spanCloseButton');
    li.appendChild(span);

    li.setAttribute('data-id', todoId);

    todoItem.appendChild(li);

    displayMessage(messages('New Todo Added.'));
    input.value = '';
    savetoLocalStorage();
}

function editTodoItem(itemToEdit) {
    const liEl = itemToEdit.parentElement;
    const todoId = liEl.getAttribute('data-id');
    const editTodo = todos.find(todo => todo.id === todoId);
    const taskElement = liEl.childNodes[0];
    console.log(taskElement)
    const inputElement = document.createElement('input');
    inputElement.value = taskElement.textContent;
    inputElement.classList.add('editing-input')
    liEl.replaceChild(inputElement, taskElement);
    inputElement.focus();

    let isEditing = true;

    inputElement.addEventListener('blur', function() {
        if (isEditing) {
            taskElement.textContent = inputElement.value;
        }
    });

    inputElement.addEventListener('keyup', function(event) {
        if (event.key === "Enter") {
            isEditing = true;

            if (isEditing) {
                const editedTask = inputElement.value;

                if(isDuplicateTask(editedTask)) {
                    displayMessage(messages('Task already exists!'));
                    return;
                }

                taskElement.textContent = inputElement.value;
                displayMessage(messages('Edit success.'));
                editTodo.text = editedTask;
            }

            liEl.replaceChild(taskElement, inputElement);
            savetoLocalStorage();
            showTodo();
        }
    });
}

function isDuplicateTask(editedTask) {
    return todos.some(todo => todo.text === editedTask);
}


function displayMessage(msg, timeout = 3000) {
    message.textContent = msg;
    message.classList.add('success-msg');
    clearTimeout(timeout);
    setTimeout(() => {
        message.textContent = '';
    }, timeout);
}