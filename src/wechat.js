
// Wechat Bot: https://github.com/nodeWechat/wechat4u

const { Adapter, TextMessage, CatchAllMessage, User } = require('hubot/es2015')
const { Wechaty } = require('wechaty')
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
    this.msgId = 0
  }

  run (...args) {
    this.wechatBot = new Wechaty({
      puppet: 'wechaty-puppet-wechat4u'
    })
    this.wechatBot.on('scan', this.loginWithQrcode.bind(this))
    this.wechatBot.on('login', this.loginedHandler.bind(this))
    this.wechatBot.on('message', this.messageHandler.bind(this))
    this.wechatBot.on('error', this.errorHandler.bind(this))
    this.wechatBot.start()
  }

  async send (envelope, ...strings) {
    let contact = await this.wechatBot.Contact.find({ name: envelope.room })
    const text = strings.join()
    contact.say(text)
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
        ids = ids.filter(id => id.match(/^@@/) && !this.wechatBot.Contact.isPublicContact(contacts[id]))
        break
      case 'friend':
        ids = ids.filter(id => !id.match(/^@@/) && !this.wechatBot.Contact.isPublicContact(contacts[id]))
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

  createUser (contact, msg) {
    let username = contact.name()
    let opts = {
      room: msg.room() || username, // Get the real name.
      id: username,
      name: username
    }
    console.log(opts)
    return new User(msg.FromUserName, opts)
  }

  loginedHandler (user) {
    this.robot.logger.info(`User ${user} logined`)
    this.emit('connected')
  }

  messageHandler (msg) {
    let bot = this.wechatBot
    let contact = msg.from()

    // Exclude bot's self and official accounts.
    if (msg.self() || contact.type() === this.wechatBot.Contact.Type.Official) return
    console.log(msg)

    let user = this.createUser(contact, msg)
    switch (msg.type()) {
      case bot.Message.Type.Text:
        this.robot.logger.info('文本消息')
        console.log(user)
        this.receive(new TextMessage(user, msg.payload.text, this.msgId++))
        break
      case bot.Message.Type.Image:
        this.robot.logger.info('图片消息')
        break
      case bot.Message.Type.Audio:
        this.robot.logger.info('语音消息')
        break
      case bot.Message.Type.Emoticon:
        this.robot.logger.info('表情消息')
        break
      case bot.Message.Type.Video:
        this.robot.logger.info('视频消息')
        break
      case bot.Message.Type.Url:
        this.robot.logger.info('文件消息')
        break
      default:
        // this.receive(new CatchAllMessage(user, msg.Content, msg.MsgId))
        break
    }
  }

  loginWithQrcode (triggerLoginUrl, status) {
    let uuid = triggerLoginUrl.replace('https://login.weixin.qq.com/l/')

    // https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(uuid)}
    let qrcodeImageUrl = 'https://login.weixin.qq.com/qrcode/' + uuid // image

    this.robot.logger.info(`Scan QR Code to login: ${status}`)

    // terminal
    qrcodeTerminal.generate(triggerLoginUrl, {
      small: true
    }, (qrcode) => {
      this.robot.logger.info('\n' + qrcode)
    })

    // email
    botemail.send({
      to: ADMINER_EMAIL,
      subject: '微信机器人扫码登录',
      html: `二维码:<br/><img src="${qrcodeImageUrl}" />`
    }).then(res => {
      this.robot.logger.info('Email send login qrcode successed!')
    }).catch(e => {
      this.robot.logger.error(`Email send login qrcode error: ${e}`)
    })
  }

  errorHandler (error) {
    this.robot.logger.error(error)
  }
}
exports.use = robot => new WechatAdapter(robot)
