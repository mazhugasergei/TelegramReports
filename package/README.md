# Telegram Reports

Telegram Reports catches errors and sends them to your Telegram.

## Get Started

In Telegram message to [@tgcatcherbot](https://t.me/tgcatcherbot) and get your ID (123456789 for example).

## Usage

### Message Sender

Use to manually send messages.

```js
sendMessage("message sender", { userId: 123456789 })
```

### Errors Sender

Use to manually send errors logs.

```js
const error = new Error("error sender")
sendError(error, { userId: 123456789 })
```

### Function Scope

Catch errors thrown in the top layer of a specific function. **Does not** include errors thrown by nested functions and async functions used without `await`, so remember to handle them.

```js
const fun = () => {
  throw new Error("function scope error")
}
functionScopeCatcher(fun, { userId: 123456789 }, { log: true, crash: false })
```

### Global Scope

Catches all unhandled errors/exceptions of the process.

```js
globalScopeCatcher({ userId: 123456789 }, { log: true, crash: false })
```
