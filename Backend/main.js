const { app, BrowserWindow } = require("electron");

// Disable autoplay policy restrictions so audio plays automatically without requiring prior user gesture
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

// Boot the Express server
require("./server.js");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      autoplayPolicy: "no-user-gesture-required"
    }
  });

  mainWindow.loadURL("http://localhost:5000");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
