
/*
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
	password: 'password', //Password to login with
	botName: 'name_for_bot', //Name you want for your bot
	newFriendMsg: 'Hello there, I only accept trades where I receive items and do not send them. My creator is: http://steamcommunity.com/profiles/76561198121434322/', //Message for a user when they send a fr
	game: 'Whatever I wanna play' //Custom game the bot is playing
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

manager.on('newOffer', (offer) => {
	if (offer.itemsToGive.length === 0) {
		offer.accept((err, status) => {
			if (err) {
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

