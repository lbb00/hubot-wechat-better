@echo off

SETLOCAL
SET PATH = node_modules\.bin;node_modules\hubot\node_modules\.bin;%PATH%
SET PORT=8090

node_modules/.bin/hubot -a wechat-better %*
