module.exports = (robot) ->

  # Simple message
  robot.hear /bot/, (res) ->
    res.send('Is me')

  # @ message
  robot.respond /bot/, (res) ->
    res.reply('I am here')
