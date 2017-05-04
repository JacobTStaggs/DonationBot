# DonationBot
Simple steam bot that accepts donations. Very simple to use and to edit. 

## Things needed:
* [Node.js and NPM](https://nodejs.org/en/)

### Things to install: 
* npm install steam-user
* npm install steamcommunity
* npm install steam-tradeoffer-manager

## Edit the file:
* Only edit lines 37-45
* To get the shared secret/ identity secret download [Steam Desktop authenticator](https://github.com/Jessecar96/SteamDesktopAuthenticator)
  and follow the guide there. ###### DO NOT ENCRPYT THE FILES.
* Login in there and find the .MA file. From there you can right click then edit with notepad++/sublime.
* Control + f and find the identiy secret and shared secret
* Enter those two into their respective field in the bot.js file.

### How to run locally on windows: 
* open up the node.js command line
* cd /pathtoyourdirectory
* node bot.js

