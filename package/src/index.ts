type Function<T = unknown> = (...args: any[]) => Promise<T> | T

export default { sendMessage, sendError, functionScopeCatcher, globalScopeCatcher }

const api = "https://telegramreports.onrender.com"

export function sendMessage(text: string, config: { userId: number }) {
  const { userId } = config
  return fetch(api, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, text }),
  })
}

/* Error sender */

export function sendError(error: unknown, config: { userId: number }) {
  const { userId } = config
  return fetch(api, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      text: "```\n" + (error instanceof Error ? error.stack ?? error : error) + "\n```",
    }),
  })
}

/* Function scope */

export async function functionScopeCatcher<T = unknown>(
  fn: Function<T>,
  config: { userId: number },
  options: { log: boolean; crash: boolean } = { log: true, crash: true }
) {
  const { log, crash } = options
  try {
    return await fn()
  } catch (error) {
    if (log) console.error(error)
    await sendError(error, config)
    if (crash) process.exit(1)
  }
}

/* Global scope */

const globalError = async (
  { error, userId }: { error: unknown; userId: number },
  { log, crash }: { log: boolean; crash: boolean }
) => {
  if (log) console.error(error)
  await sendError(error, { userId })
  if (crash) process.exit(1)
}

let unhandledRejectionHandler: (error: unknown) => Promise<void>
let uncaughtExceptionHandler: (error: unknown) => Promise<void>

export async function globalScopeCatcher(
  config: { userId: number },
  options: { log: boolean; crash: boolean } = { log: true, crash: true }
) {
  const { userId } = config
  unhandledRejectionHandler = (error) => globalError({ error, userId }, options)
  uncaughtExceptionHandler = (error) => globalError({ error, userId }, options)
  process.on("unhandledRejection", unhandledRejectionHandler)
  process.on("uncaughtException", uncaughtExceptionHandler)
}

/* Test zone */

// const userId = 1419377014

// // message sender
// sendMessage("message sender", { userId })

// // error sender
// sendError(new Error("error sender"), { userId })

// // function
// const fun = () => {
//   throw new Error("function scope error")
// }
// functionScopeCatcher<string>(fun, { userId }, { log: true, crash: false }).then(console.log)

// // async function
// const asyncFun = async () => {
//   throw new Error("async function scope error")
// }
// functionScopeCatcher(asyncFun, { userId }, { log: true, crash: false })

// // global
// globalScopeCatcher({ userId }, { log: true, crash: false })
