const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  isCompleted: { 
    type: Boolean, 
    default: false 
  },
  notificationTime: { 
    type: String, 
    default: "12:00" 
  },
  daysToRepeat: { 
    type: [String], 
    default: ["today"] 
  },
  alarmSound: { 
    type: String, 
    default: "default" 
  },
  isSnoozeEnabled: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);