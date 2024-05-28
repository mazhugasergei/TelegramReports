import { tgCatcher } from "./catcher"
import dotenv from "dotenv"
// import http from "http"

dotenv.config({ path: ".env" })

const main = async () => {
  const fun = async () => {
    throw new Error("some error")
  }
  await fun()
}

tgCatcher(main, { chatId: 1419377014, global: true })

// const server = http.createServer((req, res) => res.end("ok"))
// server.listen(3001)
