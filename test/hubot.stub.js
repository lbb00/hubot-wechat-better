// Create a basic Hubot stub object so
// we don't have to include the Hubot dependency
// in our tests

// Function that does/return nothing
var voidFunc = function () {
}

module.exports = {
  name: 'TestBot',
  alias: 'TestAliasBot',
  logger: {
    info: voidFunc,
    warning: voidFunc,
    error: voidFunc,
    debug: voidFunc
  },
  brain: {}
}
