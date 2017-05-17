
/*
Follow me on github: https://github.com/JacobTStaggs
Follow me on twitter: https://twitter.com/ShadyDaDev
Follow me on Twitch: https://twitch.tv/ShadyDaDev
S
 _______  _______  ______   _______    ______
(       )(  ___  )(  __  \ (  ____ \  (  ___ \ |\     /|
| () () || (   ) || (  \  )| (    \/  | (   ) )( \   / )
| || || || (___) || |   ) || (__      | (__/ /  \ (_) /
| |(_)| ||  ___  || |   | ||  __)     |  __ (    \   /
| |   | || (   ) || |   ) || (        | (  \ \    ) (
| )   ( || )   ( || (__/  )| (____/\  | )___) )   | |
|/     \||/     \|(______/ (_______/  |/ \___/    \_/

 _______           _______  ______
(  ____ \|\     /|(  ___  )(  __  \ |\     /|
| (    \/| )   ( || (   ) || (  \  )( \   / )
| (_____ | (___) || (___) || |   ) | \ (_) /
(_____  )|  ___  ||  ___  || |   | |  \   /
      ) || (   ) || (   ) || |   ) |   ) (
/\____) || )   ( || )   ( || (__/  )   | |
\_______)|/     \||/     \|(______/    \_/
*/

const SteamUser = require('steam-user')
const TradeOfferManager = require('steam-tradeoffer-manager');
const SteamCommunity = require('steamcommunity');
const SteamTotp = require('steam-totp');
const fs = require('fs');
const request = require('request');

const community = new SteamCommunity();
const client = new SteamUser();
const manager = new TradeOfferManager({
  steam: client,
  domain: 'Profit.gg',
  language: 'en'
});

//Things to edit below here

const editables = {
  accountInfo:{
    sharedSecret: 'sharedSecret', //Shared secret .MA file from the desktop auth
    identitySecret: 'identitySecret', //Identity secret from .ma file
    userName: 'userName', //Username to login WITH
    password: 'password', //Password to login WITH
    adminID: ['765611981214343220'], //AdminID, will be used to accept/send messages from/to adminID
    botName: "Shady's bot", //What you want your bot name to show as on steam-user
    game: 'Twitch.tv/ShadyDaDev', //What game you are playing
  },
  Messages:{
    donation: 'Thank you for the donation!', //Message sent to user when a donation is received.
    declinedMsg: 'Sorry cannot accept this trade since you requested one of my items.',
    acceptedFriend: 'Thanks for adding me, to get started just send me a trade with the items you want to donate.', //Message for new friends
    newDonation: 'I have received a new donation, please withdraw it from my account by sending me a trade.', //Message for new donations
    unknown: 'Error: Unknown command, type !commands if you want to see the list of commands.' //Message for unknown commands
  },
  commands:{
    '!help': 'To donate items send the item(s) to me, for me to accept I cannot be giving anything.',
    '!creator': 'twitch.tv/ShadyDaDev',
    '!commands': '!help, !creator'
  }
};

/*

(  __  \ (  ___  )  ( (    /|(  ___  )\__   __/
| (  \  )| (   ) |  |  \  ( || (   ) |   ) (
| |   ) || |   | |  |   \ | || |   | |   | |
| |   | || |   | |  | (\ \) || |   | |   | |
| |   ) || |   | |  | | \   || |   | |   | |
| (__/  )| (___) |  | )  \  || (___) |   | |
(______/ (_______)  |/    )_)(_______)   )_(

 _______  ______  __________________
(  ____ \(  __  \ \__   __/\__   __/
| (    \/| (  \  )   ) (      ) (
| (__    | |   ) |   | |      | |
|  __)   | |   | |   | |      | |
| (      | |   ) |   | |      | |
| (____/\| (__/  )___) (___   | |
(_______/(______/ \_______/   )_(

 ______   _______  _        _______
(  ___ \ (  ____ \( \      (  ___  )|\     /|
| (   ) )| (    \/| (      | (   ) || )   ( |
| (__/ / | (__    | |      | |   | || | _ | |
|  __ (  |  __)   | |      | |   | || |( )| |
| (  \ \ | (      | |      | |   | || || || |
| )___) )| (____/\| (____/\| (___) || () () |
|/ \___/ (_______/(_______/(_______)(_______)
*/

const logOnOptions = {
  accountName: editables.accountInfo.userName,
  password: editables.accountInfo.password,
  twoFactorCode: SteamTotp.generateAuthCode(editables.accountInfo.sharedSecret)
};

client.logOn(logOnOptions);

client.on('loggedOn', () => {
  console.log("You are logged in as: " + editables.accountInfo.userName);

  client.setPersona(SteamUser.Steam.EPersonaState.Online, editables.accountInfo.botName);
  client.gamesPlayed(editables.accountInfo.game);
})

client.on('webSession', (sessionid, cookies) => {
  manager.setCookies(cookies);

  community.setCookies(cookies);
  community.startConfirmationChecker(10000, editables.accountInfo.identitySecret);
});

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

client.on('friendRelationship', (steamid, relationship) => {
  if(relationship == 2){
    client.addFriend(steamid);
    client.chatMessage(steamid, editables.Messages.acceptedFriend);
  }
});

client.on('friendMessage', (steamid, message) => {
  console.log('New message from: ' +steamid + 'saying: ' +message);
  console.log(editables.commands[message]);
  if(editables.commands[message]){
    client.chatMessage(steamid, editables.commands[message]);
  }
  else{
    client.chatMessage(steamid, editables.Messages.unknown);
  }

});

function accept(offer){
  offer.accept((err) => {
    if(err) console.log('Unable to accept offer: ${err.message}');
    community.checkConfirmations();
  });
}

function decline(offer){
  offer.decline((err) => {
    if(err) return console.log('Unable to decline offer: ${err.message}');
  });
}

manager.on('newOffer', (offer) =>{
  const partnerID = offer.partner.getSteamID64();
  console.log('New offer: ' + offer.id +  ' from: ' + partnerID);

  if(isInArray(partnerID, editables.accountInfo.adminID)){
    console.log('Accepting offer from admin!');
      accept(offer);
  } else if(!offer.itemsToGive.length) {
    console.log('New donation from: ' + partnerID);
    client.chatMessage(editables.accountInfo.testID, 'New items in the bot send a trade offer for the items to withdraw');
    accept(offer);
  }
  else {
    console.log('Declining offer from: ' + partnerID);
    client.chatMessage(partnerID, editables.Messages.declinedMsg);
    decline(offer);
  }
});
