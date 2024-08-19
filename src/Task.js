import checkImg from './assets/images/check.png';
import editImg from './assets/images/edit.png';
import trashImg from './assets/images/trash.png';
import { notify } from './observer.js';

/**
 * Gerencia as Tasks a nível de UI
 * Notifica o controlador sobre interações com o usuário
 */
class Task {
  constructor(id, title, date, details='', priority=0, check=0) {
    this.id = id;
    this.title = title;
    this.date = date;
    this.details = details;
    this.priority = priority;
    this.check = check;
  }

  createElement(tag, className, content = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.innerHTML = content;
    return element;
  }

  createImageButton(className, src) {
    const button = this.createElement('button', className);
    const img = this.createElement('img');
    img.src = src;
    button.appendChild(img);
    return button;
  }

  render() {

    const li = document.createElement('li');

    const taskDiv = this.createElement('div', 'task');
    taskDiv.id = this.id;

    const prioritySign = this.createElement('div', 'priority-sign');
    if (this.check != 1) {
      switch(this.priority) {
        case (0): 
          prioritySign.style.backgroundColor = 'hsl(120, 61%, 50%, 100%)'; 
          break; 
        case (1): 
            prioritySign.style.backgroundColor = 'rgba(255, 166, 0, 0.9)';
          break;
        case (2):
          prioritySign.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
          break;
        default: 
          break;
      }
    }
    taskDiv.appendChild(prioritySign);

    const checkboxBtn = this.createImageButton('checkbox-btn', checkImg);
    if (this.check == 1) checkboxBtn.style.backgroundColor = 'limegreen';
    checkboxBtn.addEventListener('click', () => {
      notify('taskCheck', { id: this.id, title: this.title });
      if (this.check == 1) {
        this.check = 0;
        switch(this.priority) {
          case (0): 
            prioritySign.style.backgroundColor = 'hsl(120, 61%, 50%, 100%)'; 
            break; 
          case (1): 
              prioritySign.style.backgroundColor = 'rgba(255, 166, 0, 0.9)';
            break;
          case (2):
            prioritySign.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
            break;
          default: 
            break;
        }
        taskTitle.style.textDecoration = 'none';
        checkboxBtn.style.backgroundColor = 'transparent';

      } else {
        this.check = 1;
        taskTitle.style.textDecoration = 'line-through';
        prioritySign.style.backgroundColor = 'grey'; 
        checkboxBtn.style.backgroundColor = 'limegreen';
      }
    }); 
    taskDiv.appendChild(checkboxBtn);

    const taskTitle = this.createElement('p', 'task-title', this.title);
    if (this.check == 1) taskTitle.style.textDecoration = 'line-through';
    taskDiv.appendChild(taskTitle);

    const detailsBtn = this.createElement('button', 'details-btn', '<p>Details</p>');
    detailsBtn.addEventListener('click', () => {
      notify('taskDetails', { id: this.id, title: this.title });
    }); 
    taskDiv.appendChild(detailsBtn);

    const taskDate = this.createElement('p', 'task-date', this.date);
    taskDiv.appendChild(taskDate);

    const editBtn = this.createImageButton('edit-btn', editImg);
    editBtn.addEventListener('click', () => {
      notify('taskEditor', { id: this.id, title: this.title });
    });
    taskDiv.appendChild(editBtn);

    const deleteBtn = this.createImageButton('delete-btn', trashImg);
    // Delete Logic
    deleteBtn.addEventListener('click', () => {
      // Removes from UI
      li.remove();
      // Notifica observadores sobre a exclusão da tarefa
      notify('taskDeleted', { id: this.id, title: this.title });
    });
    // <--
    taskDiv.appendChild(deleteBtn);

    li.appendChild(taskDiv);

    return li;
  }
}

export { Task }; 
