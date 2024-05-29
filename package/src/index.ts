type Function = (...args: any[]) => Promise<any> | any
type Options = { log: boolean; crash: boolean }

type SendConfig = { chatId: number }
type TgErrorSender = (error: unknown, config: SendConfig) => Promise<Response>
type TgFunctionScopeCatcher = (fn: Function, config: SendConfig, options?: Options) => Promise<void>

type GlobalSendConfigEnable = { enable: true; chatId: number }
type GlobalSendConfigDisable = { enable: false }
type TgGlobalScopeCatcher = (
  config: GlobalSendConfigEnable | GlobalSendConfigDisable,
  options?: Options
) => Promise<void>

/* Error sender */

export const sendError: TgErrorSender = async (error, { chatId }) =>
  await fetch("https://telegramreports.onrender.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chatId,
      text: "```\n" + (error instanceof Error ? error.stack ?? error : error) + "\n```",
    }),
  })

/* Function scope */

export const functionScopeCatcher: TgFunctionScopeCatcher = async (
  fn,
  { chatId },
  options = { log: true, crash: true }
) => {
  const { log, crash } = options
  try {
    await fn()
  } catch (error) {
    if (log) console.error(error)
    await sendError(error, { chatId })
    if (crash) process.exit(1)
  }
}

/* Global scope */

const globalError = async ({ error, chatId }: { error: unknown; chatId: number }, { log, crash }: Options) => {
  if (log) console.error(error)
  await sendError(error, { chatId })
  if (crash) process.exit(1)
}

let unhandledRejectionHandler: (error: unknown) => Promise<void>
let uncaughtExceptionHandler: (error: unknown) => Promise<void>

export const globalScopeCatcher: TgGlobalScopeCatcher = async (config, options = { log: true, crash: true }) => {
  if (config.enable) {
    if (!config.chatId) throw new Error("chatId is required")
    const { chatId } = config
    unhandledRejectionHandler = (error) => globalError({ error, chatId }, options)
    uncaughtExceptionHandler = (error) => globalError({ error, chatId }, options)
    process.on("unhandledRejection", unhandledRejectionHandler)
    process.on("uncaughtException", uncaughtExceptionHandler)
  } else {
    process.removeListener("unhandledRejection", unhandledRejectionHandler)
    process.removeListener("uncaughtException", uncaughtExceptionHandler)
  }
}

export default { sendError, functionScopeCatcher, globalScopeCatcher }

/* Test zone */

// const chatId = 1419377014

// // error sender
// sendError(new Error("error sender"), { chatId })

// // function
// const fun = () => {
//   throw new Error("function scope error")
// }
// functionScopeCatcher(fun, { chatId }, { log: true, crash: false })

// // async function
// const asyncFun = async () => {
//   throw new Error("async function scope error")
// }
// functionScopeCatcher(asyncFun, { chatId }, { log: true, crash: false })

// // global
// globalScopeCatcher({ enable: true, chatId }, { log: true, crash: false }).then(async () => {
//   await globalScopeCatcher({ enable: false })
//   throw new Error("global scope error")
// })
