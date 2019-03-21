const BotError = class extends Error {
  constructor(message = '', help = null) {
    super(message)
    Error.captureStackTrace(this, BotError)
    this.help = help
  }
  toString() {
    return this.help ? `Error: ${ this.message }\nNote: ${ this.help }` : `Error: ${ this.message }`
  }
}

module.exports = BotError
