const { ipcMain } = require("electron");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");

ipcMain.on("asynchronous-message", (event, arg) => {
  console.log(arg); // prints "ping"
  if (arg === "ping") event.reply("asynchronous-reply", "pong!");
  else event.reply("asynchronous-reply", "please, send me ping.");
});

ipcMain.on("run-sql", (event, arg) => {
  db.run(arg.sql, arg.params, function (err, rows) {
    event.reply("run-sql" + arg.requestId, {
      error: err,
      data: rows,
      requestId: arg.requestId,
      lastID: this.lastID,
      changes: this.changes,
    });
  });
});

ipcMain.on("all-sql", (event, arg) => {
  db.all(arg.sql, arg.params, function (err, rows) {
    event.reply("all-sql" + arg.requestId, {
      error: err,
      data: rows,
      requestId: arg.requestId,
    });
  });
});

ipcMain.on("get-sql", (event, arg) => {
  db.get(arg.sql, arg.params, function (err, row) {
    event.reply("get-sql" + arg.requestId, {
      error: err,
      data: row,
      requestId: arg.requestId,
    });
  });
});

ipcMain.on("load-notes", (event, arg) => {
  db.all("SELECT * FROM note", (err, rows) => {
    if (err) throw err;

    event.reply("load-notes", rows);
  });
});

ipcMain.on("save-note", (event, arg) => {
  db.run(
    "INSERT INTO note(content) values(?)",
    [arg.content],
    function (err, rows) {
      if (err) throw err;

      event.reply("save-note", { id: this.lastID });
    }
  );
});
