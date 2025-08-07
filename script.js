let taskInput = document.getElementById('taskInput')
let addTaskBtn = document.getElementById('btn')
let paragraph = document.getElementById('paragraph')
let taskContainer = document.getElementById('taskContainer')

let editOverlay = document.getElementById('editOverlay')
let editInput = document.getElementById('editInput')
let saveBtn = document.getElementById('saveBtn')
let closeBtn = document.querySelector('.bx-x')

let taskBeingEdited = null;
let currentFilter = localStorage.getItem('filter') || 'all'; // Default filter is 'all'

taskInput.focus()
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (taskInput.value.trim() === '') {
            paragraph.innerText = 'Please enter a valid task'
            paragraph.style.color = 'red'
        } else {
            paragraph.innerText = ''
            addTask()
        }
    }
})

// DOMContentLoaded event to load tasks from localStorage
window.addEventListener('DOMContentLoaded', () => {
  let storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  storedTasks = storedTasks.filter(task => task && typeof task.id === 'number');
  localStorage.setItem('tasks', JSON.stringify(storedTasks));

  // 🔥 Highlight filter buttons correctly
  highlightActiveFilterButton();

  // 🔥 Listen to filter clicks
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.getAttribute('data-filter');
      localStorage.setItem('filter', currentFilter);

      highlightActiveFilterButton(); // ✅ Ensure visual update
      filterTasks();
    });
  });

  // 🔥 Load tasks based on current filter
  filterTasks();
});
function highlightActiveFilterButton() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const filter = btn.getAttribute('data-filter');
        // 🔥 Check if the button's filter matches the current filter
        if (filter === currentFilter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

addTaskBtn.addEventListener('click', () => {
    if (taskInput.value.trim() === '') {
        paragraph.innerText = 'Please enter a valid task'
        paragraph.style.color = 'red'
    } else {
        paragraph.innerText = ''
        addTask()
    }
})

function addTask() {
    // Create a new task object
    let task = {
        id : Date.now(),
        userText : taskInput.value,
        completed : false
    }

    let tasks = JSON.parse(localStorage.getItem('tasks')) || []
    if (!Array.isArray(tasks)) tasks = [];
    // Check if the task already exists
    tasks.push(task)
    localStorage.setItem('tasks', JSON.stringify(tasks))

    taskInput.value = ''
    filterTasks() // Refresh the task list to reflect changes
    checkCompletedStatus() // Check if there are completed tasks to enable/disable the clear completed button
}

function displayTasks(task) {
    let list = document.createElement('li')
    list.className = 'list-container'
    list.setAttribute('data-id', task.id)

    list.innerHTML = `
        <span class="task-text ${task.completed ? 'completed' : ''}">${task.userText}</span>
        <div class="btn-container">
            <i class="fa-solid fa-pen-to-square"></i>
            <i class="fa-solid fa-trash"></i>
        </div>
    `
    list.addEventListener('click', (event) => {
        if(event.target.classList.contains('fa-pen-to-square') || event.target.classList.contains('fa-trash')) {
            event.stopPropagation(); // Prevent the click from bubbling up to the list item
            return
        }

        let span = list.querySelector('.task-text')
        span.classList.toggle('completed')
        
        // Toggle the completed status in localStorage
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.map(t => {
            if (t.id === task.id) { // Find the task by ID
                t.completed = !t.completed; // Toggle the completed status
            }
            return t;
        })
        localStorage.setItem('tasks', JSON.stringify(tasks));
        checkCompletedStatus(); // Check if there are completed tasks to enable/disable the clear completed button
    })

    // Add event listeners for the delete and edit buttons
    list.querySelector('.fa-trash').addEventListener('click', () => {
        deleteTask(task.id)
    })

    list.querySelector('.fa-pen-to-square').addEventListener('click', () => {
        editOverlay.classList.add('show')
        taskBeingEdited = task.id
        editInput.focus()
        editInput.value = task.userText
    })

    list.style.opacity = '0';
    list.style.transform = 'translateY(-10px)';
    taskContainer.appendChild(list);

    setTimeout(() => {
       list.style.opacity = '1';
       list.style.transform = 'translateY(0)';
    }, 100);
}

closeBtn.addEventListener('click', () => {
    editOverlay.classList.remove('show')
})

editOverlay.addEventListener('click', (e) => {
    if (e.target === editOverlay) {
        editOverlay.classList.remove('show')
    }
})

saveBtn.addEventListener('click', () => {
    let updatedTaskText = editInput.value.trim();
    
    if (updatedTaskText === '') {
        document.getElementById('errorMsg').innerText = 'Please enter a valid task'
        document.getElementById('errorMsg').style.color = 'red'
        return;
    }
    document.getElementById('errorMsg').innerText = ''

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.map(task => {
        if (task && task.id === taskBeingEdited) {
            task.userText = updatedTaskText
        }
        return task
    })

    localStorage.setItem('tasks', JSON.stringify(tasks));
    document.querySelector(`[data-id='${taskBeingEdited}'] .task-text`).innerText = updatedTaskText
    editOverlay.classList.remove('show');
    editInput.value = '';
    taskBeingEdited = null;
    filterTasks(); // Refresh the task list to reflect changes
})

editInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        saveBtn.click();
    }
});

function deleteTask (id) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task !== null && task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    const list = document.querySelector(`[data-id='${id}']`)
    if (list) {
        list.style.opacity = '0'
        list.style.transform = 'translateX(50px)'
        list.style.transition = 'all 0.3s ease'
        setTimeout(() => {
            list.remove()
        }, 300);
    }
}

function filterTasks() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let filteredTasks = tasks.filter(task => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'completed') return task.completed;
        if (currentFilter === 'pending') return !task.completed;
    });

    taskContainer.style.opacity = '0'
    setTimeout(() => {
        taskContainer.innerHTML = ''; // Clear the current task list
        filteredTasks.forEach(task => displayTasks(task)); // Display filtered tasks
        taskContainer.style.opacity = '1'
        checkCompletedStatus(); // Check if there are completed tasks to enable/disable the clear completed button
    }, 200);
}

document.getElementById('clearAllBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all tasks?')) {
        localStorage.removeItem('tasks');
        taskContainer.innerHTML = ''; // Clear the task list
    }
})

document.getElementById('clearCompletedBtn').addEventListener('click', () => {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || []
    tasks = tasks.filter(task => task && !task.completed); // Keep only pending tasks
    localStorage.setItem('tasks', JSON.stringify(tasks));
    filterTasks(); // Refresh the task list to reflect changes
})

function checkCompletedStatus() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let hasCompletedTasks = tasks.some(task => task.completed);
    clearCompletedBtn.disabled = !hasCompletedTasks;
}

const canvas = document.getElementById('blobCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let blobs = [];

function createBlob() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 60 + Math.random() * 40,
    dx: Math.random() * 1.5 - 0.75,
    dy: Math.random() * 1.5 - 0.75,
    color: `hsla(${Math.random() * 360}, 70%, 70%, 0.25)`
  };
}

// Create multiple blobs
for (let i = 0; i < 6; i++) {
  blobs.push(createBlob());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  blobs.forEach(blob => {
    blob.x += blob.dx;
    blob.y += blob.dy;

    // Bounce off edges
    if (blob.x < 0 || blob.x > canvas.width) blob.dx *= -1;
    if (blob.y < 0 || blob.y > canvas.height) blob.dy *= -1;

    ctx.beginPath();
    ctx.fillStyle = blob.color;
    ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(animate);
}

animate();

// Resize canvas on window resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
