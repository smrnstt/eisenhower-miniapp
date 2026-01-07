// Функция для отрисовки задачи
function renderTask(cellIndex, text, isChecked = false) {
    const list = document.querySelector(`.cell[data-cell="${cellIndex}"] ul`);
    const li = document.createElement("li");
    li.draggable = true;

    // --- ОБРАБОТКА ТАЧ-СОБЫТИЙ ДЛЯ ТЕЛЕФОНОВ ---
    li.ontouchstart = (e) => {
        li.classList.add('dragging');
        // Запоминаем, какой элемент тащим
        window.draggingElement = li; 
    };

    li.ontouchend = (e) => {
        li.classList.remove('dragging');
        // Определяем, над каким элементом отпустили палец
        const touch = e.changedTouches[0];
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        const cell = targetElement ? targetElement.closest('.cell') : null;

        if (cell) {
            cell.querySelector('ul').appendChild(li);
            saveAllData();
        }
        window.draggingElement = null;
    };

    li.ontouchmove = (e) => {
        // Предотвращаем скролл страницы, когда тянем задачу
        e.preventDefault();
    };

    // --- СТАНДАРТНЫЙ DRAG & DROP (ДЛЯ ПК) ---
    li.addEventListener('dragstart', () => li.classList.add('dragging'));
    li.addEventListener('dragend', () => {
        li.classList.remove('dragging');
        saveAllData();
    });

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isChecked;

    const label = document.createElement("span");
    label.textContent = " " + text;

    const applyStyles = (checked) => {
        label.style.textDecoration = checked ? "line-through" : "none";
        label.style.color = checked ? "#818080" : "#000";
    };
    applyStyles(isChecked);

    checkbox.onchange = () => {
        applyStyles(checkbox.checked);
        saveAllData();
    };

    li.appendChild(checkbox);
    li.appendChild(label);
    list.appendChild(li);
}

// Добавление новой задачи
function addTask(cellIndex) {
    const text = prompt("Введите задачу:");
    if (!text) return;
    renderTask(cellIndex, text);
    saveAllData();
}

// Сохранение
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

// Загрузка
function loadAllData() {
    const saved = localStorage.getItem('myTasks');
    if (!saved) return;
    const data = JSON.parse(saved);
    data.forEach(item => {
        item.tasks.forEach(task => renderTask(item.cellIndex, task.text, task.checked));
    });
}

// Удаление выполненных
function clearCompleted() {
    const completed = document.querySelectorAll('li input:checked');
    if (completed.length === 0) return;
    if (confirm("Удалить выполненные?")) {
        completed.forEach(el => el.closest('li').remove());
        saveAllData();
    }
}

// Настройка зон для ПК
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

loadAllData();