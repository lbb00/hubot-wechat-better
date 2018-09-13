const path = require('path')

// https://nodemailer.com/usage/
const nodemailer = require('nodemailer')

// botemail config
// botemail: {
//   host: 'smtp.example.email',
//   port: 587,
//   secure: false, // true for 465, false for other ports
//   auth: {
//       user: 'user', // user
//       pass: 'pass' // password
//   }
// }

// send options
// options: {
//   from: '"Fred Foo 👻" <foo@example.com>', // sender address
//   to: 'bar@example.com, baz@example.com', // list of receivers
//   subject: 'Hello ✔', // Subject line
//   text: 'Hello world?', // plain text body
//   html: '<b>Hello world?</b>' // html body
// }

class BotEmail {
  constructor () {
    let botConfig = require(path.resolve(process.cwd(), './bot.config.js'))
    this.emailConfig = Object.assign({}, {
      host: 'smtp.exmail.qq.com',
      secure: true // true for 465, false for other ports
    }, botConfig.botemail)
    this.transporter = nodemailer.createTransport(this.emailConfig)
  }

  send (opts) {
    return new Promise((resolve, reject) => {
      opts = Object.assign({}, {
        from: this.emailConfig.auth.user,
        to: '',
        subject: '',
        text: '',
        html: ''
      }, opts)

      this.transporter.sendMail(opts, (error, info) => {
        if (error) {
          return reject(error)
        }
        resolve(info)
      })
    })
  }
}

module.exports = new BotEmail()
