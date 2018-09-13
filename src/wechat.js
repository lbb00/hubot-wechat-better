
// Wechat Bot: https://github.com/nodeWechat/wechat4u

const { Adapter, TextMessage, CatchAllMessage, User } = require('hubot/es2015')
const WechatBot = require('wechat4u')
const fs = require('fs')
const path = require('path')
const qrcodeTerminal = require('qrcode-terminal')
const botemail = require('./botemail')

// get adminer email
let ADMINER_EMAIL
try {
  ADMINER_EMAIL = require(path.resolve(process.cwd(), './bot.config.js')).adminerEmail
} catch (e) {
  ADMINER_EMAIL = ''
}

class WechatAdapter extends Adapter {
  constructor () {
    super(...arguments)

    // config
    this.ADMINER_EMAIL = process.env['ADMINER_EMAIL'] || ''
  }

  run (...args) {
    this.wechatBotRun(...args)
  }

  send (envelope, ...strings) {
    const text = strings.join()
    let bot = this.wechatBot
    bot.sendMsg(text, envelope.user._id)
      .then(res => {
        this.robot.logger.info(`Sending message to room: ${envelope.room}`)
      })
      .catch(err => {
        this.robot.logger.error(`Sending message to room: ${envelope.room} ${err}`)
      })
  }

  replay (envelope, ...strings) {
    this.send(envelope, ...strings)
  }

  /**
   * Sending messages proactively
   *
   *
   * @param {any} msg
   * @param {any} [{ rule, type = 'all'|'group'|'friend', reg = true, once = false }={}]
   * @memberof WechatAdapter
   */
  call (msg, { rule, type = 'all', reg = true, once = false } = {}) {
    let contacts = this.wechatBot.contacts
    let envelopes = []

    let ids = Object.keys(contacts)

    // Filter ids by type, and exclude official accounts.
    switch (type) {
      case 'group':
        ids = ids.filter(id => id.match(/^@@/) && contacts[id].isPublicContact())
        break
      case 'friend':
        ids = ids.filter(id => !id.match(/^@@/) && contacts[id].isPublicContact())
    }

    if (rule === undefined || rule === null) {
      ids.map(id => {
        let roomName = contacts[id].getDisplayName()
        envelopes.push({ room: roomName, user: { _id: id } })
      })
    } else {
      let matcher = typeof rule === 'function' ? rule : roomName => {
        return reg ? roomName.match(rule) : roomName === rule
      }

      let len = ids.length
      while (len--) {
        let id = ids[len]
        let roomName = contacts[id].getDisplayName()
        if (matcher(roomName)) {
          envelopes.push({ room: roomName, user: { _id: id } })
          if (once) break
        }
      }
    }

    envelopes.map(i => {
      this.robot.logger.info(`Sending message proactively to: ${i.room}.`)
      this.send(i, msg)
    })
  }

  wechatBotRun ({ reRun } = {}) {
    // init wechat bot
    if (!reRun) {
      try {
        this.wechatBot = new WechatBot(require(path.resolve(process.cwd(), './loginToken.json')))
        this.wechatBot.on('error', e => {
          if (e.tips === '微信初始化失败') {
            this.wechatBotRun({ reRun: true })
          } else {
            this.robot.logger.error(e)
          }
        })
      } catch (e) {
        this.wechatBot = new WechatBot()
      }
    } else {
      this.wechatBot = new WechatBot()
    }

    // start
    if (this.wechatBot.PROP.uin) {
      this.wechatBot.restart()
    } else {
      this.wechatBot.start()
    }

    // bind event
    this.wechatBot.on('uuid', this.qrcodeLogin.bind(this))
    this.wechatBot.on('login', () => {
      this.emit('connected')
      this.robot.logger.info(`Wechat Bot Login Successed...`)

      // catch login file
      fs.writeFileSync(path.resolve(process.cwd(), './loginToken.json'), JSON.stringify(this.wechatBot.botData))

      this.wechatBot.on('message', this.handlerMessage.bind(this))
    })
    this.wechatBot.on('error', err => {
      this.robot.logger.error(err)
    })

    this.robot.logger.info(`Wechat Bot Adapter Started...`)
  }

  createUser (contact, msg) {
    let opts, targetUser
    opts = {
      room: contact.getDisplayName(msg.FromUserName), // Get the real name.
      _id: msg.FromUserName // User it when reply message.
    }

    if (msg.FromUserName.match(/^@@/)) {
      // Get target user from  message of group.
      targetUser = msg.Content.slice(0, msg.Content.indexOf(':'))
      opts.id = targetUser
      opts.name = targetUser
    } else {
      targetUser = contact.getDisplayName()
      opts.id = targetUser
      opts.name = targetUser
    }
    return new User(msg.FromUserName, opts)
  }

  handlerMessage (msg) {
    let bot = this.wechatBot
    let contact = bot.contacts[msg.FromUserName]

    // Exclude bot's self and official accounts.
    if (contact.isSelf || contact.isPublicContact()) return

    let user = this.createUser(contact, msg)
    switch (msg.MsgType) {
      case bot.CONF.MSGTYPE_TEXT:
        this.robot.logger.info(user.name)
        this.receive(new TextMessage(user, msg.Content, msg.MsgId))
        return
      case bot.CONF.MSGTYPE_IMAGE:
        this.robot.logger.debug('图片消息')
        break
      case bot.CONF.MSGTYPE_VOICE:
        this.robot.logger.debug('语音消息')
        break
      case bot.CONF.MSGTYPE_EMOTICON:
        this.robot.logger.debug('表情消息')
        break
      case bot.CONF.MSGTYPE_VIDEO:
      case bot.CONF.MSGTYPE_MICROVIDEO:
        this.robot.logger.debug('视频消息')
        break
      case bot.CONF.MSGTYPE_APP:
        this.robot.logger.debug('文件消息')
        break
      default:
        this.receive(new CatchAllMessage(user, msg.Content, msg.MsgId))
        break
    }
  }

  qrcodeLogin (uuid) {
    let imageUrl = 'https://login.weixin.qq.com/qrcode/' + uuid // image
    let terminalUrl = 'https://login.weixin.qq.com/l/' + uuid // wechat scan url, only be used once

    // terminal
    qrcodeTerminal.generate(terminalUrl, {
      small: true
    }, (qrcode) => {
      this.robot.logger.info('\n' + qrcode)
    })

    // email
    botemail.send({
      to: ADMINER_EMAIL,
      subject: 'hubot 微信机器人扫码登录',
      html: `二维码:<br/><img src="${imageUrl}" />`
    }).then(res => {
      this.robot.logger.info('Email send login qrcode successed!')
    }).catch(e => {
      this.robot.logger.error(`Email send login qrcode error: ${e}`)
    })
  }
}
exports.use = robot => new WechatAdapter(robot)
