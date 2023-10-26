const input = document.querySelector('.input');
const button = document.querySelector('.button');
const message = document.querySelector('.message');
const todoItem = document.querySelector('.todoItem');

button.addEventListener('click', addTodo);

input.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        addTodo();
    }
});

todoItem.addEventListener('click', function(event) {
    const target = event.target;
    if (target.classList.contains('itemTask')) {
        target.classList.toggle("checked");
        savetoLocalStorage();
    } else if (target.classList.contains('spanCloseButton')) {
        target.parentElement.remove();
        message.textContent = messages("Success delete.");
        setTimeout(() => {
            message.textContent = messages("");
        }, 3000);

        savetoLocalStorage();
    } else if (target.classList.contains('edit')) {
        const taskElement = target.previousElementSibling;
        const originalText = taskElement.textContent;
        const inputElement = document.createElement('input');
        inputElement.value = originalText;
        taskElement.innerHTML = '';
        taskElement.appendChild(inputElement);
        inputElement.focus();

        console.log(taskElement)

        inputElement.addEventListener('blur', function() {
            taskElement.innerHTML = inputElement.value;
            savetoLocalStorage();
        });

        inputElement.addEventListener('keyup', function(event) {
            if (event.key === "Enter") {
                taskElement.innerHTML = inputElement.value;
                savetoLocalStorage();
            }
        });
    }
}, false);

function messages(msg) {
    return `${msg}`;
}

function savetoLocalStorage() {
    localStorage.setItem("data", todoItem.innerHTML);
}

function showTaskItems() {
    todoItem.innerHTML =  localStorage.getItem("data");
}

showTaskItems();

function addTodo() {
    if (input.value === '') {
        message.textContent = messages("Input is required!");
        return;
    }

    let li = document.createElement('li');
    li.textContent = input.value;
    li.classList.add('itemTask');
    todoItem.appendChild(li);

    let editItem = document.createElement('p');
    editItem.textContent = '✎';
    editItem.classList.add('edit');
    li.appendChild(editItem);

    let span = document.createElement('span');
    span.textContent = '\u00d7';
    span.classList.add('spanCloseButton');
    li.appendChild(span);

    message.textContent = messages("New Todo Added.");
    message.classList.add('success-msg');

    setTimeout(() => {
        message.textContent = '';
    }, 3000);

    input.value = '';
    savetoLocalStorage();
}
