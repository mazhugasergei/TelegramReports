type Function = (...args: any[]) => Promise<any> | any
type Options = { log: boolean; crash: boolean }

type SendConfig = { userId: number }
type TgErrorSender = (error: unknown, config: SendConfig) => Promise<Response>
type TgFunctionScopeCatcher = (fn: Function, config: SendConfig, options?: Options) => Promise<void>

type GlobalSendConfigEnable = { enable: true; userId: number }
type GlobalSendConfigDisable = { enable: false }
type TgGlobalScopeCatcher = (
  config: GlobalSendConfigEnable | GlobalSendConfigDisable,
  options?: Options
) => Promise<void>

/* Error sender */

export const sendError: TgErrorSender = async (error, { userId }) =>
  await fetch("https://telegramreports.onrender.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      text: "```\n" + (error instanceof Error ? error.stack ?? error : error) + "\n```",
    }),
  })

/* Function scope */

export const functionScopeCatcher: TgFunctionScopeCatcher = async (
  fn,
  { userId },
  options = { log: true, crash: true }
) => {
  const { log, crash } = options
  try {
    await fn()
  } catch (error) {
    if (log) console.error(error)
    await sendError(error, { userId })
    if (crash) process.exit(1)
  }
}

/* Global scope */

const globalError = async ({ error, userId }: { error: unknown; userId: number }, { log, crash }: Options) => {
  if (log) console.error(error)
  await sendError(error, { userId })
  if (crash) process.exit(1)
}

let unhandledRejectionHandler: (error: unknown) => Promise<void>
let uncaughtExceptionHandler: (error: unknown) => Promise<void>

export const globalScopeCatcher: TgGlobalScopeCatcher = async (config, options = { log: true, crash: true }) => {
  if (config.enable) {
    if (!config.userId) throw new Error("userId is required")
    const { userId } = config
    unhandledRejectionHandler = (error) => globalError({ error, userId }, options)
    uncaughtExceptionHandler = (error) => globalError({ error, userId }, options)
    process.on("unhandledRejection", unhandledRejectionHandler)
    process.on("uncaughtException", uncaughtExceptionHandler)
  } else {
    process.removeListener("unhandledRejection", unhandledRejectionHandler)
    process.removeListener("uncaughtException", uncaughtExceptionHandler)
  }
}

export default { sendError, functionScopeCatcher, globalScopeCatcher }

/* Test zone */

const userId = 1419377014

// // error sender
// sendError(new Error("error sender"), { userId })

// // function
// const fun = () => {
//   throw new Error("function scope error")
// }
// functionScopeCatcher(fun, { userId }, { log: true, crash: false })

// // async function
// const asyncFun = async () => {
//   throw new Error("async function scope error")
// }
// functionScopeCatcher(asyncFun, { userId }, { log: true, crash: false })

// // global
// globalScopeCatcher({ enable: true, userId }, { log: true, crash: false })
// globalScopeCatcher({ enable: false })
// throw new Error("global scope error")
