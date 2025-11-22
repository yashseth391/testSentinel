import { app, BrowserWindow } from "electron";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { PythonShell } from "python-shell";
import { isDev } from "./util.js";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;

// 🔥 Start Python process killer
console.log("Preparing to start Python process killer...");

function startProcessKiller() {
  console.log("🚀 Starting Python process killer...");

  const scriptPath = path.join(__dirname, "../security/kill_processes.py");
  console.log("Python script path:", scriptPath);

  PythonShell.run(scriptPath, { pythonOptions: ["-u"] }, (err) => {
    if (err) {
      console.error("❌ Python process killer stopped:", err);
    } else {
      console.log("⚠ Python process killer exited");
    }
  });
}

// 🪟 Create the exam window
function createWindow() {
  console.log("Creating exam window...");

  mainWindow = new BrowserWindow({
    fullscreen: true,
    kiosk: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      contextIsolation: true,
    },
  });

  if (isDev()) {
    console.log("Loading DEV UI...");
    mainWindow.loadURL("http://localhost:5123");
  } else {
    console.log("Loading PROD UI...");
    mainWindow.loadFile(path.join(app.getAppPath(), "dist-react/index.html"));
  }
}

console.log("heere");

// 🚀 FIXED event
app.whenReady().then(() => {
  console.log("Electron is ready!");
  // startProcessKiller();
  createWindow();
});

// Prevent app from closing
app.on("window-all-closed", (e) => e.preventDefault());
