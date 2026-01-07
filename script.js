// --- ФУНКЦИИ СОХРАНЕНИЯ И ЗАГРУЗКИ ---

// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand(); // Расширяем на весь экран

// --- ФУНКЦИИ СОХРАНЕНИЯ И ЗАГРУЗКИ ЧЕРЕЗ ОБЛАКО ---

function saveToLocalStorage() {
  const data = [];
  const cells = document.querySelectorAll('.cell');
  
  cells.forEach(cell => {
    const cellIndex = cell.getAttribute('data-cell');
    const tasks = [];
    cell.querySelectorAll('li').forEach(li => {
      tasks.push({
        text: li.querySelector('span').textContent.trim(),
        checked: li.querySelector('input').checked
      });
    });
    data.push({ cellIndex, tasks });
  });

  // Сохраняем в облако Telegram (ключ 'tasks', значение должно быть строкой)
  const jsonData = JSON.stringify(data);
  
  if (tg.CloudStorage) {
    tg.CloudStorage.setItem('tasks', jsonData, (err, success) => {
      if (err) console.error("Ошибка сохранения в облако:", err);
    });
  }
}

function loadFromLocalStorage() {
  if (tg.CloudStorage) {
    tg.CloudStorage.getItem('tasks', (err, value) => {
      if (err) {
        console.error("Ошибка загрузки из облака:", err);
        return;
      }
      if (value) {
        const data = JSON.parse(value);
        // Очищаем текущие списки перед загрузкой, чтобы не дублировать
        document.querySelectorAll('.cell ul').forEach(ul => ul.innerHTML = '');
        
        data.forEach(item => {
          item.tasks.forEach(task => {
            renderTask(item.cellIndex, task.text, task.checked);
          });
        });
      }
    });
  }
}
// --- ЛОГИКА СОЗДАНИЯ ЭЛЕМЕНТОВ ---

// Вспомогательная функция для отрисовки (используется и при добавлении, и при загрузке)
function renderTask(cellIndex, text, isChecked = false) {
  const cell = document.querySelector(`.cell[data-cell="${cellIndex}"] ul`);
  const li = document.createElement("li");
  
  li.draggable = true;
  
  li.addEventListener('dragstart', () => li.classList.add('dragging'));
  li.addEventListener('dragend', () => {
    li.classList.remove('dragging');
    saveToLocalStorage(); // Сохраняем порядок после перетаскивания
  });

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = isChecked;

  const label = document.createElement("span");
  label.textContent = " " + text;

  // Стилизация в зависимости от статуса
  const applyStyles = (checked) => {
    if (checked) {
      label.style.textDecoration = "line-through";
      label.style.color = "#818080";
    } else {
      label.style.textDecoration = "none";
      label.style.color = "#000";
    }
  };

  applyStyles(isChecked);

  checkbox.onchange = () => {
    applyStyles(checkbox.checked);
    saveToLocalStorage(); // Сохраняем состояние галочки
  };

  li.appendChild(checkbox);
  li.appendChild(label);
  cell.appendChild(li);
}

// Основная функция добавления (через кнопку)
function addTask(cellIndex) {
  const text = prompt("Введите задачу:");
  if (!text) return;

  renderTask(cellIndex, text);
  saveToLocalStorage(); // Сохраняем новую задачу
}

// --- НАСТРОЙКА ЗОН DROP ---

const cells = document.querySelectorAll('.cell');

cells.forEach(cell => {
  const list = cell.querySelector('ul');

  cell.addEventListener('dragover', (e) => {
    e.preventDefault();
    cell.style.background = "#fff0f5";
  });

  cell.addEventListener('dragleave', () => {
    cell.style.background = "white";
  });

  cell.addEventListener('drop', () => {
    const draggingElement = document.querySelector('.dragging');
    if (draggingElement) {
      list.appendChild(draggingElement);
      saveToLocalStorage(); // Сохраняем факт перемещения в другую ячейку
    }
    cell.style.background = "white";
  });
});

// --- УДАЛЕНИЕ ---

function clearCompleted() {
  const completedTasks = document.querySelectorAll('li input:checked');

  if (completedTasks.length === 0) {
    alert("Нет выполненных задач для удаления.");
    return;
  }

  const confirmed = confirm(`Удалить выполненные задачи (${completedTasks.length} шт.)?`);

  if (confirmed) {
    completedTasks.forEach(checkbox => {
      checkbox.closest('li').remove();
    });
    saveToLocalStorage(); // Сохраняем список после очистки
  }
}

// ЗАПУСК: Загружаем данные при старте скрипта
loadFromLocalStorage();