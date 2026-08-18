import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const MOTIVATIONAL_QUOTES = [
  "One day or day one. You decide.",
  "Focus is a superpower in a noisy world.",
  "Execute with precision. Overcome all limits.",
  "Consistency is the code that builds empires.",
  "Silence the noise. Build the future.",
  "Greatness is forged in the hours nobody sees.",
  "System initialized. Target acquired. Dominate today.",
  "Code your destiny line by line.",
  "No shortcuts. Only relentless execution."
];

const RINGTONES = [
  { id: "cyber_pulse", name: "Cyber Pulse", file: "/cyber_pulse.wav" },
  { id: "futuristic_chime", name: "Futuristic Chime", file: "/futuristic_chime.wav" },
  { id: "radar_ping", name: "Radar Ping", file: "/radar_ping.wav" },
  { id: "classic_bell", name: "Classic Bell", file: "/classic_bell.wav" }
];

const DAYS_OF_WEEK = [
  { id: "monday", label: "Mon" },
  { id: "tuesday", label: "Tue" },
  { id: "wednesday", label: "Wed" },
  { id: "thursday", label: "Thu" },
  { id: "friday", label: "Fri" },
  { id: "saturday", label: "Sat" },
  { id: "sunday", label: "Sun" }
];

function App() {
  // --- STATE ---
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("12:00");
  const [newTaskSound, setNewTaskSound] = useState("cyber_pulse");
  const [repeatMode, setRepeatMode] = useState("everyday"); // "everyday", "today", "custom"
  const [selectedCustomDays, setSelectedCustomDays] = useState(["monday", "friday"]);
  const [filter, setFilter] = useState("all");

  // Active Alarm State
  const [activeAlarmTask, setActiveAlarmTask] = useState(null);

  // Countdown Event State
  const [eventData, setEventData] = useState({ title: "Project Launch", targetDate: "" });
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editEventTitle, setEditEventTitle] = useState("");
  const [editEventDate, setEditEventDate] = useState("");

  // --- REFS ---
  const tasksRef = useRef(tasks);  
  const alertedTasks = useRef(new Set());
  const audioRef = useRef(null);

  // --- HELPER FUNCTIONS ---
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const get3AMCycleKey = () => {
    const now = new Date();
    if (now.getHours() < 3) {
      now.setDate(now.getDate() - 1);
    }
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  };

  const getDailyQuote = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const index = dayOfYear % MOTIVATIONAL_QUOTES.length;
    return MOTIVATIONAL_QUOTES[index];
  };

  const calculateDaysRemaining = (targetDateStr) => {
    if (!targetDateStr) return 0;
    const target = new Date(targetDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };

  const isTaskScheduledForToday = (task) => {
    if (task.isFrozen) return false;
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const currentDayName = dayNames[new Date().getDay()];

    if (!task.daysToRepeat || task.daysToRepeat.length === 0) return true;
    if (task.daysToRepeat.includes("everyday") || task.daysToRepeat.includes("today")) return true;
    return task.daysToRepeat.includes(currentDayName);
  };

  // --- DERIVED STATE ---
  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const totalTasks = tasks.length;
  const daysRemaining = calculateDaysRemaining(eventData.targetDate);

  const displayedTasks = tasks.filter(task => {
    if (filter === "all") return true;
    if (filter === "active") return !task.isCompleted && !task.isFrozen;
    if (filter === "completed") return task.isCompleted;
    if (filter === "frozen") return task.isFrozen;
    return true;
  });

  // --- EFFECTS ---
  // Fetch Tasks and Countdown Event from DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksRes = await fetch("http://localhost:5000/api/tasks");
        const tasksData = await tasksRes.json();
        setTasks(tasksData);

        const eventRes = await fetch("http://localhost:5000/api/event");
        const eventDataRes = await eventRes.json();
        setEventData(eventDataRes);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  // Sync tasksRef
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  // 3:00 AM Midnight Daily Reset Engine & Alarm Engine
  useEffect(() => {
    const checkDailyResetAndAlarms = async () => {
      const currentCycle = get3AMCycleKey();
      const lastReset = localStorage.getItem("last_3am_reset_key");

      // Trigger 3:00 AM Daily Reset if a new 3AM cycle has arrived
      if (lastReset !== currentCycle) {
        try {
          const resetRes = await fetch("http://localhost:5000/api/tasks/reset-daily", { method: "PUT" });
          const resetData = await resetRes.json();
          setTasks(resetData);
          alertedTasks.current.clear();
          localStorage.setItem("last_3am_reset_key", currentCycle);
        } catch (e) {
          console.error("3 AM reset error:", e);
        }
      }

      // Check Alarms
      const currentTime = getCurrentTime();
      tasksRef.current.forEach((task) => {
        const taskId = task._id || task.id;

        if (
          isTaskScheduledForToday(task) &&
          task.notificationTime === currentTime && 
          !task.isCompleted && 
          !alertedTasks.current.has(taskId)
        ) {
          // Trigger Active Alarm
          setActiveAlarmTask(task);
          
          if (audioRef.current) {
            const soundFile = RINGTONES.find(r => r.id === task.alarmSound)?.file || "/cyber_pulse.wav";
            audioRef.current.src = soundFile;
            audioRef.current.loop = true;
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch((err) => console.error("Audio error:", err));
          }

          alertedTasks.current.add(taskId);
        }
      });
    };

    const intervalId = setInterval(checkDailyResetAndAlarms, 10000);
    checkDailyResetAndAlarms();

    return () => clearInterval(intervalId);
  }, []);

  // --- ACTION HANDLERS ---
  const handleToggleDaySelection = (dayId) => {
    if (selectedCustomDays.includes(dayId)) {
      setSelectedCustomDays(selectedCustomDays.filter(d => d !== dayId));
    } else {
      setSelectedCustomDays([...selectedCustomDays, dayId]);
    }
  };

  const handleAddTask = async () => {
    if (newTaskTitle.trim() === "") return;

    let finalDays = ["everyday"];
    if (repeatMode === "today") finalDays = ["today"];
    else if (repeatMode === "custom") finalDays = selectedCustomDays.length > 0 ? selectedCustomDays : ["everyday"];

    const newTaskBlueprint = {
      title: newTaskTitle,
      isCompleted: false,
      isFrozen: false,
      notificationTime: newTaskTime,
      daysToRepeat: finalDays,
      alarmSound: newTaskSound,
      isSnoozeEnabled: true
    };

    const response = await fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTaskBlueprint)
    });

    const savedTask = await response.json();
    setTasks([...tasks, savedTask]);
    setNewTaskTitle("");
    setNewTaskTime("12:00");
  };

  const handleToggleComplete = async (taskId, currentStatus) => {
    const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: !currentStatus })
    });

    const updatedTask = await response.json();
    setTasks(tasks.map((task) => (task._id === taskId ? updatedTask : task)));
  };

  const handleToggleFreeze = async (taskId, currentFreezeStatus) => {
    const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFrozen: !currentFreezeStatus })
    });

    const updatedTask = await response.json();
    setTasks(tasks.map((task) => (task._id === taskId ? updatedTask : task)));
  };

  const handleDeleteTask = async (taskId) => {
    await fetch(`http://localhost:5000/api/tasks/${taskId}`, { method: "DELETE" });
    setTasks(tasks.filter((task) => task._id !== taskId));
  };

  const handleDismissAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.loop = false;
      audioRef.current.currentTime = 0;
    }
    setActiveAlarmTask(null);
  };

  const handleSnoozeAlarm = async (hours) => {
    if (!activeAlarmTask) return;
    const now = new Date();
    now.setHours(now.getHours() + hours);
    const newHours = String(now.getHours()).padStart(2, '0');
    const newMinutes = String(now.getMinutes()).padStart(2, '0');
    const snoozeTime = `${newHours}:${newMinutes}`;

    const taskId = activeAlarmTask._id || activeAlarmTask.id;
    
    // Update task in backend
    const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationTime: snoozeTime })
    });
    const updatedTask = await response.json();
    setTasks(tasks.map((task) => (task._id === taskId ? updatedTask : task)));

    // Unmark from alertedTasks so it rings again at snoozeTime
    alertedTasks.current.delete(taskId);

    handleDismissAlarm();
  };

  // Countdown Event Handlers
  const handleOpenEventModal = () => {
    setEditEventTitle(eventData.title || "");
    setEditEventDate(eventData.targetDate || "");
    setIsEditingEvent(true);
  };

  const handleSaveEvent = async () => {
    const updatedData = { title: editEventTitle, targetDate: editEventDate };
    const response = await fetch("http://localhost:5000/api/event", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    });
    const savedEvent = await response.json();
    setEventData(savedEvent);
    setIsEditingEvent(false);
  };

  const formatScheduleLabel = (days) => {
    if (!days || days.length === 0) return "Everyday";
    if (days.includes("everyday")) return "Everyday";
    if (days.includes("today")) return "Today Only";
    return days.map(d => d.substring(0, 3).toUpperCase()).join(", ");
  };

  return (
    <div className="app-container">
      <audio ref={audioRef} preload="auto" />

      {/* ACTIVE CONTINUOUS ALARM MODAL */}
      {activeAlarmTask && (
        <div className="alarm-modal-overlay">
          <div className="alarm-modal-content">
            <div className="alarm-header">
              <span className="alarm-icon">🚨</span>
              <h2>ALARM TRIGGERED</h2>
            </div>
            <p className="alarm-task-title">{activeAlarmTask.title}</p>
            <p className="alarm-task-time">Scheduled for: {activeAlarmTask.notificationTime}</p>
            
            <div className="snooze-section">
              <span>Snooze for:</span>
              <div className="snooze-buttons">
                <button onClick={() => handleSnoozeAlarm(1)}>+1 HR</button>
                <button onClick={() => handleSnoozeAlarm(2)}>+2 HR</button>
                <button onClick={() => handleSnoozeAlarm(3)}>+3 HR</button>
              </div>
            </div>

            <button className="dismiss-btn" onClick={handleDismissAlarm}>
              DISMISS ALARM
            </button>
          </div>
        </div>
      )}

      {/* COUNTDOWN EVENT EDIT MODAL */}
      {isEditingEvent && (
        <div className="event-modal-overlay">
          <div className="event-modal-content">
            <h2>Edit Countdown Event</h2>
            <div className="form-group">
              <label>Event Title</label>
              <input 
                type="text" 
                value={editEventTitle} 
                onChange={(e) => setEditEventTitle(e.target.value)} 
                placeholder="e.g. Final Exam, Project Launch"
              />
            </div>
            <div className="form-group">
              <label>Target Date</label>
              <input 
                type="date" 
                value={editEventDate} 
                onChange={(e) => setEditEventDate(e.target.value)} 
              />
            </div>
            <div className="modal-actions">
              <button className="save-btn" onClick={handleSaveEvent}>Save Event</button>
              <button className="cancel-btn" onClick={() => setIsEditingEvent(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar area for Dashboard Widgets */}
      <aside className="sidebar">
        <h2>Dashboard</h2>

        <div className="widget countdown-widget">
          <div className="widget-header">
            <strong>{eventData.title || "Countdown"}</strong>
            <button className="edit-event-btn" onClick={handleOpenEventModal}>✎ Edit</button>
          </div>
          <p className="countdown-days">{daysRemaining} Days remaining</p>
          <small className="target-date-label">Target: {eventData.targetDate || "Not set"}</small>
        </div>

        <div className="widget">
          <p><strong>3 AM Reset Cycle:</strong><br/>Auto-unchecks daily at 03:00 AM</p>
        </div>

        <div className="widget">
          <p><strong>Today's Progress:</strong><br/>{completedTasks} of {totalTasks} completed</p>
        </div>
      </aside>

      {/* Main Command Content */}
      <main className="main-content">
        {/* FRONT AND CENTER HERO MOTIVATIONAL QUOTE BANNER */}
        <section className="hero-quote-banner">
          <span className="quote-badge">DAILY MOTIVATION</span>
          <h2 className="quote-text">"{getDailyQuote()}"</h2>
        </section>

        <h1>TaskForge</h1>

        {/* Add Task Form with Days & Ringtone Selector */}
        <div className="add-task-card">
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
            <select 
              value={newTaskSound} 
              onChange={(event) => setNewTaskSound(event.target.value)}
              className="ringtone-select"
            >
              {RINGTONES.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <button onClick={handleAddTask}>Add Task</button>
          </div>

          <div className="schedule-selector">
            <span className="selector-label">Repeat Schedule:</span>
            <div className="repeat-options">
              <button 
                className={`repeat-btn ${repeatMode === "everyday" ? "active" : ""}`}
                onClick={() => setRepeatMode("everyday")}
              >
                Everyday
              </button>
              <button 
                className={`repeat-btn ${repeatMode === "today" ? "active" : ""}`}
                onClick={() => setRepeatMode("today")}
              >
                Today Only
              </button>
              <button 
                className={`repeat-btn ${repeatMode === "custom" ? "active" : ""}`}
                onClick={() => setRepeatMode("custom")}
              >
                Specific Days
              </button>
            </div>

            {repeatMode === "custom" && (
              <div className="day-pills">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day.id}
                    className={`day-pill ${selectedCustomDays.includes(day.id) ? "selected" : ""}`}
                    onClick={() => handleToggleDaySelection(day.id)}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="filter-buttons">
          <button className={filter === "all" ? "active-filter" : ""} onClick={() => setFilter("all")}>All</button>
          <button className={filter === "active" ? "active-filter" : ""} onClick={() => setFilter("active")}>Active</button>
          <button className={filter === "completed" ? "active-filter" : ""} onClick={() => setFilter("completed")}>Completed</button>
          <button className={filter === "frozen" ? "active-filter" : ""} onClick={() => setFilter("frozen")}>Frozen ❄️</button>
        </div>

        {/* Rendering the Task List */}
        <div className="task-list">
          {displayedTasks.map((task) => (
            <div key={task._id} className={`task-item ${task.isFrozen ? "frozen-card" : ""}`}>
              <button 
                className={`freeze-btn ${task.isFrozen ? "is-frozen" : ""}`}
                onClick={() => handleToggleFreeze(task._id, task.isFrozen)}
                title={task.isFrozen ? "Unfreeze task" : "Freeze task (pause alarm)"}
              >
                {task.isFrozen ? "⚡ Activate" : "❄️ Freeze"}
              </button>
              <button className="delete-btn" onClick={() => handleDeleteTask(task._id)}>Delete</button>
              
              <input 
                type="checkbox" 
                checked={task.isCompleted} 
                onChange={() => handleToggleComplete(task._id, task.isCompleted)} 
              />
              
              <div className="task-info">
                <span className="task-title">{task.title}</span>
                <div className="task-badges">
                  {task.isFrozen && <span className="frozen-badge">❄️ FROZEN</span>}
                  <span className="schedule-badge">🗓️ {formatScheduleLabel(task.daysToRepeat)}</span>
                  <span className="task-sound-badge">🎵 {RINGTONES.find(r => r.id === task.alarmSound)?.name || "Cyber Pulse"}</span>
                </div>
              </div>

              <span className="task-time">({task.notificationTime})</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;