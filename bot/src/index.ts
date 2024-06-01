import TelegramBot from "node-telegram-bot-api"
import dotenv from "dotenv"
import express from "express"

dotenv.config({ path: "./.env.local" })
if (!process.env.BOT_TOKEN) throw new Error("BOT_TOKEN is required")

/*  Bot  */

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true })

// set replies

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, `Welcome to the bot!\nYour ID: ${chatId}`)
})

/*  Server  */

const app = express()
app.use(express.json())
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, POST")
  res.header("Access-Control-Allow-Headers", "Content-Type")
  next()
})

app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.post("/", async (req, res) => {
  const { userId, text } = req.body
  const result = await fetch("https://api.telegram.org/bot" + process.env.BOT_TOKEN + "/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: userId, text, parse_mode: "MarkdownV2" }),
  })
    .then((res) => res.json())
    .catch(console.error)
  res.send(result)
})

app.listen(80, () => {
  console.log("listening on port 80")
  setInterval(() => {
    fetch("https://telegramreports.onrender.com")
  }, 60000)
})
