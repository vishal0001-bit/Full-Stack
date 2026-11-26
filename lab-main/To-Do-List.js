function addTask() {

    let input = document.getElementById("taskInput");
    let task = input.value.trim();

    if (task === "") {
        alert("Please enter a task");
        return;
    }

    let li = document.createElement("li");

    // Checkbox
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    // Task text
    let span = document.createElement("span");
    span.innerText = task;
    span.className = "task-text";

    // Mark task completed
    checkbox.onchange = function() {
        span.classList.toggle("completed");
    };

    // Delete button
    let delBtn = document.createElement("button");
    delBtn.innerText = "Delete";
    delBtn.className = "delete";

    delBtn.onclick = function() {
        li.remove();
    };

    // Move Up button
    let upBtn = document.createElement("button");
    upBtn.innerText = "↑";
    upBtn.className = "move";

    upBtn.onclick = function() {
        let prev = li.previousElementSibling;

        if (prev) {
            li.parentNode.insertBefore(li, prev);
        }
    };

    // Move Down button
    let downBtn = document.createElement("button");
    downBtn.innerText = "↓";
    downBtn.className = "move";

    downBtn.onclick = function() {
        let next = li.nextElementSibling;

        if (next) {
            li.parentNode.insertBefore(next, li);
        }
    };

    // Add all elements to list
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(upBtn);
    li.appendChild(downBtn);
    li.appendChild(delBtn);

    document.getElementById("taskList").appendChild(li);

    input.value = "";
    input.focus();
}

document.getElementById("taskForm").addEventListener("submit", function(event) {
    event.preventDefault();
    addTask();
});

