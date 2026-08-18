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

// ==========================================
// 🚀 NEW: THE API ROUTES (CRUD)
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

// 3. UPDATE: Toggle complete
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

// ==========================================

// Catch-all route to serve React app for any other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// 6. Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});