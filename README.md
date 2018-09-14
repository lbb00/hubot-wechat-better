# hubot-wechat-better

[![Build Status](https://travis-ci.org/loveonelong/hubot-wechat-better.svg?branch=master)](https://travis-ci.org/loveonelong/hubot-wechat-better) [![Greenkeeper badge](https://badges.greenkeeper.io/loveonelong/hubot-wechat-better.svg)](https://greenkeeper.io/)

Adapt with hubot using wechat robot [wechat4u](https://github.com/nodeWechat/wechat4u).

## Configuration

You need add a `bot.config.js` in your root filder of bot project. It must to export a json config.

```javascript
{
  botemail: {
    host: 'smtp.example.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'user', // 'user@example.com'
        pass: 'password'
    }
  },
  adminerEmail: 'admin@example.com'
}
```

## Development

First, you need clone this repo to your local.

install package

```bash
npm install
```

link

```bash
npm run link
```

run

```bash
npm start
```

or

```bash
bin/hubot
```

## Test

```bash
npm run test
```