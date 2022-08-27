import express from "express"
import path from "path"
import logger from "morgan"
import connectLivereload from "connect-livereload";

const CWD = process.cwd()

const app = express()
const port = 8001
app.use(logger("dev"))
app.use(connectLivereload());
app.use(express.static(path.join(CWD, 'public')));

app.listen(port, () => console.log(`The server is listening on port ${port}`))

app.get("/", (req, res) => {
  res.redirect('index.html');
})
