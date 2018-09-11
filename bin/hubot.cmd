@echo off

SETLOCAL
SET PATH = node_modules\.bin;node_modules\hubot\node_modules\.bin;%PATH%

::config
SET ADMINER_EMAIL=youremail@example.com

node_modules/.bin/hubot -a wechat-better --name bot %*
