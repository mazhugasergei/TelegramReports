# Telegram Catcher

Telegram Catcher is an [NPM package](http://npmjs.com/package/tgcatcher) that catches errors and sends them to your Telegram.

# Start

In Telegram find [@mazhugasergei_bot](https://t.me/mazhugasergei_bot) and get Chat ID (123456789 for example).

# Usage

## Function scope

Catch errors thrown inside a specific function.

```js
const main = () => {
  throw new Error("some error")
}

// OR

const main = async () => {
  throw new Error("some error")
}

// OR

const main = async () => {
  const fun = () => {
    throw new Error("some error")
  }
  fun()
}

// OR

const main = async () => {
  const fun = async () => {
    throw new Error("some error")
  }
  await fun()
}

// etc.

tgCatcher(main, { chatId: 123456789 })
```

## Global scope

Catches all unhandled errors/exceptions of the process.

```js
tgCatcher(() => {}, { chatId: 123456789, global: true })
```
