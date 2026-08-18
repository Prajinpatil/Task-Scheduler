#  Antigravity Hacker Task Scheduler & Desktop Command Center

A high-performance, motivational, "hacker-style" desktop task scheduling and command center application built with **React 19**, **Node.js**, **Express 5**, **MongoDB**, and **Electron**.

Designed with an **antigravity dark mode aesthetic**, glowing neon cyan and matrix green accents, terminal-style monospace typography, continuous alarm engine with snooze capabilities, custom ringtones, 3 AM daily task resets, task freezing/activation, custom day recurrence, and an editable countdown event widget.

---

##  Complete Tech Stack

### **Frontend (User Interface & Audio Engine)**
* **React 19**: Modern component architecture using React Hooks (`useState`, `useEffect`, `useRef`).
* **Vite 8**: Next-generation front-end tooling for instant dev server startup and optimized production builds.
* **Vanilla CSS3 Design System**:
  * Deep pitch-black (`#030509`) and dark slate card backdrops (`rgba(13, 20, 33, 0.75)`).
  * High-contrast glowing neon cyan (`#00f3ff`) and matrix green (`#00ff88`) accents.
  * Antigravity floating box-shadow properties and smooth hover lift animations (`transform: translateY(-4px)`).
  * Glassmorphism effects with `backdrop-filter: blur()`.
* **Google Fonts Integration**:
  * **Orbitron & Syne**: High-tech, aggressive sans-serif fonts for headers, quote banners, and active buttons.
  * **Fira Code**: Clean monospace font for timestamps, countdown numbers, and terminal elements.
* **HTML5 Audio API**: Looping audio engine configured for zero-gesture automatic alarm playback.

### **Backend (REST API & Database)**
* **Node.js**: Asynchronous event-driven JavaScript runtime.
* **Express 5**: Fast, unopinionated web framework for Node.js powering the RESTful API endpoints.
* **MongoDB & Mongoose 9**: NoSQL document database and Object Data Modeling (ODM) library for storing tasks and countdown events.
* **CORS & Dotenv**: Cross-Origin Resource Sharing middleware and environment configuration.

### **Desktop Wrapper & Packaging**
* **Electron 43**: Chromium and Node.js wrapper turning the full-stack web app into a native desktop application.
  * Chromium `autoplay-policy: no-user-gesture-required` enabled for silent background alarm triggers.
* **Electron-Builder 26**: Automated packaging tool compiling the app into a single installable **NSIS Windows setup executable (`.exe`)**.

---

##  Key Features & Capabilities

### 1.  Continuous Ringing Alarm with Dismiss & Snooze
* **Non-Blocking Looping Alarm**: When a task's notification time arrives, the assigned audio ringtone loops continuously (`loop = true`).
* **Active Alarm Cyber Modal**: Displays a high-impact ` ALARM TRIGGERED` overlay with task title and time.
* **Dismiss Button**: Instantly stops the audio loop and closes the modal.
* **Snooze Options (`+1 HR`, `+2 HR`, `+3 HR`)**:
  * Automatically recalculates `notificationTime` to `now + X hours`.
  * Persists updated time in MongoDB.
  * Resets alarm deduplication memory so the alarm rings again after the snooze duration if incomplete.

### 2.  Ringtone Selection
* **4 Custom Ringtone Options** stored in `Frontend/public/`:
  1. **Cyber Pulse** (`cyber_pulse.wav`)
  2. **Futuristic Chime** (`futuristic_chime.wav`)
  3. **Radar Ping** (`radar_ping.wav`)
  4. **Classic Bell** (`classic_bell.wav`)
* Select custom ringtones per task in the creation form.
* Displays a ` Ringtone Name` badge on every task item.

### 3. 3:00 AM Automatic Daily Task Reset Engine
* **Daily Reset Cycle**: Automatically unchecks all completed tasks (`isCompleted: false`) at **03:00 AM** every night (or when launching the app on a new day).
* Resets alarm memory so daily tasks ring fresh every morning.

### 4.  Freeze / Activate Tasks
* **Freeze Toggle**: Temporarily pause any task by clicking ` Freeze`.
* **Frozen State**: Displays a ` FROZEN` status badge and dimmed card styling.
* **Alarm Suspension**: Frozen tasks are skipped by the alarm engine until un-frozen (` Activate`).
* Includes a dedicated **`Frozen `** tab filter.

### 5.  Flexible Day Recurrence Scheduling
* Schedule tasks for:
  * **Everyday**: Rings every single day.
  * **Today Only**: Rings today only.
  * **Specific Days**: Select custom days of the week (e.g., *Mon & Fri*, *Tue & Thu*).
* Checks the current day of the week before triggering alarms.

### 6.  Editable Countdown Event Widget
* Sidebar widget tracking days remaining until a deadline.
* **`✎ Edit` Modal**: Interactive calendar date picker (`<input type="date" />`) and custom event title input.
* Computes exact days remaining (`targetDate - currentDate`) and updates daily.

### 7.  Daily Rotating Hero Motivational Quote Banner
* Front and center header banner with large, bold, glowing Orbitron typography.
* Automatically rotates through motivational hacker quotes every calendar day.

---

##  REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tasks` | Fetch all tasks from MongoDB |
| `POST` | `/api/tasks` | Create a new task (title, time, sound, schedule) |
| `PUT` | `/api/tasks/:id` | Update task (complete, snooze time, freeze status) |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `PUT` | `/api/tasks/reset-daily` | Uncheck all tasks for 3 AM daily reset cycle |
| `GET` | `/api/event` | Fetch countdown event title & target date |
| `PUT` | `/api/event` | Update countdown event title & target date |

---

## Directory Architecture

```
Task_Scheduler/
├── Frontend/
│   ├── public/             # Static audio ringtones (.wav) & icons
│   ├── src/
│   │   ├── App.jsx         # Core React App & Alarm Engine
│   │   ├── App.css         # Antigravity Hacker Dark Mode Design System
│   │   └── main.jsx        # React entrypoint
│   ├── vite.config.js      # Vite build configuration
│   └── package.json
│
└── Backend/
    ├── dist/               # Built static React production files
    ├── model/
    │   ├── task.js         # Mongoose Task Schema (isCompleted, isFrozen, daysToRepeat)
    │   └── event.js        # Mongoose Countdown Event Schema
    ├── dist-electron/      # Final compiled Windows Setup .exe installer
    │   └── backend Setup 1.0.0.exe
    ├── main.js             # Electron Main Process Wrapper (Autoplay flags enabled)
    ├── server.js           # Express 5 REST API & Static File Server
    ├── package.json        # Dependencies & electron-builder NSIS config
    └── .env                # MongoDB URI & environment variables
```

---

##  Building & Running Locally

### Development Mode
1. **Backend**:
   ```bash
   cd Backend
   npm install
   npm run dev
   ```
2. **Frontend**:
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

### Compile Windows Desktop Executable (`.exe`)
1. Build Frontend:
   ```bash
   cd Frontend
   npm run build
   ```
2. Build Electron Windows Installer:
   ```bash
   cd Backend
   npm run build
   ```
3. Output file generated at: `Backend/dist-electron/backend Setup 1.0.0.exe`
