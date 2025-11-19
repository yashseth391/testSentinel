const { contextBridge } = require("electron");
const fetch = require("node-fetch");

contextBridge.exposeInMainWorld("api", {
  getQuestion: async (url) => {
    const res = await fetch(url);
    return await res.json();
  },
});
