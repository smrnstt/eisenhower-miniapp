let ghostElement = null;

// 1. Функция отрисовки задачи
function renderTask(cellIndex, text, isChecked = false) {
    const list = document.querySelector(`.cell[data-cell="${cellIndex}"] ul`);
    if (!list) return;

    const li = document.createElement("li");
    li.draggable = true;

    // --- ТАЧ-СОБЫТИЯ (ДЛЯ ТЕЛЕФОНА) ---
    li.ontouchstart = (e) => {
        // Если нажали на чекбокс, не мешаем ему работать
        if (e.target.tagName === 'INPUT') return;

        const touch = e.touches[0];
        li.classList.add('dragging');
        
        // Создаем "призрак" для полета
        ghostElement = li.cloneNode(true);
        ghostElement.classList.add('ghost');
        document.body.appendChild(ghostElement);
        
        moveGhost(touch.pageX, touch.pageY);
    };

    li.ontouchmove = (e) => {
        if (!ghostElement) return;
        const touch = e.touches[0];
        moveGhost(touch.pageX, touch.pageY);
        e.preventDefault(); // Запрещаем скролл при перетаскивании
    };

    li.ontouchend = (e) => {
        if (!ghostElement) return;
        
        li.classList.remove('dragging');
        const touch = e.changedTouches[0];
        ghostElement.remove();
        ghostElement = null;

        // Находим ячейку, над которой отпустили палец
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const cell = target ? target.closest('.cell') : null;

        if (cell) {
            cell.querySelector('ul').appendChild(li);
            saveAllData();
        }
    };

    // --- DRAG & DROP (ДЛЯ ПК) ---
    li.addEventListener('dragstart', () => li.classList.add('dragging'));
    li.addEventListener('dragend', () => {
        li.classList.remove('dragging');
        saveAllData();
    });

    // Создание внутренностей задачи
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

// 2. Вспомогательная функция движения призрака
function moveGhost(x, y) {
    if (ghostElement) {
        ghostElement.style.left = (x - ghostElement.offsetWidth / 2) + 'px';
        ghostElement.style.top = (y - ghostElement.offsetHeight / 2) + 'px';
    }
}

// 3. ДОБАВЛЕНИЕ ЗАДАЧИ (Кнопка +)
function addTask(cellIndex) {
    const text = prompt("Введите задачу:");
    if (text && text.trim() !== "") {
        renderTask(cellIndex, text.trim());
        saveAllData();
    }
}

// 4. СОХРАНЕНИЕ
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

// 5. ЗАГРУЗКА ПРИ СТАРТЕ
function loadAllData() {
    const saved = localStorage.getItem('myTasks');
    if (!saved) return;
    try {
        const data = JSON.parse(saved);
        data.forEach(item => {
            item.tasks.forEach(task => renderTask(item.cellIndex, task.text, task.checked));
        });
    } catch (e) {
        console.error("Ошибка загрузки данных", e);
    }
}

// 6. УДАЛЕНИЕ ВЫПОЛНЕННЫХ
function clearCompleted() {
    const completed = document.querySelectorAll('li input:checked');
    if (completed.length === 0) {
        alert("Нет выполненных задач");
        return;
    }
    if (confirm("Удалить выполненные?")) {
        completed.forEach(el => el.closest('li').remove());
        saveAllData();
    }
}

// 7. Настройка зон сброса для ПК
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

// Запускаем загрузку после того, как документ готов
window.onload = loadAllData;