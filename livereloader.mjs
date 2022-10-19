import livereload from "livereload";

const CWD = process.cwd()

const liveReloadConf = {"extraExts": ["mjs", "wat"], "delay": 300}
const liveReloadCallback = () => {console.log("reloaded")}
const liveReloadServer = livereload.createServer(liveReloadConf, liveReloadCallback);
liveReloadServer.watch(CWD);
