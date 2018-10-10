/**
 * Dota 2 module
 * @module Dota2
 */

/**
 * A Long class for representing a 64 bit two's-complement integer value 
 * derived from the Closure Library for stand-alone use and extended with unsigned support.
 * @external Long
 * @see {@link https://www.npmjs.com/package/long|long} npm package
 */

const steam = require("steam");
const { createLogger, format, transports } = require('winston');

const DOTA_APP_ID = 570;

var EventEmitter = require('events').EventEmitter,
    fs = require("fs"),
    util = require("util"),
    Long = require("long"),
    Protobuf = require('protobufjs'),
    Dota2 = exports;

Protobuf.parse.defaults.keepCase = true;

var folder = fs.readdirSync(__dirname + '/proto');

/**
 * Protobuf schema. See {@link http://dcode.io/protobuf.js/Root.html|Protobufjs#Root}. 
 * This object can be used to obtain special protobuf types.
 * Object types can be created by `Dota2.schema.lookupType("TypeName").encode(payload :Object).finish();`.
 * Enum types can be referenced by `Dota2.schema.lookupEnum("EnumName").values`, which returns an object array representing the enum.
 * @alias module:Dota2.schema
 */ 
Dota2.schema = Protobuf.loadSync(folder.map(filename => __dirname + '/proto/' + filename));

/**
 * The Dota 2 client that communicates with the GC
 * @class 
 * @alias module:Dota2.Dota2Client
 * @param {Object} steamClient - Node-steam client instance
 * @param {boolean} debug - Print debug information to console
 * @param {boolean} debugMore - Print even more debug information to console
 * @extends {EventEmitter} EventEmitter
 * @fires module:Dota2.Dota2Client#event:ready
 * @fires module:Dota2.Dota2Client#event:unhandled
 * @fires module:Dota2.Dota2Client#event:hellotimeout
 * @fires module:Dota2.Dota2Client#event:popup
 * @fires module:Dota2.Dota2Client#event:sourceTVGamesData
 * @fires module:Dota2.Dota2Client#event:inventoryUpdate
 * @fires module:Dota2.Dota2Client#event:practiceLobbyUpdate
 * @fires module:Dota2.Dota2Client#event:practiceLobbyCleared
 * @fires module:Dota2.Dota2Client#event:lobbyInviteUpdate
 * @fires module:Dota2.Dota2Client#event:lobbyInviteCleared
 * @fires module:Dota2.Dota2Client#event:practiceLobbyJoinResponse
 * @fires module:Dota2.Dota2Client#event:practiceLobbyListData
 * @fires module:Dota2.Dota2Client#event:practiceLobbyResponse
 * @fires module:Dota2.Dota2Client#event:lobbyDestroyed
 * @fires module:Dota2.Dota2Client#event:friendPracticeLobbyListData
 * @fires module:Dota2.Dota2Client#event:inviteCreated
 * @fires module:Dota2.Dota2Client#event:partyUpdate
 * @fires module:Dota2.Dota2Client#event:partyCleared
 * @fires module:Dota2.Dota2Client#event:partyInviteUpdate
 * @fires module:Dota2.Dota2Client#event:partyInviteCleared
 * @fires module:Dota2.Dota2Client#event:joinableCustomGameModes
 * @fires module:Dota2.Dota2Client#event:chatChannelsData
 * @fires module:Dota2.Dota2Client#event:chatJoin
 * @fires module:Dota2.Dota2Client#event:chatJoined
 * @fires module:Dota2.Dota2Client#event:chatLeave
 * @fires module:Dota2.Dota2Client#event:chatMessage
 * @fires module:Dota2.Dota2Client#event:profileCardData
 * @fires module:Dota2.Dota2Client#event:profileCardUpdate
 * @fires module:Dota2.Dota2Client#event:playerMatchHistoryData
 * @fires module:Dota2.Dota2Client#event:playerInfoData
 * @fires module:Dota2.Dota2Client#event:playerStatsData
 * @fires module:Dota2.Dota2Client#event:trophyListData
 * @fires module:Dota2.Dota2Client#event:hallOfFameData
 * @fires module:Dota2.Dota2Client#event:playerCardRoster
 * @fires module:Dota2.Dota2Client#event:playerCardDrafted
 * @fires module:Dota2.Dota2Client#event:liveLeagueGamesUpdate
 * @fires module:Dota2.Dota2Client#event:leagueData
 * @fires module:Dota2.Dota2Client#event:topLeagueMatchesData
 * @fires module:Dota2.Dota2Client#event:teamData
 * @fires module:Dota2.Dota2Client#event:matchesData
 * @fires module:Dota2.Dota2Client#event:matchDetailsData
 * @fires module:Dota2.Dota2Client#event:matchMinimalDetailsData
 * @fires module:Dota2.Dota2Client#event:matchmakingStatsData
 * @fires module:Dota2.Dota2Client#event:topFriendMatchesData
 * @fires module:Dota2.Dota2Client#event:tipResponse
 * @fires module:Dota2.Dota2Client#event:tipped
 */
Dota2.Dota2Client = function Dota2Client(steamClient, debug, debugMore) {
    EventEmitter.call(this);
    this.debug = debug || false;
    this.debugMore = debugMore || false;
    
    /**
     * The logger used to write debug messages. This is a WinstonJS logger, 
     * feel free to configure it as you like
     * @type {winston.Logger}
     */
    this.Logger = createLogger({
        transports: [new transports.Console()],
        format: format.combine(
            format.colorize(),
            format.timestamp({
                format: 'D MMM HH:mm:ss'
            }),
            format.printf(nfo => {
                return `${nfo.timestamp} - ${nfo.message}`
            })
        )
    });
    if(debug) this.Logger.level = "debug";
    if(debugMore) this.Logger.level = "silly";
    
    /** The current state of the bot's inventory. Contains cosmetics, player cards, ... 
     * @type {CSOEconItem[]} 
     */
    this.Inventory = [];
    /** The chat channels the bot has joined 
     * @type {CMsgDOTAJoinChatChannelResponse[]}
     */
    this.chatChannels = []; // Map channel names to channel data.
    /** The lobby the bot is currently in. Falsy if the bot isn't in a lobby. 
     * @type {CSODOTALobby}
     */
    this.Lobby = null;
    /** The currently active lobby invitation. Falsy if the bot has not been invited. 
     * @type {CSODOTALobbyInvite}
     */
    this.LobbyInvite = null;
    /** The party the bot is currently in. Falsy if the bot isn't in a party.
    * @type {CSODOTAParty}
    */
    this.Party = null;
    /** The currently active party invitation. Falsy if the bot has not been invited.
     * @type {CSODOTAPartyInvite}
     */
    this.PartyInvite = null;

    var steamUser = new steam.SteamUser(steamClient);
    this._user = steamUser;
    this._client = steamClient;
    this._gc = new steam.SteamGameCoordinator(steamClient, DOTA_APP_ID);
    this._appid = DOTA_APP_ID;
    
    this._gcReady = false;
    this._gcClientHelloIntervalId = null;
    this._gcConnectionStatus = Dota2.schema.lookupEnum("GCConnectionStatus").values.GCConnectionStatus_NO_SESSION;
    // node-steam wants this as a simple object, so we can't use CMsgProtoBufHeader
    this._protoBufHeader = {
        "msg": "",
        "proto": {
            "client_steam_id": this._client.steamID,
            "source_app_id": this._appid
        }
    };

    var self = this;
    this._gc.on("message", function fromGC(header, body, callback) {
        /* Routes messages from Game Coordinator to their handlers. */
        callback = callback || null;

        var kMsg = header.msg;
        self.Logger.silly("Dota2 fromGC: " + Dota2._getMessageName(kMsg));

        if (kMsg in self._handlers) {
            if (callback) {
                self._handlers[kMsg].call(self, body, callback);
            } else {
                self._handlers[kMsg].call(self, body);
            }
        } else {
            self.emit("unhandled", kMsg, Dota2._getMessageName(kMsg));
        }
    });

    this._sendClientHello = function() {
        if (self._gcReady) {
            if (self._gcClientHelloIntervalId) {
                clearInterval(self._gcClientHelloIntervalId);
                self._gcClientHelloIntervalId = null;
            }
            return;
        }
        if (self._gcClientHelloCount > 10) {
            self.Logger.warn("ClientHello has taken longer than 30 seconds! Reporting timeout...")
            self._gcClientHelloCount = 0;
            self.emit("hellotimeout");
        }
        
        self.Logger.debug("Sending ClientHello");
        
        if (!self._gc) {
            self.Logger.error("Where the fuck is _gc?");
        } else {
            self._protoBufHeader.msg = Dota2.schema.lookupEnum("EGCBaseClientMsg").values.k_EMsgGCClientHello;
            var payload = {
                engine : 1,
                secret_key : "",
                client_session_need : 104
            };
            self._gc.send(
                self._protoBufHeader,
                Dota2.schema.lookupType("CMsgClientHello").encode(payload).finish()
            );
        }

        self._gcClientHelloCount++;
    };
};
util.inherits(Dota2.Dota2Client, EventEmitter);

// Methods
/**
 * Converts a 64bit Steam ID to a Dota2 account ID by deleting the 32 most significant bits
 * @alias module:Dota2.Dota2Client.ToAccountID
 * @param {string} steamID - String representation of a 64bit Steam ID
 * @returns {number} Dota2 account ID corresponding with steamID
 */
Dota2.Dota2Client.prototype.ToAccountID = function(steamID) {
    return new Long.fromString(""+steamID).sub('76561197960265728').toNumber();
};
/**
 * Converts a Dota2 account ID to a 64bit Steam ID
 * @alias module:Dota2.Dota2Client.ToSteamID
 * @param {string} accid - String representation of a Dota 2 account ID
 * @returns {external:Long} 64bit Steam ID corresponding to the given Dota 2 account ID
 */
Dota2.Dota2Client.prototype.ToSteamID = function(accid) {
    return new Long.fromString(accid+"").add('76561197960265728');
};
/**
 * Reports to Steam that you're playing Dota 2, and then initiates communication with the Game Coordinator.
 * @alias module:Dota2.Dota2Client#launch
 */
Dota2.Dota2Client.prototype.launch = function() {
    /* Reports to Steam that we are running Dota 2. Initiates communication with GC with EMsgGCClientHello */
    this.Logger.debug("Launching Dota 2");
    
    this.AccountID = this.ToAccountID(this._client.steamID);
    this.Party = null;
    this.Lobby = null;
    this.PartyInvite = null;
    this.Inventory = [];
    this.chatChannels = [];
    this._user.gamesPlayed([{
        "game_id": this._appid
    }]);

    // Keep knocking on the GCs door until it accepts us.
    // This is very bad practice and quite trackable.
    // The real client tends to send only one of these.
    // Really we should just send one when the connection status is GC online
    this._gcClientHelloCount = 0;
    this._gcClientHelloIntervalId = setInterval(this._sendClientHello, 6000);

    //Also immediately send clienthello
    setTimeout(this._sendClientHello, 1000);
};
/**
 * Stop sending a heartbeat to the GC and report to steam you're no longer playing Dota 2
 * @alias module:Dota2.Dota2Client#exit
 */
Dota2.Dota2Client.prototype.exit = function() {
    /* Reports to Steam we are not running any apps. */
    this.Logger.debug("Exiting Dota 2");

    /* stop knocking if exit comes before ready event */
    if (this._gcClientHelloIntervalId) {
        clearInterval(this._gcClientHelloIntervalId);
        this._gcClientHelloIntervalId = null;
    }
    this._gcReady = false;

    if (this._client.loggedOn) this._user.gamesPlayed([]);
};

Dota2.Dota2Client.prototype.sendToGC = function(type, payload, handler, callback) {
    var self = this;
    if (!this._gcReady) {
        this.Logger.warn("GC not ready, please listen for the 'ready' event.");
        if (callback) callback(-1, null);                   // notify user that something went wrong
        return null;
    }
    this._protoBufHeader.msg = type;
    this._gc.send(this._protoBufHeader,                     // protobuf header, same for all messages
                  payload,                                  // payload of the message
                  Dota2._convertCallback.call(self, handler, callback) // let handler treat callback so events are triggered
    );
}

// Events
/**
 * Emitted when the connection with the GC has been established 
 * and the client is ready to take requests.
 * @event module:Dota2.Dota2Client#ready
 */
/**
 * Emitted when the GC sends a message that isn't yet treated by the library.
 * @event module:Dota2.Dota2Client#unhandled
 * @param {number} kMsg - Proto message type ID
 * @param {string} kMsg_name - Proto message type name
 */
/**
 * Emitted when the connection with the GC takes longer than 30s
 * @event module:Dota2.Dota2Client#hellotimeout
 */

// Handlers

var handlers = Dota2.Dota2Client.prototype._handlers = {};

handlers[Dota2.schema.lookupEnum("EGCBaseClientMsg").values.k_EMsgGCClientWelcome] = function clientWelcomeHandler(message) {
    /* Response to our k_EMsgGCClientHello, now we can execute other GC commands. */

    // Only execute if _gcClientHelloIntervalID, otherwise it's already been handled (and we don't want to emit multiple 'ready');
    if (this._gcClientHelloIntervalId) {
        clearInterval(this._gcClientHelloIntervalId);
        this._gcClientHelloIntervalId = null;
    }

    this.Logger.debug("Received client welcome.");

    // Parse any caches
    this._gcReady = true;
    //this._handleWelcomeCaches(message);
    this.emit("ready");
};

handlers[Dota2.schema.lookupEnum("EGCBaseClientMsg").values.k_EMsgGCClientConnectionStatus] = function gcClientConnectionStatus(message) {
    /* Catch and handle changes in connection status, cuz reasons u know. */
    var status = Dota2.schema.lookupType("CMsgConnectionStatus").decode(message).status;
    if (status) this._gcConnectionStatus = status;

    switch (status) {
        case Dota2.schema.lookupEnum("GCConnectionStatus").values.GCConnectionStatus_HAVE_SESSION:
            this.Logger.debug("GC Connection Status regained.");

            // Only execute if _gcClientHelloIntervalID, otherwise it's already been handled (and we don't want to emit multiple 'ready');
            if (this._gcClientHelloIntervalId) {
                clearInterval(this._gcClientHelloIntervalId);
                this._gcClientHelloIntervalId = null;

                this._gcReady = true;
                this.emit("ready");
            }
            break;

        default:
            this.Logger.debug("GC Connection Status unreliable - " + status);

            // Only execute if !_gcClientHelloIntervalID, otherwise it's already been handled (and we don't want to emit multiple 'unready');
            if (!this._gcClientHelloIntervalId) {
                this._gcClientHelloIntervalId = setInterval(this._sendClientHello, 5000); // Continually try regain GC session

                this._gcReady = false;
                this.emit("unready");
            }
            break;
    }
};


require("./handlers/cache");
require("./handlers/inventory");
require("./handlers/chat");
require("./handlers/guild");
require("./handlers/community");
require("./handlers/helper");
require("./handlers/match");
require("./handlers/lobbies");
require("./handlers/parties");
require("./handlers/leagues");
require("./handlers/sourcetv");
require("./handlers/team");
require("./handlers/custom");
require("./handlers/general");
require("./handlers/fantasy");
require("./handlers/compendium");