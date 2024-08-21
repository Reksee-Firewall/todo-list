import "./styles.css";
import { Task } from './Task.js'; // Importe a classe Task
import addImg from './assets/images/plus.png';
import { subscribe } from './observer.js';
import flatpickr from 'flatpickr';
import { format } from 'date-fns';

// Variáveis globais
let uniqueTaskId = loadFromLocalStorage('uniqueTaskId') || 4;
let uniqueProjectId = loadFromLocalStorage('uniqueProjectId') || 1;
let onEdit = -1;
let isAdd = 0;
let projects = loadFromLocalStorage('projects') || [
  { id: 0, name: 'Default' },
];

let inboxItems = loadFromLocalStorage('inboxItems') || [
  { id: 0, title: 'Wake up Early', details:'', date: '01/01/2024', priority: 0, check: 0, project_id: 0},
  { id: 1, title: 'Meeting with Team', details:'', date: '01/01/2024', priority: 1, check: 0, project_id: 0},
  { id: 2, title: 'Grocery Shopping', details:'', date: '01/01/2024', priority: 2, check: 0, project_id: 0},
  { id: 3, title: 'Dentist Appointment', details:'', date: '01/01/2024', priority: 0, check: 1, project_id: 0},
];

let todayItems = [];
let weekItems = [];
let selectedButton;

// Função para carregar dados do localStorage
function loadFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// Função para salvar dados no localStorage
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Salva inboxItems e projects no localStorage sempre que houver uma mudança
function updateLocalStorage() {
  saveToLocalStorage('inboxItems', inboxItems);
  saveToLocalStorage('projects', projects);
  saveToLocalStorage('uniqueTaskId', uniqueTaskId);
  saveToLocalStorage('uniqueProjectId', uniqueProjectId);
}

// Função para inscrição em observador taskDeleted
subscribe('taskDeleted', (data) => {
  console.log(`Task deleted: ${data.title} (ID: ${data.id})`);
  const dataId = parseInt((String (data.id).split('-'))[1]);
  inboxItems = inboxItems.filter(item => item.id !== dataId);
  updateLocalStorage(); 
});

// Função para inscrição em observador taskEditor
subscribe('taskEditor', (data) => {
  console.log(`Should open text editor on ${data.title} (ID: ${data.id})...`);
  const dataId = parseInt((String (data.id).split('-'))[1]);
  openModal({mode: 1, id: dataId});
});

// Função para inscrição em observador taskDetails
subscribe('taskDetails', (data) => {
  console.log(`Should open text details on ${data.title} (ID: ${data.id})...`);
  const dataId = parseInt((String (data.id).split('-'))[1]);
  openModal({mode: 2, id: dataId});
});

// Função para inscrição em observador taskCheck
subscribe('taskCheck', (data) => {
  console.log(`Should alter check state on ${data.title} (ID: ${data.id})...`);
  const dataId = parseInt((String (data.id).split('-'))[1]);
  const task = inboxItems.find(item => item.id == dataId);
  if (task.check == 0) {
    task.check = 1;
  } else {
    task.check = 0;
  }
  updateLocalStorage();
});

// Função para alternar o botão de prioridade selecionado
function togglePriorityButtonSelection(buttonId) {
  const buttons = document.querySelectorAll('#task-priority-list button');
  buttons.forEach(button => button.classList.remove('selected'));
  if (buttonId!='') {
    const selectedButton = document.getElementById(buttonId);
    selectedButton.classList.add('selected');
  }
}

// Draw stored projects
(() => {
  projects.forEach((p) => {
    if (p.id != 0) {
      drawNewProject(p);
      document.querySelector(`#project-${p.id}-btn .close-btn`).addEventListener('click', function() {
        projects = projects.filter(item => item.id != p.id);
        inboxItems.forEach((item) => {
          if (item.project_id == p.id) {
            item.project_id = 0;
          }
        });
        const li = document.getElementById(`project-${p.id}`); 
        li.remove();
        updateLocalStorage();
      });
      setupButton(`project-${p.id}-btn`, `${p.name}`, []);
    }
  })
})();

/**
 * 0 = add
 * 1 = edit
 * 2 = view
 */
function openModal({mode=0, id=0}) {
  const modal = document.getElementById('task-modal');
  let task, modalTitle, taskTitle, taskDate, taskDetails, saveBtn, buttonId='task-low';
  task = inboxItems.find(item => item.id == id);
  togglePriorityButtonSelection(buttonId);
  const pButtons = document.querySelectorAll('#task-priority-list button'); 
  
  // Inicializa Dropdown
  const dropItemSelect = document.getElementById('item-select');
  projects.forEach(p => {
    if (p.name != 'Default') {
      const op = document.createElement('option'); 
      op.value = p.id;
      op.innerText = p.name;
      dropItemSelect.appendChild(op);
    }
  });

  // Obtém seleção correta: 
    // Remove selected de Default 
    // Adiciona selected que está guardado
  const options = document.querySelectorAll('#item-select option');

  const curProject = Array.from(options).find(option => option.hasAttribute('selected'));
  if (curProject) curProject.removeAttribute('selected');

  // Adiciona selected que está guardado
  const projectOfChoice = Array.from(options).find((option) => option.value == `${task.project_id}`);
  projectOfChoice.setAttribute('selected', true);

  // Inicializa o flatpickr no input de data
  flatpickr("#task-date", {
    enableTime: false,
    defaultDate: new Date(),
    dateFormat: "d/m/Y",
  });
  
  switch(mode) {
    case 0:
      isAdd = 1;
      break;
    case 1:
      if (task.priority == 0) {
        buttonId = 'task-low';
      } else if (task.priority == 1) {
        buttonId = 'task-medium';
      } else if (task.priority == 2) {
        buttonId = 'task-high';
      }
      togglePriorityButtonSelection(buttonId);
      onEdit = id;
      if (task == null) break;
      modalTitle = document.getElementById('modal-title');
      modalTitle.innerText = 'Edit';
      taskTitle = document.getElementById('task-title');
      taskTitle.value = task.title;
      taskDate = document.getElementById('task-date');
      taskDate.value = task.date;
      taskDetails = document.getElementById('task-details');
      taskDetails.value = task.details;
      saveBtn = document.getElementById('save-task-btn');
      saveBtn.innerText = 'Edit Task';
      break;
    case 2:
      if (task.priority == 0) {
        buttonId = 'task-low';
      } else if (task.priority == 1) {
        buttonId = 'task-medium';
      } else if (task.priority == 2) {
        buttonId = 'task-high';
      }
      togglePriorityButtonSelection(buttonId);
      pButtons.forEach((button) => {
        button.setAttribute('disabled', true);
      });
      if (task == null) break;
      modalTitle = document.getElementById('modal-title');
      modalTitle.innerText = 'Details';
      taskTitle = document.getElementById('task-title');
      taskTitle.value = task.title;
      taskTitle.setAttribute('disabled', true);
      taskDate = document.getElementById('task-date');
      taskDate.value = task.date;
      taskDate.setAttribute('disabled', true);
      taskDetails = document.getElementById('task-details');
      taskDetails.value = task.details;
      taskDetails.setAttribute('disabled', true);
      dropItemSelect.setAttribute('disabled', true);
      saveBtn = document.getElementById('save-task-btn');
      saveBtn.innerText = 'Close Task';
      break;
    default:
      break;
  }
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center'; 
}

// Função para fechar o modal
function closeModal() {
  const pButtons = document.querySelectorAll('#task-priority-list button'); 
  const modal = document.getElementById('task-modal');
  modal.style.display = 'none';
  pButtons.forEach((button) => {
    button.removeAttribute('disabled');
  });

  const dropItemSelect = document.getElementById('item-select');
  projects.forEach(p => {
    if (p.id != '0') {
      dropItemSelect.removeChild(dropItemSelect.lastElementChild);
    }
  });
  
  dropItemSelect.removeAttribute('disabled');

  // Revert Mode=0
  isAdd = 0;
  // Revert Mode=1 
  onEdit = -1;
  // Revert Mode=2
  const modalTitle = document.getElementById('modal-title');
  modalTitle.innerText = 'Add Task';
  const taskTitle = document.getElementById('task-title');
  taskTitle.value = '';
  taskTitle.removeAttribute('disabled');
  const taskDate = document.getElementById('task-date');
  taskDate.value = '';
  taskDate.removeAttribute('disabled');
  const taskDetails = document.getElementById('task-details');
  taskDetails.value = '';
  taskDetails.removeAttribute('disabled');
  // Save btn
  const saveBtn = document.getElementById('save-task-btn');
  saveBtn.innerText = 'Save Task';
  // <--
}

// Função para alterar o conteúdo do right-panel
function changeContent(title, items) {
  const rightPanel = document.getElementById('right-panel');
  rightPanel.innerHTML = `
    <h2>${title}</h2>
  `;

  const ul = document.createElement('ul');
  let li = document.createElement('li');

  const divTask = document.createElement('div');
  divTask.classList.add("task");

  const addButton = document.createElement('button');
  addButton.classList.add("add");
  addButton.innerHTML = `
    <img src=${addImg}>
    <p>Add Task</p>
  `;

  divTask.appendChild(addButton);

  li.appendChild(divTask);
  ul.appendChild(li);

  // Atualizar para receber o ProjectId correto
  // Função para criar e adicionar uma nova task
  function addNewTask(title, date, details, taskPriority, selectedProjectValue) {
    uniqueTaskId += 1;
    const newTask = new Task(`task-${uniqueTaskId}`, title, date, details, taskPriority, selectedProjectValue);
    const li = document.createElement('li');
    li.appendChild(newTask.render());
    ul.appendChild(li);
    // Externo
    inboxItems.push({ id: uniqueTaskId, title: title, date: date, details: details, priority: taskPriority, check: 0, project_id: selectedProjectValue});
    // <--
    // items.push({ title, date }); 
  }

  // Adicionando eventos aos botões do modal
  addButton.addEventListener('click', openModal);
  const closeBtn = document.querySelector('#modal-close-btn');
  closeBtn.addEventListener('click', closeModal);
  const saveBtn = document.getElementById('save-task-btn');

  // Adicionando eventos aos botões de prioridade
  const setupPriorityButtons = (() => {
    const buttons = document.querySelectorAll('#task-priority-list button');
    buttons.forEach((button) => {
      document.getElementById(button.id).addEventListener('click', () => {
        console.log(`Should toggle to ${button.id}`);
        togglePriorityButtonSelection(button.id);
      });
    });
  })();
  // <--

  function updateContent(buttonId, title, items) {
    console.log(buttonId);
    if (buttonId == 'today-btn') {
      items = inboxItems.filter(item => (item.date == `${format(new Date(), 'dd/MM/yyyy')}`)); 
      title = 'Today';
    }
    
    if (buttonId == 'week-btn') { 
      title = 'This Week';
      items = inboxItems.filter(item => (isCurrentWeek(item.date)));
      items.sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('/').map(Number);
        const [dayB, monthB, yearB] = b.date.split('/').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateA - dateB;
      });
    };
    projects.forEach(p => {
      if (buttonId == `project-${p.id}-btn`) {
        title = p.name;
        items = inboxItems.filter(item => item.project_id == p.id);
      }
    });
    changeContent(title, items);
  }

  // Add New Meal
  saveBtn.addEventListener('click', () => {
    // const dropdownOptions = document.querySelectorAll('#item-select option');
    // const selectedProjectValue = Array.from(dropdownOptions).find((option) => option.hasAttribute('selected')).value;
    // Selected NÃO é atualizado automaticamente quando o usuário seleciona uma nova opção no dropdown. Prefere-se:
    const selectedProjectValue = document.getElementById('item-select').value;
    const taskTitle = document.getElementById('task-title').value;  
    const taskDate = document.getElementById('task-date').value;
    const taskDetails = document.getElementById('task-details').value;
    const taskPriorityQuery = document.querySelector('#task-priority-list button[class="selected"]');
    let taskPriority = -1;
    switch (taskPriorityQuery.id) {
      case 'task-low': 
        taskPriority = 0;
        break;
      case 'task-medium':
        taskPriority = 1;
        break;
      case 'task-high': 
        taskPriority = 2;
        break;
      default:
        break;
    }
    // Should add validation to taskTitle & taskDate
    if (taskTitle && taskDate) {
      if (onEdit != -1) { // Edit
        const taskQuery = inboxItems.find(item => item.id == onEdit);
        // Did it find something? 
        taskQuery.title = taskTitle;
        taskQuery.date = taskDate;
        taskQuery.details = taskDetails;
        taskQuery.priority = taskPriority;
        taskQuery.project_id = selectedProjectValue;
        updateContent(selectedButton.id, title, items);
        updateLocalStorage();
      }
      if (isAdd == 1) { // Add
        addNewTask(taskTitle, taskDate, taskDetails, taskPriority, selectedProjectValue);
        updateContent(selectedButton.id, title, items);
        updateLocalStorage();
      } // View   
      closeModal();
    }
  });

  items.forEach((item) => {
    const task = new Task(`task-${item.id}`, item.title, item.date, item.details, item.priority, item.check, item.project_id);
    ul.appendChild(task.render());
  });

  rightPanel.appendChild(ul);
}

// Função para alternar o botão selecionado
function toggleButtonSelection(buttonId) {
  const buttons = document.querySelectorAll('#left-panel button');
  buttons.forEach(button => button.classList.remove('selected'));
  
  selectedButton = document.getElementById(buttonId);
  selectedButton.classList.add('selected');
}

function isCurrentWeek(dateStr) {
  // Converte a data fornecida (formato dd/MM/yyyy) em um objeto Date
  const [day, month, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);

  // Obtém a data atual
  const now = new Date();

  // Define o início da semana (domingo) para a data atual
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Define o fim da semana (sábado) para a data atual
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Verifica se a data fornecida está dentro da semana atual
  return date >= startOfWeek && date <= endOfWeek;
}

// Adicionando eventos aos botões
function setupButton(buttonId, title, items) {
  const btn = document.getElementById(buttonId);
  btn.addEventListener('click', () => {
    if (document.getElementById(buttonId) || !document.getElementById(buttonId) && selectedButton.id == buttonId) {
      if (!document.getElementById(buttonId) && selectedButton.id == buttonId) {
        buttonId = 'inbox-btn';
        title = 'Inbox';
        items = inboxItems;
      }
      toggleButtonSelection(buttonId);
      if (buttonId == 'today-btn') items = inboxItems.filter(item => (item.date == `${format(new Date(), 'dd/MM/yyyy')}`));
      if (buttonId == 'week-btn') { 
        items = inboxItems.filter(item => (isCurrentWeek(item.date)));
        items.sort((a, b) => {
          const [dayA, monthA, yearA] = a.date.split('/').map(Number);
          const [dayB, monthB, yearB] = b.date.split('/').map(Number);
          const dateA = new Date(yearA, monthA - 1, dayA);
          const dateB = new Date(yearB, monthB - 1, dayB);
          return dateA - dateB;
        });
      };
      projects.forEach(p => {
        if (buttonId == `project-${p.id}-btn`) {
          items = inboxItems.filter(item => item.project_id == p.id);
        }
      });
      changeContent(title, items);
    }
  });
}

// Inicializa em Inbox
(() => {
  toggleButtonSelection('inbox-btn');
  changeContent('Inbox', inboxItems);
  const addBtn = document.getElementById("add-project-form");
  addBtn.style.display = 'none';
  addBtn.setAttribute('display', 'none');
})();

// Draw DOM new Project
function drawNewProject(newProjectItem) {
  const ul = document.getElementById('lower-buttons');
  const li = document.createElement('li'); 
  li.id = `project-${newProjectItem.id}`;
  li.classList.add('project');
  li.innerHTML =`
    <button id="project-${newProjectItem.id}-btn">
      <img src="./assets/images/checklist.png">
      <p>${newProjectItem.name}</p>
      <p class="close-btn">&times;</p>
    </button>
  `;
  ul.appendChild(li);
}
// Adiciona e remove a classe "clicked" no clique de add-project-btn
document.querySelector('#add-project-btn').addEventListener('click', function() {
  this.classList.add('clicked');
  toggleAddProject();
  setTimeout(() => {
      this.classList.remove('clicked');
  }, 500);
});
document.querySelector('#add-project-submit').addEventListener('click', function() {
  this.classList.add('clicked');
  setTimeout(() => {
      this.classList.remove('clicked');
  }, 500);
  const inputValue = document.getElementById("add-project-input").value; 
  // Submit Action
  // Salva em global projects
  // Atualiza o DOM
  if (inputValue) {
    projects.push({ id: uniqueProjectId, name: inputValue }); 
    const p = projects.find(item => item.id == uniqueProjectId);
    uniqueProjectId++; 
    drawNewProject(p);
    updateLocalStorage();
    document.querySelector(`#project-${p.id}-btn .close-btn`).addEventListener('click', function() {
      projects = projects.filter(item => item.id != p.id);
      inboxItems.forEach((item) => {
        if (item.project_id == p.id) {
          item.project_id = 0;
        }
      });
      const li = document.getElementById(`project-${p.id}`); 
      li.remove();
    });
    setupButton(`project-${p.id}-btn`, `${p.name}`, []);
  }
});
function toggleAddProject() {
  const addBtn = document.getElementById("add-project-form");
  if (!(addBtn.hasAttribute('display'))) {
    addBtn.style.display = 'none';
    addBtn.setAttribute('display', 'none');
  } else {
    addBtn.style.display = 'flex';
    addBtn.removeAttribute('display');
  }
}

// Objetos Task de Página
setupButton('inbox-btn', 'Inbox', inboxItems);

setupButton('today-btn', 'Today', todayItems);

setupButton('week-btn', 'This Week', weekItems);

projects.forEach(item => {
  setupButton(`project-${item.id}-btn`, `${item.name}`, []);
});

// setupButton('notes-btn', 'Notes', inboxItems);