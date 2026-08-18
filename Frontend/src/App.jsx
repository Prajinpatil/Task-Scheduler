import React, { useState, useEffect, useRef } from "react";
import "./App.css"; 

const initialTasks = [
  {
    id: "task-1",
    title: "Drink water",
    isCompleted: false,
    notificationTime: "09:30", 
    daysToRepeat: ["monday", "wednesday"], 
    alarmSound: "bell", 
    isSnoozeEnabled: true 
  },
  {
    id: "task-2",
    title: "Review algorithms",
    isCompleted: false,
    notificationTime: "18:00", 
    daysToRepeat: ["today"], 
    alarmSound: "chime", 
    isSnoozeEnabled: false 
  }
];

function App() {
  // --- STATE ---
  const [tasks, setTasks] = useState([]);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("12:00");
  const [filter, setFilter] = useState("all");
  
  // --- REFS ---
  const tasksRef = useRef(tasks);  
  const alertedTasks = useRef(new Set());

  // --- DERIVED STATE (Statistics) ---
  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const totalTasks = tasks.length;
  
  const displayedTasks = tasks.filter(task => {
    if (filter === "all") return true;
    if (filter === "active") return !task.isCompleted;
    if (filter === "completed") return task.isCompleted;
    return true;
  });

  // --- HELPER FUNCTIONS ---
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // --- EFFECTS ---
  
  useEffect(() => {
    const fetchTasksFromDB = async () => {
      const response = await fetch("http://localhost:5000/api/tasks");
      const data = await response.json();
      setTasks(data);
    };

    fetchTasksFromDB();
  }, []);

  // Keep tasksRef perfectly synced with your tasks state
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  // The Alarm Engine
  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTime = getCurrentTime();

      tasksRef.current.forEach((task) => {
        // Here are the 3 conditions perfectly combined:
        if (
          task.notificationTime === currentTime && 
          !task.isCompleted && 
          !alertedTasks.current.has(task.id)
        ) {
          // Ring the alarm!
          alert(`Reminder: ${task.title}`);
          
          // Add the ID to the silent memory bank so it doesn't ring again
          alertedTasks.current.add(task.id);
        }
      });
    }, 10000);

    return () => clearInterval(intervalId);
  }, []); 

  // --- ACTION HANDLERS ---
  const handleAddTask = async () => {
    if (newTaskTitle.trim() === "") return;
    const newTaskblueprint = {
      title: newTaskTitle,
      isCompleted: false,
      notificationTime: newTaskTime,
      daysToRepeat: ["today"],
      alarmSound: "default",
      isSnoozeEnabled: false
    };
    const response = await fetch("http://localhost:5000/api/tasks", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(newTaskblueprint)
    });

    const savedTask = await response.json();
    setTasks([...tasks, savedTask]);
    setNewTaskTitle("");
    setNewTaskTime("12:00");
  };
  


  // Notice we now pass in the currentStatus so the server knows what to flip it to!
const handleToggleComplete = async (taskId, currentStatus) => {
  const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isCompleted: !currentStatus })
  });

  const updatedTask = await response.json();

  setTasks(
    tasks.map((task) => {
      if(task._id === taskId){ // <-- Notice the _id!
        return updatedTask;
      } else {
        return task;
      }
    })
  );
};

const handleDeleteTask = async (taskId) => {
  await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
    method: "DELETE"
  });

  setTasks(
    tasks.filter((task) => {
      if(task._id === taskId){ // <-- Notice the _id!
        return false; 
      } else {
        return true;
      }
    })
  );
};
  // --- RENDER (UI) ---
  return (
    <div className="app-container">
      
      {/* Sidebar area for the Dashboard Widgets */}
      <aside className="sidebar">
        <h2>Dashboard</h2>
        
        <div className="widget">
          <p><strong>Quote:</strong><br/>"One day or day one. You decide."</p>
        </div>
        
        <div className="widget">
          <p><strong>Countdown:</strong><br/>14 Days remaining</p>
        </div>

        <div className="widget">
          <p><strong>Today's Progress:</strong><br/>{completedTasks} of {totalTasks} completed</p>
        </div>
        
        <div className="widget">
          <p><strong>Yesterday's Missed:</strong><br/>2 Tasks</p>
        </div>
      </aside>

      {/* Main Task Area */}
      <main className="main-content">
        <h1>My Tasks</h1>
        
        <div className="add-task-form">
          <input 
            type="time" 
            value={newTaskTime} 
            onChange={(event) => setNewTaskTime(event.target.value)} 
          />
          <input 
            type="text" 
            placeholder="What do you need to do?"
            value={newTaskTitle} 
            onChange={(event) => setNewTaskTitle(event.target.value)} 
          />
          <button onClick={handleAddTask}>Add Task</button>
        </div>
        
        {/* Filter Buttons */}
        <div className="filter-buttons">
          <button onClick={() => setFilter("all")}>All</button>
          <button onClick={() => setFilter("active")}>Active</button>
          <button onClick={() => setFilter("completed")}>Completed</button>
        </div>

       {/* Rendering the Task List */}
        <div className="task-list">
          {displayedTasks.map((task) => (
            <div key={task._id} className="task-item">
              <button className="delete-btn" onClick={() => handleDeleteTask(task._id)}>Delete</button>
              <input 
                type="checkbox" 
                checked={task.isCompleted} 
                onChange={() => handleToggleComplete(task._id, task.isCompleted)} 
              />
              <span className="task-title">{task.title}</span>
              <span className="task-time">({task.notificationTime})</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;