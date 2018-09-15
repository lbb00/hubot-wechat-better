module.exports = (robot) ->

  robot.hear /my bot/, (res) ->
    console.log 'hhhhhh'
    res.send('Is me')

  robot.respond /my bot/, (res) ->
    console.log 'hhhhhh'
    res.send('I am here')