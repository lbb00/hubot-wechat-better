module.exports = (robot) ->

  robot.hear /my bot/, (res) ->
    res.send('Is me')

  robot.respond /my bot/, (res) ->
    res.send('I am here')