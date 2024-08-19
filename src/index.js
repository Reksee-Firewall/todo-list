import "./styles.css";
import { Task } from './Task.js'; // Importe a classe Task
import addImg from './assets/images/plus.png';
import { subscribe } from './observer.js';
import flatpickr from 'flatpickr';
import { format } from 'date-fns';

// Variáveis globais
let uniqueId = 0;
let onEdit = -1;
let isAdd = 0;
let inboxItems = [
  { id: uniqueId++, title: 'Wake up Early', details:'', date: '01/01/2024', priority: 1, check: 0},
  { id: uniqueId++, title: 'Meeting with Team', details:'', date: '01/01/2024', priority: 0, check: 0},
  { id: uniqueId++, title: 'Grocery Shopping', details:'', date: '01/01/2024', priority: 2, check: 0},
  { id: uniqueId++, title: 'Dentist Appointment', details:'', date: '01/01/2024', priority: 0, check: 1}
];

// Função para inscrição em observador taskDeleted
subscribe('taskDeleted', (data) => {
  console.log(`Task deleted: ${data.title} (ID: ${data.id})`);
  const dataId = parseInt((String (data.id).split('-'))[1]);
  inboxItems = inboxItems.filter(item => item.id !== dataId);
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

  // Função para criar e adicionar uma nova task
  function addNewTask(title, date, details, taskPriority) {
    uniqueId += 1;
    const newTask = new Task(`task-${uniqueId}`, title, date, details, taskPriority);
    const li = document.createElement('li');
    li.appendChild(newTask.render());
    ul.appendChild(li);
    // Externo
    inboxItems.push({ id: uniqueId, title: title, date: date, details: details, priority: taskPriority, check: 0});
    // <--
    // items.push({ title, date }); 
  }

  // Adicionando eventos aos botões do modal
  addButton.addEventListener('click', openModal);
  const closeBtn = document.querySelector('.close-btn');
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

  // Add New Meal
  saveBtn.addEventListener('click', () => {
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
        changeContent(title, items);
      }
      if (isAdd == 1) { // Add
        addNewTask(taskTitle, taskDate, taskDetails, taskPriority);
      } // View   
      closeModal();
    }
  });

  items.forEach((item) => {
    const task = new Task(`task-${item.id}`, item.title, item.date, item.details, item.priority, item.check);
    ul.appendChild(task.render());
  });

  rightPanel.appendChild(ul);
}

// Função para alternar o botão selecionado
function toggleButtonSelection(buttonId) {
  const buttons = document.querySelectorAll('#left-panel button');
  buttons.forEach(button => button.classList.remove('selected'));
  
  const selectedButton = document.getElementById(buttonId);
  selectedButton.classList.add('selected');
}

// Adicionando eventos aos botões
function setupButton(buttonId, title, items) {
  document.getElementById(buttonId).addEventListener('click', () => {
    toggleButtonSelection(buttonId);
    changeContent(title, items);
  });
}

// Inicializa em Inbox
(() => {
  toggleButtonSelection('inbox-btn');
  changeContent('Inbox', inboxItems);
})();

// Objetos Task por página
setupButton('inbox-btn', 'Inbox', inboxItems);

setupButton('today-btn', 'Today', inboxItems);

setupButton('week-btn', 'This Week', inboxItems);

// setupButton('notes-btn', 'Notes', inboxItems);