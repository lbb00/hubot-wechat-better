# hubot-wechat-better

[![Build Status](https://travis-ci.org/loveonelong/hubot-wechat-better.svg?branch=master)](https://travis-ci.org/loveonelong/hubot-wechat-better)
[![Greenkeeper badge](https://badges.greenkeeper.io/loveonelong/hubot-wechat-better.svg)](https://greenkeeper.io/)
![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)
[![Version](https://img.shields.io/npm/v/hubot-wechat-better.svg)](https://www.npmjs.com/package/hubot-wechat-better)
[![Github All Releases](https://img.shields.io/npm/dt/hubot-wechat-better.svg)](https://www.npmjs.com/package/hubot-wechat-better)

Adapt with hubot using wechat robot [wechat4u](https://github.com/nodeWechat/wechat4u).

## Support

* nodejs 8+
* hubot 3+

## Usage

The bot will automatically use the nickname of WeChat.

### Install

```bash
npm install hubot-wechat-better
```

### Configuration

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

### Run

Use `hubot -a wechat-better` to start bot in your hubot porject.

## Example

You can look `scripts/example.js`

## Development

The first, you need clone this repo to your local.

- install modules

```bash
npm install
```

- link

```bash
npm run link
```

- run example

```bash
npm start
```

## Test

```bash
npm run test
```