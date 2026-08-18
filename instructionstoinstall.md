# 📦 How to Install TaskForge on Another Laptop

Follow this simple step-by-step guide to install and run **TaskForge** on any 64-bit Windows 10 or 11 laptop or PC.

---

## 📋 Prerequisites & File Location

### 1. The Installer File
Locate the compiled setup executable on your current computer:
* **File Name**: `TaskForge Setup 1.0.0.exe`
* **App link**:  https://drive.google.com/file/d/1SM6HN7n4phu6PyG5NSkRNmQa8CGHyywM/view?usp=drivesdk

### 2. Database Connectivity Check (MongoDB)
* **If using MongoDB Atlas (Cloud Database)**:
  * **No setup required on the target laptop!** TaskForge will automatically connect over the internet.
  * *Ensure*: In your [MongoDB Atlas Dashboard](https://cloud.mongodb.com) under **Network Access**, verify that `0.0.0.0/0` (Allow Access from Anywhere) is enabled so other laptops aren't blocked.
* **If using Local MongoDB (`mongodb://localhost:27017`)**:
  * Either install [MongoDB Community Server](https://www.mongodb.com/try/download/community) on the target laptop, or update `MONGO_URI` in `.env` to a free cloud cluster on MongoDB Atlas before building.

---

## 🚀 Step-by-Step Installation Instructions

### Step 1: Transfer the Installer to the Target Laptop
Transfer `TaskForge Setup 1.0.0.exe` to the other laptop using any of the following methods:
* 💾 **USB Flash Drive** (Copy & paste)
* ☁️ **Google Drive / OneDrive / Dropbox** (Upload & download)
* 🌐 **WeTransfer / File Transfer Site**

---

### Step 2: Run the Installer
1. On the target laptop, open the folder where you saved `TaskForge Setup 1.0.0.exe`.
2. **Double-click `TaskForge Setup 1.0.0.exe`**.
3. If Windows displays a "Windows protected your PC" (SmartScreen) warning:
   * Click **"More info"**.
   * Click **"Run anyway"**.

---

### Step 3: Launch & Use TaskForge
* The installation completes automatically in seconds.
* The installer creates a **TaskForge** shortcut icon on the target laptop's **Desktop** and **Start Menu**.
* Double-click the **TaskForge** icon anytime to open the application!

---

## ⚙️ Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **Tasks aren't saving / Server error** | Ensure target laptop has internet access if using MongoDB Atlas, and verify `0.0.0.0/0` is allowed in Atlas Network Access. |
| **Audio alarm doesn't play** | Check laptop speaker volume. TaskForge has built-in zero-gesture audio autoplay flags enabled. |
