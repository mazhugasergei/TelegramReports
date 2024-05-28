type TGCatcher = (fn: () => Promise<any> | any, options: CatcherOptions) => Promise<void>
type CatcherOptions = { chatId: number; global?: boolean }

export const tgCatcher: TGCatcher = async (fn, { chatId, global = false }) => {
  const sendLog = async (error: unknown) => {
    await fetch("https://telegramreports.onrender.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId,
        text: "```\n" + (error instanceof Error ? error.stack ?? error : error) + "\n```",
      }),
    }).catch(console.error)
  }

  if (global) {
    process.on("unhandledRejection", (reason) => {
      console.error(reason)
      sendLog(reason)
    })
    process.on("uncaughtException", (error) => {
      console.error(error)
      sendLog(error)
    })
  }

  try {
    await fn()
  } catch (error) {
    console.error(error)
    sendLog(error)
  }
}
