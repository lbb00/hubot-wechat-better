module.exports = robot => {
  // General message
  robot.hear(/bot/, res => {
    res.send('Is me.')
  })

  // The message with mentioned your wechat bot
  robot.respond(/bot/, res => {
    res.reply('I am here.')
  })

  // If you want to use the following example, you must have learned the webhook of the hubot.

  /**
   * Push message
   */
  robot.router.post('/push', (req, res) => {
    // Adapter.push(message, config)
    //
    // message - string
    // config - [{ rule, type = 'all'|'group'|'friend', reg = true}={}]
    robot.adapter.push(`${new Date()} This is a push.`, {
      rule: name => {
        return name.match('文件传输助手')
      }
    }).then(msg => {
      res.send({ code: 0, err_msg: '' })
    }).catch(err => {
      res.send({ code: -1, err_msg: `Error: ${err}` })
    })
  })

  /**
   * Restart wechatbot
   */
  robot.router.post('/restart', (req, res) => {
    robot.adapter.restart()
      .then(msg => {
        res.send({ code: 0, err_msg: '' })
      })
      .catch(err => {
        res.send({ code: -1, err_msg: `Error: ${err}` })
      })
  })
}
