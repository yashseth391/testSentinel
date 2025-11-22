import { PythonShell } from "python-shell";

PythonShell.on("message", function (message) {
  console.log(message);
});

PythonShell.end(function (err) {
  if (err) {
    throw err;
  }
  console.log("finished");
});
