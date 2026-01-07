let ghostElement = null;

// Функция для создания элемента задачи (используется и при загрузке, и при добавлении)
function renderTask(cellIndex, text, isChecked = false) {
    const list = document.querySelector(`.cell[data-cell="${cellIndex}"] ul`);
    if (!list) return;

    const li = document.createElement("li");
    li.draggable = true;

    // --- МОБИЛЬНОЕ ПЕРЕМЕЩЕНИЕ (TOUCH) ---
    li.ontouchstart = (e) => {
        // Если нажали на чекбокс, не запускаем перетаскивание
        if (e.target.tagName === 'INPUT') return;

        const touch = e.touches[0];
        li.classList.add('dragging');
        
        // Создаем "призрак"
        ghostElement = li.cloneNode(true);
        ghostElement.classList.add('ghost');
        document.body.appendChild(ghostElement);
        
        moveGhost(touch.pageX, touch.pageY);
    };

    li.ontouchmove = (e) => {
        if (!ghostElement) return;
        const touch = e.touches[0];
        moveGhost(touch.pageX, touch.pageY);
        e.preventDefault(); // Важно: отключает скролл страницы при таске
    }, { passive: false };

    li.ontouchend = (e) => {
        if (!ghostElement) return;
        
        li.classList.remove('dragging');
        const touch = e.changedTouches[0];
        ghostElement.remove();
        ghostElement = null;

        // Находим ячейку под пальцем
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const cell = target ? target.closest('.cell') : null;

        if (cell) {
            cell.querySelector('ul').appendChild(li);
            saveAllData();
        }
    };

    // --- ОБЫЧНЫЙ DRAG & DROP (ПК) ---
    li.addEventListener('dragstart', () => li.classList.add('dragging'));
    li.addEventListener('dragend', () => {
        li.classList.remove('dragging');
        saveAllData();
    });

    // Контент задачи
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isChecked;

    const label = document.createElement("span");
    label.textContent = " " + text;

    const applyStyles = (c) => {
        label.style.textDecoration = c ? "line-through" : "none";
        label.style.color = c ? "#818080" : "#000";
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

// Функция перемещения призрака
function moveGhost(x, y) {
    if (ghostElement) {
        ghostElement.style.left = (x - ghostElement.offsetWidth / 2) + 'px';
        ghostElement.style.top = (y - ghostElement.offsetHeight / 2) + 'px';
    }
}

// Добавление новой задачи (Кнопка ПЛЮС)
function addTask(cellIndex) {
    const text = prompt("Введите задачу:");
    if (text && text.trim() !== "") {
        renderTask(cellIndex, text.trim());
        saveAllData();
    }
}

// Сохранение в память
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
    try {
        const data = JSON.parse(saved);
        data.forEach(item => {
            item.tasks.forEach(task => renderTask(item.cellIndex, task.text, task.checked));
        });
    } catch(e) { console.error("Ошибка загрузки", e); }
}

// Удаление выполненных
function clearCompleted() {
    const completed = document.querySelectorAll('li input:checked');
    if (completed.length === 0) return;
    if (confirm("Удалить выполненные задачи?")) {
        completed.forEach(el => el.closest('li').remove());
        saveAllData();
    }
}

// Настройка зон для ПК (Drag & Drop)
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('dragover', (e) => e.preventDefault());
    cell.addEventListener('drop', (e) => {
        const dragging = document.querySelector('.dragging');
        if (dragging) {
            cell.querySelector('ul').appendChild(dragging);
            saveAllData();
        }
    });
});

// Запуск при старте
window.onload = loadAllData;