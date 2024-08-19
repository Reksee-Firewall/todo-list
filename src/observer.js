// Padrão de design Observer (ou Publisher-Subscriber)
const observers = {
  taskDeleted: [],
  taskEditor: [],
  taskDetails: [],
  taskCheck: [],
};

export function subscribe(event, callback) {
  if (observers[event]) {
    observers[event].push(callback);
  }
}

export function notify(event, data) {
  if (observers[event]) {
    observers[event].forEach(callback => callback(data));
  }
}
