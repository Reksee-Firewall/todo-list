// index.js
import "./styles.css";
import { greeting } from "./greeting.js";

// Função para alterar o conteúdo do right-panel
function changeContent(title, items) {
  const rightPanel = document.getElementById('right-panel');
  rightPanel.innerHTML = `
    <h2>${title}</h2>
    <ul>
      ${items.map(item => `<li>${item}</li>`).join('')}
    </ul>
    <button>
      <img src="./assets/images/plus.png">
      <p>Add Task</p>
    </button>
  `;
}

// Função para alternar o botão selecionado
function toggleButtonSelection(buttonId) {
  const buttons = document.querySelectorAll('#left-panel button');
  buttons.forEach(button => button.classList.remove('selected'));
  
  const selectedButton = document.getElementById(buttonId);
  selectedButton.classList.add('selected');
}

// Adicionando eventos aos botões
document.getElementById('inbox-btn').addEventListener('click', () => {
  toggleButtonSelection('inbox-btn');
  changeContent('Inbox', ['Item 1', 'Item 2', 'Item 3', 'Item 4']);
});

document.getElementById('today-btn').addEventListener('click', () => {
  toggleButtonSelection('today-btn');
  changeContent('Today', ['Task 1', 'Task 2']);
});

document.getElementById('week-btn').addEventListener('click', () => {
  toggleButtonSelection('week-btn');
  changeContent('This Week', ['Plan 1', 'Plan 2', 'Plan 3']);
});

document.getElementById('notes-btn').addEventListener('click', () => {
  toggleButtonSelection('notes-btn');
  changeContent('Notes', ['Note 1', 'Note 2', 'Note 3']);
});

console.log(greeting);
