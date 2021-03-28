const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");
const isDev = require("electron-is-dev");

require("./db");

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    show: false,
    title: "electron testA",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  mainWindow.loadURL(
    !app.isPackaged
      ? process.env.ELECTRON_START_URL
      : url.format({
          pathname: path.join(__dirname, "./index.html"),
          protocol: "file:",
          slashes: true,
        })
  );

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

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
