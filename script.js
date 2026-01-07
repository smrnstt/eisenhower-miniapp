function addTask(cellIndex) {
  const text = prompt("Введите задачу:");
  if (!text) return;

  const cell = document.querySelector(`.cell[data-cell="${cellIndex}"] ul`);
  const li = document.createElement("li");
  
  // --- НАСТРОЙКИ DRAG AND DROP ---
  li.draggable = true; // Делаем элемент перетаскиваемым
  
  li.addEventListener('dragstart', (e) => {
    li.classList.add('dragging'); // Добавляем класс для эффекта прозрачности
  });

  li.addEventListener('dragend', () => {
    li.classList.remove('dragging'); // Убираем класс после переноса
  });
  // -------------------------------

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  const label = document.createElement("span");
  label.textContent = " " + text;

  checkbox.onchange = () => {
    if (checkbox.checked) {
      label.style.textDecoration = "line-through";
      label.style.color = "#818080";
    } else {
      label.style.textDecoration = "none";
      label.style.color = "#000";
    }
  };

  li.appendChild(checkbox);
  li.appendChild(label);
  cell.appendChild(li);
}

// Настройка зон, куда можно бросать задачи
const cells = document.querySelectorAll('.cell');

cells.forEach(cell => {
  const list = cell.querySelector('ul');

  cell.addEventListener('dragover', (e) => {
    e.preventDefault(); // Это обязательно, чтобы разрешить сброс (drop)
    cell.style.background = "#fff0f5"; // Подсвечиваем ячейку, над которой летит задача
  });

  cell.addEventListener('dragleave', () => {
    cell.style.background = "white"; // Убираем подсветку
  });

  cell.addEventListener('drop', () => {
    const draggingElement = document.querySelector('.dragging');
    list.appendChild(draggingElement); // Перемещаем элемент в новый список
    cell.style.background = "white";
  });
});

function clearCompleted() {
  // Находим все выполненные задачи (где чекбокс отмечен)
  const completedTasks = document.querySelectorAll('li input:checked');

  // Если выполненных задач нет, просто выходим
  if (completedTasks.length === 0) {
    alert("Нет выполненных задач для удаления.");
    return;
  }

  // Показываем окно подтверждения
  const confirmed = confirm(`Вы уверены, что хотите удалить выполненные задачи (${completedTasks.length} шт.)?`);

  if (confirmed) {
    completedTasks.forEach(checkbox => {
      // Находим родительский элемент <li> и удаляем его
      const li = checkbox.closest('li');
      li.remove();
    });
  }
}