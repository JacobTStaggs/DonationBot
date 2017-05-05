
/*
Follow me on github: https://github.com/JacobTStaggs
Follow me on twitter: https://twitter.com/ShadyDaDev
Follow me on Twitch: https://twitch.tv/ShadyDaDev
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




const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');

const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
	steam: client,
	community: community,
	language: 'en'
});

const editables = {
	sharedSecret: 'shared_secret', //Shared Secret from .MA file
	identitySecret: 'identity_secret', //Identity Secret from .MA file
	userName: 'userName', //Username to login with
	adminID: ['76561198121434322'], //Your steam64 ID, you can add multiple just format it like this ["id1", "id2"]
	botName: 'New bot', //Name of the bot ex: ShadyDaDevs Donation Bot
	newFriendMsg: 'Hello there, I only accept trades where I receive items and do not send them. Need help? Type !help or !commands', //Message when added
	game: 'Whatever I wanna play', //Game your bot will be playing
	tradeMsg: 'Thanks for the donation! If you want a bot like me type !creator', //Message should send when you get a donation.. Did not test. 
	unknown: 'Error: Unknown command.', //Unknown command message when user sends a message that the bot doesn't recognize
	adminMsg: 'Hi admin, I will accept your offer so you can have my skins', //Message when you send the bot an offer(admin)
	commands: { //You can add as much as you like just make sure you keep the same format I have. 
		"!help": "To donate please just send me a trade offer with the items you want to give.",
		"!creator": "My creator is ShadyDaDev, you can find an open source of me here: https://github.com/JacobTStaggs/DonationBot",
		"!commands": "My commands are: !help, !creator",
		
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
	accountName: editables.userName,
	password: editables.password,
	twoFactorCode: SteamTotp.generateAuthCode(editables.sharedSecret)
};

client.logOn(logOnOptions);

client.on('loggedOn', () => {
	console.log('You are now logged in as: ' + editables.userName);

	client.setPersona(SteamUser.Steam.EPersonaState.Online, editables.botName);
	client.gamesPlayed(editables.game);
});

client.on('webSession', (sessionid, cookies) => {
	manager.setCookies(cookies);

	community.setCookies(cookies);
	community.startConfirmationChecker(10000, editables.identitySecret);
});

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

manager.on('newOffer', (offer) => {
	const partnerID = offer.partner.getSteamID64();
	console.log(`New offer # ${offer.id} from ${partnerID}`);
	if(isInArray(partnerID, editables.adminID)){
			client.chatMessage(partnerID, editables.adminMsg);
			offer.accept((err, status) => {
				if(err){
					console.log(err)
				}else{
					console.log('Automatically accepting the offer from the admin');
				}
});}
	 else if(offer.itemsToGive.length === 0) {
		offer.accept((err, status) => {
			if (err) {
				client.chatMessage(partnerID, editables.tradeMsg);
				console.log(err);
			} else {
				console.log(`Donation accepted. Status: ${status}.`);
				
				
			}
		});
	} else {
		offer.decline((err) => {
			if (err) {
				console.log(err);
			} else {
				console.log('Donation declined: User wanted our items..');
			}
		});
	}
});

client.on('friendRelationship', (steamid, relationship) => {
    if (relationship === 2) {
        client.addFriend(steamid);
        client.chatMessage(steamid, editables.newFriendMsg);
    }
});

client.on('friendMessage', (steamid, message) => {
	console.log(editables.commands[message]);
		if(editables.commands[message]){
			client.chatMessage(steamid, editables.commands[message]);
			
		}
		else{
			client.chatMessage(steamid, editables.unknown);
		}
});
