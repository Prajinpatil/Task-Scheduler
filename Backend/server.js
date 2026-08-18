const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// 1. Initialize the Express app
const app = express();

// 2. Set up middleware
app.use(cors()); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname, "dist"))); 

const PORT = process.env.PORT || 5000;

// 3. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Successfully connected to MongoDB"))
  .catch((error) => console.log("❌ MongoDB connection error:", error));

// ==========================================
// 🚀 NEW: IMPORT YOUR BLUEPRINT
// ==========================================
const Task = require("./model/task"); 
const Event = require("./model/event");

// ==========================================
// 🚀 THE API ROUTES (CRUD)
// ==========================================

// 1. READ: Get all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find(); 
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching tasks" });
  }
});

// 2. CREATE: Add a new task
app.post("/api/tasks", async (req, res) => {
  try {
    const newTask = new Task(req.body); 
    const savedTask = await newTask.save(); 
    res.status(201).json(savedTask); 
  } catch (error) {
    res.status(400).json({ message: "Error saving task", error });
  }
});

// 3. UPDATE: Toggle complete / Snooze / Edit
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: "Error updating task", error });
  }
});

// 4. DELETE: Remove a task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task successfully deleted" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting task", error });
  }
});

// 4.5 RESET: Uncheck tasks for 3 AM daily reset
app.put("/api/tasks/reset-daily", async (req, res) => {
  try {
    await Task.updateMany({}, { isCompleted: false });
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error resetting tasks" });
  }
});

// 5. COUNTDOWN EVENT ROUTES
app.get("/api/event", async (req, res) => {
  try {
    let event = await Event.findOne();
    if (!event) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 14);
      const dateStr = defaultDate.toISOString().split("T")[0];
      event = await Event.create({ title: "Project Launch", targetDate: dateStr });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Error fetching event" });
  }
});

app.put("/api/event", async (req, res) => {
  try {
    let event = await Event.findOne();
    if (!event) {
      event = new Event(req.body);
    } else {
      event.title = req.body.title;
      event.targetDate = req.body.targetDate;
    }
    const savedEvent = await event.save();
    res.json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: "Error saving event", error });
  }
});

// ==========================================

// Catch-all route to serve React app for any other routes (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// 6. Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});