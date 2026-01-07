let ghostElement = null; // Клон задачи, который будет летать

function renderTask(cellIndex, text, isChecked = false) {
    const list = document.querySelector(`.cell[data-cell="${cellIndex}"] ul`);
    const li = document.createElement("li");
    li.draggable = true;

    // --- МОБИЛЬНОЕ ПЕРЕМЕЩЕНИЕ (TOUCH) ---
    li.ontouchstart = (e) => {
        const touch = e.touches[0];
        li.classList.add('dragging');
        
        // Создаем "призрак" элемента для визуального полета
        ghostElement = li.cloneNode(true);
        ghostElement.classList.add('ghost');
        document.body.appendChild(ghostElement);
        
        moveGhost(touch.pageX, touch.pageY);
    };

    li.ontouchmove = (e) => {
        const touch = e.touches[0];
        moveGhost(touch.pageX, touch.pageY);
        e.preventDefault(); // Запрещаем скролл страницы
    };

    li.ontouchend = (e) => {
        if (ghostElement) {
            ghostElement.remove();
            ghostElement = null;
        }
        li.classList.remove('dragging');

        const touch = e.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const cell = target ? target.closest('.cell') : null;

        if (cell) {
            const newList = cell.querySelector('ul');
            newList.appendChild(li); // Переносим в новую ячейку
            saveAllData();
        }
    };

    // --- СТАНДАРТНЫЙ DRAG & DROP (ПК) ---
    li.addEventListener('dragstart', () => li.classList.add('dragging'));
    li.addEventListener('dragend', () => {
        li.classList.remove('dragging');
        saveAllData();
    });

    // Отрисовка внутренностей li
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

    checkbox.onchange = () => { applyStyles(checkbox.checked); saveAllData(); };

    li.appendChild(checkbox);
    li.appendChild(label);
    list.appendChild(li);
}

// Вспомогательная функция для движения "призрака"
function moveGhost(x, y) {
    if (ghostElement) {
        ghostElement.style.left = x - (ghostElement.offsetWidth / 2) + 'px';
        ghostElement.style.top = y - (ghostElement.offsetHeight / 2) + 'px';
    }
}

// Остальные функции (addTask, saveAllData, loadAllData, clearCompleted) 
// оставь без изменений, как в прошлом шаге.
// ... (код функций addTask, saveAllData и т.д.) ...

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