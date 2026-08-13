import React, { useState } from "react";
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
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("12:00");

  // 1. Add Task Function
  const handleAddTask = () => {
    if (newTaskTitle.trim() === "") return;

    const newTask = {
      id: `task-${Date.now()}`, // Fixed the ID bug!
      title: newTaskTitle,
      isCompleted: false,
      notificationTime: newTaskTime,
      daysToRepeat: ["today"],
      alarmSound: "default",
      isSnoozeEnabled: false
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setNewTaskTime("12:00");
  };

  // 2. Toggle Complete Function 
  const handleToggleComplete = (taskId) => {
    setTasks(
      tasks.map((task) => {
        if(task.id === taskId){
          return {...task, isCompleted: !task.isCompleted};
        } else {
          return task;
        }
      })
    );
  };

  // 3. Delete Task Function 
  const handleDeleteTask = (taskId) => {
    setTasks(
      tasks.filter((task) => {
        if(task.id === taskId){
          return false; 
        } else {
          return true;
        }
      })
    );
  };

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

        {/* Rendering the Task List */}
        <div className="task-list">
          {tasks.map((task) => (
            <div key={task.id} className="task-item">
              <button className="delete-btn" onClick={() => handleDeleteTask(task.id)}>Delete</button>
              <input type="checkbox" checked={task.isCompleted} onChange={() => handleToggleComplete(task.id)} />
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