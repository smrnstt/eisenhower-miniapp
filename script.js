// 1. Функция для отрисовки задачи (создает HTML-элемент)
function renderTask(cellIndex, text, isChecked = false) {
    const list = document.querySelector(`.cell[data-cell="${cellIndex}"] ul`);
    const li = document.createElement("li");
    li.draggable = true;

    li.addEventListener('dragstart', () => li.classList.add('dragging'));
    li.addEventListener('dragend', () => {
        li.classList.remove('dragging');
        saveAllData(); // Сохраняем после перетаскивания
    });

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isChecked;

    const label = document.createElement("span");
    label.textContent = " " + text;

    if (isChecked) {
        label.style.textDecoration = "line-through";
        label.style.color = "#818080";
    }

    checkbox.onchange = () => {
        if (checkbox.checked) {
            label.style.textDecoration = "line-through";
            label.style.color = "#818080";
        } else {
            label.style.textDecoration = "none";
            label.style.color = "#000";
        }
        saveAllData(); // Сохраняем при клике на чекбокс
    };

    li.appendChild(checkbox);
    li.appendChild(label);
    list.appendChild(li);
}

// 2. Функция добавления новой задачи
function addTask(cellIndex) {
    const text = prompt("Введите задачу:");
    if (!text) return;
    renderTask(cellIndex, text);
    saveAllData();
}

// 3. СОХРАНЕНИЕ: Собирает все задачи из всех списков и пишет в память
function saveAllData() {
    const allData = [];
    document.querySelectorAll('.cell').forEach(cell => {
        const cellIndex = cell.getAttribute('data-cell');
        const tasks = [];
        cell.querySelectorAll('li').forEach(li => {
            tasks.push({
                text: li.querySelector('span').textContent.trim(),
                checked: li.querySelector('input').checked
            });
        });
        allData.push({ cellIndex, tasks });
    });
    localStorage.setItem('myTasks', JSON.stringify(allData));
}

// 4. ЗАГРУЗКА: Достает задачи из памяти при открытии страницы
function loadAllData() {
    const saved = localStorage.getItem('myTasks');
    if (!saved) return;
    
    const data = JSON.parse(saved);
    data.forEach(item => {
        item.tasks.forEach(task => {
            renderTask(item.cellIndex, task.text, task.checked);
        });
    });
}

// 5. Очистка выполненных
function clearCompleted() {
    const completed = document.querySelectorAll('li input:checked');
    if (completed.length === 0) return;
    
    if (confirm("Удалить выполненные?")) {
        completed.forEach(el => el.closest('li').remove());
        saveAllData();
    }
}

// Настройка Drag & Drop зон
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('dragover', (e) => e.preventDefault());
    cell.addEventListener('drop', () => {
        const dragging = document.querySelector('.dragging');
        if (dragging) {
            cell.querySelector('ul').appendChild(dragging);
            saveAllData();
        }
    });
});

// ЗАПУСК ПРИ ЗАГРУЗКЕ
loadAllData();