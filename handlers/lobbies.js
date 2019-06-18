var Dota2 = require("../index");

Dota2._lobbyOptions = {
    game_name: "string",
    pass_key: "string",
    server_region: "number",
    game_mode: "number",
    game_version: "number",
    cm_pick: "number",
    allow_cheats: "boolean",
    fill_with_bots: "boolean",
    bot_difficulty_radiant: "number",
    bot_difficulty_dire: "number",
    bot_radiant: "number",
    bot_dire: "number",
    allow_spectating: "boolean",
    series_type: "number",
    radiant_series_wins: "number",
    dire_series_wins: "number",
    previous_match_override: "number",
    allchat: "boolean",
    dota_tv_delay: "number",
    leagueid: "number",
    custom_game_mode: "string",
    custom_map_name: "string",
    custom_difficulty: "number",
    custom_game_id: "number",
    pause_setting: "number",
    custom_min_players: "number",
	custom_max_players: "number"
};

/**
 * @typedef {Object} module:Dota2.Dota2Client#Lobby.Options
 * 
 * @property {string} game_name - Name of the lobby
 * 
 * @property {string} pass_key - Lobby password
 * 
 * @property {module:Dota2.ServerRegion} [server_region=module:Dota2.ServerRegion.UNSPECIFIED] - Server region where the lobby will be created
 * 
 * @property {DOTA_GameMode} [game_mode=DOTA_GameMode.DOTA_GAMEMODE_AP] - Game mode
 * 
 * @property {DOTAGameVersion} [game_version=DOTAGameVersion.GAME_VERSION_STABLE] - Version of the game
 * 
 * @property {DOTA_CM_PICK} [cm_pick=DOTA_CM_PICK.DOTA_CM_RANDOM] - Who gets first pick
 * 
 * @property {boolean} [allow_cheats=false] - Whether or not to allow cheats
 * 
 * @property {boolean} [fill_with_bots=false] - Whether or not to fill empty slots with bots
 * 
 * @property {BotDifficulty} [bot_difficulty_radiant=module:Dota2.schema.DOTABotDifficulty.BOT_DIFFICULTY_PASSIVE] - The bot difficulty for radiant bots, if fill_with_bots is true.
 *
 * @property {BotDifficulty} [bot_difficulty_dire=module:Dota2.schema.DOTABotDifficulty.BOT_DIFFICULTY_PASSIVE] - The bot difficulty for dire bots, if fill_with_bots is true.
 *
 * @property {number} [bot_radiant] - Presumably the ID of the custom AI to be applied to radiant bots.
 *
 * @property {number} [bot_dire] - Presumably the ID of the custom AI to be applied to dire bots.
 *
 * @property {boolean} [allow_spectating=true] - Whether or not to allow spectating
 * 
 * @property {SeriesType} [series_type=NONE] - Whether or not the game is part of a series (Bo3, Bo5).
 *
 * @property {number} [radiant_series_wins=0] - # of games won so far, e.g. for a Bo3 or Bo5.
 *
 * @property {number} [dire_series_wins=0] - # of games won so far, e.g. for a Bo3 or Bo5.
 *
 * @property {number} [previous_match_override] - In a series, the match ID of the previous game. If not supplied, the GC will try
 * to find it automatically based on the teams and the players.
 *
 * @property {boolean} [allchat=false] - Whether or not it's allowed to all-chat
 * 
 * @property {LobbyDotaTVDelay} [dota_tv_delay=LobbyDotaTV_120] - How much time the game should be delayed for DotaTV.
 *
 * @property {number} [leagueid] - The league this lobby is being created for. The bot should be a league admin for this to work.
 *
 * @property {string} [custom_game_mode] - Name of the custom game
 * 
 * @property {string} [custom_map_name] - Which map the custom game should be played on
 * 
 * @property {number} [custom_difficulty] - Difficulty of the custom game
 * 
 * @property {external:Long} [custom_game_id] - 64bit ID of the custom game mode
 * 
 * @property {LobbyDotaPauseSetting} [pause_setting=0] - Pause setting: 0 - unlimited, 1 - limited, 2 - disabled
 */

// Methods
/**
 * Sends a message to the Game Coordinator requesting to create a lobby. 
 * This will automatically make the bot join the first slot on radiant team. Listen for
 * {@link module:Dota2.Dota2Client#event:practiceLobbyUpdate|practiceLobbyUpdate} response for a
 * snapshot-update of the newly created lobby.
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 *
 * @alias module:Dota2.Dota2Client#createPracticeLobby
 *
 * @param {module:Dota2.Dota2Client#Lobby.Options} options - Configuration options for the lobby
 * 
 * @param {module:Dota2~requestCallback} [callback] - Called with `err, CMsgPracticeLobbyJoinResponse`
 */
Dota2.Dota2Client.prototype.createPracticeLobby = function(options, callback) {
    callback = callback || null;

    var defaults = {
        game_name: "",
        server_region: Dota2.ServerRegion.UNSPECIFIED,
        game_mode: Dota2.schema.DOTA_GameMode.DOTA_GAMEMODE_AP,
        game_version: Dota2.schema.DOTAGameVersion.GAME_VERSION_STABLE,
        cm_pick: Dota2.schema.DOTA_CM_PICK.DOTA_CM_RANDOM,
        allow_cheats: false,
        fill_with_bots: false,
        bot_difficulty_radiant: Dota2.schema.DOTABotDifficulty.BOT_DIFFICULTY_PASSIVE,
        bot_difficulty_dire: Dota2.schema.DOTABotDifficulty.BOT_DIFFICULTY_PASSIVE,
        allow_spectating: true,
        pass_key: "",
        series_type: Dota2.SeriesType.NONE,
        radiant_series_wins: 0,
        dire_series_wins: 0,
        allchat: false,
        dota_tv_delay: Dota2.schema.LobbyDotaTVDelay.LobbyDotaTV_120,
        leagueid: 0,
        previous_match_override: 0,
        custom_game_mode: "",
        custom_map_name: "",
        custom_difficulty: 0,
        custom_game_id: 0,
        custom_game_crc: 0
    };
    var finalOptions = Object.assign(defaults, options);

    this.Logger.debug("Sending match CMsgPracticeLobbyCreate request");
    var lobby_details = Dota2._parseOptions(finalOptions, Dota2._lobbyOptions);
    var payload = new Dota2.schema.CMsgPracticeLobbyCreate({
        "lobby_details": new Dota2.schema.CMsgPracticeLobbySetDetails(lobby_details),
        "pass_key": finalOptions.pass_key
    });

    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCPracticeLobbyCreate,
                    payload,
                    onPracticeLobbyResponse, 
                    callback);
}

/**
 * Sends a message to the Game Coordinator requesting to configure some options of the active lobby. 
 * Listen for {@link module:Dota2.Dota2Client#event:practiceLobbyUpdate|practiceLobbyUpdate} response 
 * for a snapshot-update of the newly created lobby.
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#configPracticeLobby
 * @param {external:Long} lobby_id - ID of the lobby
 * @param {module:Dota2.Dota2Client#Lobby.Options} options - The new option values
 * @param {module:Dota2~requestCallback} [callback] - Called with `err, CMsgPracticeLobbyJoinResponse`
 */
Dota2.Dota2Client.prototype.configPracticeLobby = function(lobby_id, options, callback) {
    callback = callback || null;

    var payload = new Dota2.schema.CMsgPracticeLobbySetDetails(Dota2._parseOptions(options, Dota2._lobbyOptions));
    payload.lobby_id = lobby_id;

    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCPracticeLobbySetDetails,
                    payload, 
                    onPracticeLobbyResponse, 
                    callback);
};

/**
 * Requests a lists of joinable practice lobbies.
 * Provide a callback or listen for the {@link module:Dota2.Dota2Client#event:practiceLobbyListData|practiceLobbyListData} event for the GC's response. 
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#requestPracticeLobbyList
 * @param {module:Dota2~requestCallback} [callback] - Called with `err, CMsgPracticeLobbyListResponse`
 */
Dota2.Dota2Client.prototype.requestPracticeLobbyList = function(callback) {
    callback = callback || null;

    this.Logger.debug("Sending CMsgPracticeLobbyList request");
    
    var payload = new Dota2.schema.CMsgPracticeLobbyList({});
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCPracticeLobbyList, 
                    payload, 
                    onPracticeLobbyListResponse, 
                    callback);
};

/**
 * Requests a lists of joinable practice lobbies which have one of your friends in them.
 * Provide a callback or listen for the {@link module:Dota2.Dota2Client#event:friendPracticeLobbyListData|friendPracticeLobbyListData} event for the GC's response. 
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#requestFriendPracticeLobbyList
 * @param {module:Dota2~requestCallback} [callback] - Called with `err, CMsgFriendPracticeLobbyListResponse`
 */
Dota2.Dota2Client.prototype.requestFriendPracticeLobbyList = function(callback) {
    callback = callback || null;

    this.Logger.debug("Sending CMsgFriendPracticeLobbyListRequest request");
    
    var payload = new Dota2.schema.CMsgFriendPracticeLobbyListRequest({});
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCFriendPracticeLobbyListRequest, 
                    payload, 
                    onFriendPracticeLobbyListResponse, 
                    callback);
};

/**
 * Shuffles the lobby based on skill level. Requires you to be in a lobby and to be the host.
 * Provide a callback or listen for the {@link module:Dota2.Dota2Client#event:practiceLobbyResponse|practiceLobbyResponse} event for the GC's response. 
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#balancedShuffleLobby
 * @param {module:Dota2~requestCallback} [callback] - Called with `err, CMsgPracticeLobbyJoinResponse`
 */
Dota2.Dota2Client.prototype.balancedShuffleLobby = function(callback) {
    callback = callback || null;
    
    this.Logger.debug("Sending CMsgBalancedShuffleLobby request");
    
    var payload = new Dota2.schema.CMsgBalancedShuffleLobby({});
    this.sendToGC(  Dota2.schema.EDOTAGCMsg.k_EMsgGCBalancedShuffleLobby, 
                    payload, 
                    onPracticeLobbyResponse, 
                    callback);
};

/**
 * Flips the radiant and dire team players. Requires you to be in a lobby and to be the host.
 * Provide a callback or listen for the {@link module:Dota2.Dota2Client#event:practiceLobbyResponse|practiceLobbyResponse} event for the GC's response. 
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#flipLobbyTeams
 * @param {module:Dota2~requestCallback} [callback] - Called with `err, CMsgPracticeLobbyJoinResponse`
 */
Dota2.Dota2Client.prototype.flipLobbyTeams = function(callback) {
    callback = callback || null;

    this.Logger.debug("Sending flip teams request");
    
    var payload = new Dota2.schema.CMsgFlipLobbyTeams({});
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCFlipLobbyTeams, 
                    payload, 
                    onPracticeLobbyResponse, 
                    callback);
};

/**
 * Asks to invite a player to your lobby. This creates a new default lobby when you are not already in one.
 * Listen for the {@link module:Dota2.Dota2Client#event:inviteCreated|inviteCreated} event for the GC's response. 
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#inviteToLobby
 * @param {external:Long} steam_id - The Steam ID of the player you want to invite.
 */
Dota2.Dota2Client.prototype.inviteToLobby = function(steam_id) {
    steam_id = steam_id.toString() || null;
    if (steam_id == null) {
        this.Logger.error("Steam ID required to create a lobby invite.");
        return null;
    }

    this.Logger.debug("Inviting " + steam_id + " to a lobby.");
    // todo: set client version here?
    var payload = new Dota2.schema.CMsgInviteToLobby({
        "steam_id": steam_id
    });
    this.sendToGC(Dota2.schema.EGCBaseMsg.k_EMsgGCInviteToLobby, payload);
};

/**
 * Asks to kick someone from your current practice lobby. Requires you to be in a lobby and to be the host.
 * Provide a callback or listen for the {@link module:Dota2.Dota2Client#event:practiceLobbyResponse|practiceLobbyResponse} event for the GC's response. 
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#practiceLobbyKick
 * @param {number} account_id - The Dota2 account ID of the player you want to kick.
 * @param {module:Dota2~requestCallback} [callback] - Called with `err, CMsgPracticeLobbyJoinResponse`
 */
Dota2.Dota2Client.prototype.practiceLobbyKick = function(account_id, callback) {
    callback = callback || null;
    account_id = account_id || "";

    this.Logger.debug("Sending match CMsgPracticeLobbyKick request");
    
    var payload = new Dota2.schema.CMsgPracticeLobbyKick({
        "account_id": account_id
    });
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCPracticeLobbyKick, 
                    payload,
                    onPracticeLobbyResponse, 
                    callback);
};

/**
 * Asks to kick someone from his chosen team in your current practice lobby.
 * The player will be added to the player pool
 * Provide a callback or listen for the {@link module:Dota2.Dota2Client#event:practiceLobbyResponse|practiceLobbyResponse} event for the GC's response. 
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#practiceLobbyKickFromTeam
 * @param {number} account_id - The Dota2 account ID of the player you want to kick from his team.
 * @param {module:Dota2~requestCallback} [callback] - Called with `err, CMsgPracticeLobbyJoinResponse`
 */
Dota2.Dota2Client.prototype.practiceLobbyKickFromTeam = function(account_id, callback) {
    callback = callback || null;
    account_id = account_id || "";

    this.Logger.debug("Sending match CMsgPracticeLobbyKickFromTeam request");
    
    var payload = new Dota2.schema.CMsgPracticeLobbyKickFromTeam({
        "account_id": account_id
    });
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCPracticeLobbyKickFromTeam, 
                    payload,
                    onPracticeLobbyResponse, 
                    callback);
};

/**
 * Sends a message to the Game Coordinator requesting to join a lobby.
 * Provide a callback or listen for the {@link module:Dota2.Dota2Client#event:practiceLobbyJoinResponse|practiceLobbyJoinResponse} event for the GC's response. 
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#joinPracticeLobby
 * @param {externalLong} id - The ID of the lobby
 * @param {number} password - The password of the lobby
 * @param {module:Dota2~requestCallback} [callback] - Called with `err, CMsgPracticeLobbyJoinResponse`
 */
Dota2.Dota2Client.prototype.joinPracticeLobby = function(id, password, callback) {
    callback = callback || null;
    password = password || "";

    this.Logger.debug("Sending match CMsgPracticeLobbyJoin request");
    
    var payload = new Dota2.schema.CMsgPracticeLobbyJoin({
        "lobby_id": id,
        "pass_key": password
    });
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCPracticeLobbyJoin, 
                    payload,
                    onPracticeLobbyJoinResponse,
                    callback);
};

/**
 * Sends a message to the Game Coordinator requesting to leave the current lobby.
 * Provide a callback or listen for the {@link module:Dota2.Dota2Client#event:practiceLobbyResponse|practiceLobbyResponse} event for the GC's response. 
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#leavePracticeLobby
 * @param {module:Dota2~requestCallback} [callback] - Called with `err, CMsgPracticeLobbyJoinResponse`
 */
Dota2.Dota2Client.prototype.leavePracticeLobby = function(callback) {
    callback = callback || null;

    /* Sends a message to the Game Coordinator requesting to leave the lobby.  Listen for `practiceLobby` event for Game Coordinator's response. */
    this.Logger.debug("Sending match CMsgPracticeLobbyLeave request");
    
    var payload = new Dota2.schema.CMsgPracticeLobbyLeave({});
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCPracticeLobbyLeave, 
                    payload,
                    onPracticeLobbyResponse, 
                    callback);
};

/**
 * Destroy the current lobby. Requires you to be the host.
 * Provide a callback or listen for the {@link module:Dota2.Dota2Client#event:lobbyDestroyed|lobbyDestroyed} event for the GC's response.
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#destroyLobby
 * @param {module:Dota2~requestCallback} [callback] - Called with `err, CMsgDOTADestroyLobbyResponse`
 **/
Dota2.Dota2Client.prototype.destroyLobby = function(callback) {
    callback = callback || null;

    /* Sends a message to the Game Coordinator requesting to destroy the lobby.  Listen for `lobbyDestroyed` event for Game Coordinator's response. */
    this.Logger.debug("Sending match CMsgPracticeLobbyLeave request");
    
    var payload = new Dota2.schema.CMsgDOTADestroyLobbyRequest({});
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgDestroyLobbyRequest,
                    payload,
                    onDestroyLobbyResponse, 
                    callback);
}

/**
 * Abandons the current game.
 * Provide a callback or listen for the {@link module:Dota2.Dota2Client#event:practiceLobbyResponse|practiceLobbyResponse} event for the GC's response. 
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#abandonCurrentGame
 * @param {module:Dota2~requestCallback} [callback] - Called with `err, CMsgPracticeLobbyJoinResponse`
 */
Dota2.Dota2Client.prototype.abandonCurrentGame = function(callback) {
    callback = callback || null;

    this.Logger.debug("Sending match CMsgAbandonCurrentGame request");

    var payload = new Dota2.schema.CMsgAbandonCurrentGame({});
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCAbandonCurrentGame,
                    payload,
                    onPracticeLobbyResponse, 
                    callback);
};

/**
 * Start the practice lobby. The bot will continue to receive lobby updates, but won't join the actual game.
 * Requires you to be in a lobby and to be the host.
 * Provide a callback or listen for the {@link module:Dota2.Dota2Client#event:practiceLobbyResponse|practiceLobbyResponse} event for the GC's response. 
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#launchPracticeLobby
 * @param {module:Dota2~requestCallback} [callback] - Called with `err, CMsgPracticeLobbyJoinResponse`
 */
Dota2.Dota2Client.prototype.launchPracticeLobby = function(callback) {
    callback = callback || null;
    /* Sends a message to the Game Coordinator requesting lobby start. */
    this.Logger.debug("Sending match CMsgPracticeLobbyLaunch request");

    var payload = new Dota2.schema.CMsgPracticeLobbyLaunch({});
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCPracticeLobbyLaunch, 
                    payload, 
                    onPracticeLobbyResponse, 
                    callback);
};

/**
 * Sends a message to the Game Coordinator requesting to join a particular team in the lobby.
 * Requires you to be in a lobby.
 * Provide a callback or listen for the {@link module:Dota2.Dota2Client#event:practiceLobbyResponse|practiceLobbyResponse} event for the GC's response. 
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#joinPracticeLobbyTeam
 * @param {number} slot - The slot you want to join
 * @param {number} team - The team you want to join
 * @param {module:Dota2~requestCallback} [callback] - Called with `err, CMsgPracticeLobbyJoinResponse`
 */
Dota2.Dota2Client.prototype.joinPracticeLobbyTeam = function(slot, team, callback) {
    callback = callback || null;
    slot = slot || 1;
    if (typeof team === 'undefined') team = Dota2.schema.DOTA_GC_TEAM.DOTA_GC_TEAM_PLAYER_POOL;
    
    this.Logger.debug("Sending match CMsgPracticeLobbySetTeamSlot request");
    
    var payload = new Dota2.schema.CMsgPracticeLobbySetTeamSlot({
        "team": team,
        "slot": slot
    });
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCPracticeLobbySetTeamSlot, 
                    payload, 
                    onPracticeLobbyResponse, 
                    callback);
};

/**
 * Sends a message to the Game Coordinator requesting to join as coach of a team in the lobby.
 * Requires you to be in a lobby.
 * Provide a callback or listen for the {@link module:Dota2.Dota2Client#event:practiceLobbyResponse|practiceLobbyResponse} event for the GC's response. 
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#joinPracticeLobbyCoachTeam
 * @param {number} team - The team you want to join as coach
 * @param {module:Dota2~requestCallback} [callback] - Called with `err, CMsgPracticeLobbyJoinResponse`
 */
Dota2.Dota2Client.prototype.joinPracticeLobbyCoachTeam = function(team, callback) {
    callback = callback || null;
    if (typeof team === 'undefined') team = Dota2.schema.lookupEnum("DOTA_GC_TEAM").values.DOTA_GC_TEAM_GOOD_GUYS;
    
    var _self = this;

    this.Logger.debug("Sending match CMsgPracticeLobbySetCoach request");
    
    var payload = new Dota2.schema.CMsgPracticeLobbySetCoach({
        "team": team
    });
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCPracticeLobbySetCoach, 
                    payload, 
                    onPracticeLobbyResponse,
                    callback);
};

/**
 * Sends a message to the Game Coordinator requesting to add a bot to the broadcast channel.
 * Requires you to be in a lobby.
 * Provide a callback or listen for the {@link module:Dota2.Dota2Client#event:practiceLobbyResponse|practiceLobbyResponse} event for the GC's response. 
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#joinPracticeLobbyBroadcastChannel
 * @param {number} [channel=1] -  The channel slot you want to fill
 * @param {module:Dota2~requestCallback} [callback] - Called with `err, CMsgPracticeLobbyJoinResponse`
 */
Dota2.Dota2Client.prototype.joinPracticeLobbyBroadcastChannel = function(channel, callback) {
    callback = callback || null;
    channel = channel || 1;

    this.Logger.debug("Sending match CMsgPracticeLobbyJoinBroadcastChannel request");

    var payload = new Dota2.schema.CMsgPracticeLobbyJoinBroadcastChannel({
        "channel": channel
    });
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCPracticeLobbyJoinBroadcastChannel,
                    payload,
                    onPracticeLobbyJoinResponse, 
                    callback);
};

/**
 * Sends a message to the Game Coordinator requesting to add a bot to the given team in the lobby.
 * Requires you to be in a lobby and to be the host
 * Provide a callback or listen for the {@link module:Dota2.Dota2Client#event:practiceLobbyResponse|practiceLobbyResponse} event for the GC's response. 
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#addBotToPracticeLobby
 * @param {number} slot - The slot you want to add a bot to
 * @param {number} team - The team you want to add a bot to
 * @param {module:Dota2.schema.DOTABotDifficulty} bot_difficulty - The difficulty setting of the bot.
 * @param {module:Dota2~requestCallback} [callback] - Called with `err, CMsgPracticeLobbyJoinResponse`
 */
Dota2.Dota2Client.prototype.addBotToPracticeLobby = function(slot, team, bot_difficulty, callback) {
    callback = callback || null;
    slot = slot || 1;
    team = team || Dota2.schema.DOTA_GC_TEAM.DOTA_GC_TEAM_GOOD_GUYS;
    bot_difficulty = bot_difficulty || Dota2.schema.DOTABotDifficulty.BOT_DIFFICULTY_PASSIVE;
    
    this.Logger.debug("Sending match CMsgPracticeLobbySetTeamSlot request");
    
    var payload = new Dota2.schema.CMsgPracticeLobbySetTeamSlot({
        "team": team,
        "slot": slot,
        "bot_difficulty": bot_difficulty
    });
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCPracticeLobbySetTeamSlot, 
                    payload, 
                    onPracticeLobbyResponse, 
                    callback);
}

/**
 * Sends a message to the Game Coordinator confirming/denying a lobby invitation
 * Provide a callback or listen for the {@link module:Dota2.Dota2Client#event:practiceLobbyResponse|practiceLobbyResponse} event for the GC's response. 
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#respondLobbyInvite
 * @param {external:Long} id - The ID of the lobby
 * @param {boolean} accept - Whether or not you accept the invitation.
 */
Dota2.Dota2Client.prototype.respondLobbyInvite = function(id, accept) {
    id = id || null;
    accept = accept || false;
    if (id == null) {
        this.Logger.error("Lobby ID required to respond to an invite.");
        return null;
    }

    this.Logger.debug("Responding to lobby invite " + id + ", accept: " + accept);
    // todo: set client version here?
    var payload = new Dota2.schema.CMsgLobbyInviteResponse({
        "lobby_id": id,
        "accept": accept
    });
    this.sendToGC(Dota2.schema.EGCBaseMsg.k_EMsgGCLobbyInviteResponse, payload);
};

// Events
/**
 * Event that's emitted when attempting to destroy the lobby
 * @event module:Dota2.Dota2Client#lobbyDestroyed
 * @param {CMsgDOTADestroyLobbyResponse.Result} result - Result code, 0 is SUCCESS, 1 is ERROR_UNKNOWN
 * @param {Object} response - The raw response object
 **/ 
/**
 * Event that's emitted whenever the bot joins a lobby
 * @event module:Dota2.Dota2Client#practiceLobbyJoinResponse
 * @param {DOTAJoinLobbyResult} result - Result code
 * @param {Object} response - The raw response object
 * @param {DOTAJoinLobbyResult} response.result - Result code
 */
/**
 * Event that's emitted in response to a {@link module:Dota2.Dota2Client#requestPracticeLobbyList|request for the list of lobbies}
 * @event module:Dota2.Dota2Client#practiceLobbyListData
 * @param {Object} practiceLobbyListResponse - Raw response object
 * @param {boolean} practiceLobbyListResponse.tournament_games - Whether or not there are tournament games included in the list
 * @param {CMsgPracticeLobbyListResponseEntry[]} practiceLobbyListResponse.lobbies - List of practice lobbies and their details
 */ 
 /**
 * Emitted when an operation changing the state of a lobby was sent to the GC and
 * processed. This event only contains the acknowledgement by the GC. The actual
 * update of the lobby state is communicated via {@link module:Dota2.Dota2Client#practiceLobbyUpdate} events.
 * @event module:Dota2.Dota2Client#practiceLobbyResponse
 * @param {DOTAJoinLobbyResult} result - Result code
 * @param {Object} response - The raw response object
 * @param {external:steam.EResult} response.result - Result code
 */
/**
 * Event that's emitted in response to a {@link module:Dota2.Dota2Client#requestPracticeLobbyList|request for the list of your friends' lobbies}
 * @event module:Dota2.Dota2Client#friendPracticeLobbyListData
 * @param {Object} practiceLobbyListResponse - Raw response object
 * @param {CMsgPracticeLobbyListResponseEntry[]} practiceLobbyListResponse.lobbies - List of practice lobbies and their details
 */ 
 /**
 * Event that's emitted whenever the bot attempts to invite someone to a lobby
 * @event module:Dota2.Dota2Client#inviteCreated
 * @param {external:Long} steam_id - Steam ID of the person that was invited to the lobby
 * @param {external:Long} group_id - Group ID of the invitation
 * @param {boolean} is_online - Whether or not the invitee is online
 */

// Handlers
var handlers = Dota2.Dota2Client.prototype._handlers;

var onDestroyLobbyResponse = function onDestroyLobbyResponse(message, callback) {
    callback = callback || null;
    var lobbyDestroyed = Dota2.schema.CMsgDOTADestroyLobbyResponse.decode(message);
    
    this.Logger.debug("Received destroy lobby response "+lobbyDestroyed.result);
    this.emit("lobbyDestroyed", lobbyDestroyed.result, lobbyDestroyed);
    
    if (callback) {
        if (lobbyDestroyed.result === Dota2.schema.CMsgDOTADestroyLobbyResponse.Result.SUCCESS) {
            callback(null, lobbyDestroyed);
        } else {
            callback(lobbyDestroyed.result, lobbyDestroyed);
        }
    }
};
handlers[Dota2.schema.EDOTAGCMsg.k_EMsgDestroyLobbyResponse ] = onDestroyLobbyResponse;

var onPracticeLobbyJoinResponse = function onPracticeLobbyJoinResponse(message, callback) {
    callback = callback || null;
    var practiceLobbyJoinResponse = Dota2.schema.CMsgPracticeLobbyJoinResponse.decode(message);

    this.Logger.debug("Received practice lobby join response " + practiceLobbyJoinResponse.result);
    this.emit("practiceLobbyJoinResponse", practiceLobbyJoinResponse.result, practiceLobbyJoinResponse);
    
    if (callback) {
        if (practiceLobbyJoinResponse.result === Dota2.schema.DOTAJoinLobbyResult.DOTA_JOIN_RESULT_SUCCESS) {
            callback(null, practiceLobbyJoinResponse);
        } else {
            callback(practiceLobbyJoinResponse.result, practiceLobbyJoinResponse);
        }
    }
};
handlers[Dota2.schema.EDOTAGCMsg.k_EMsgGCPracticeLobbyJoinResponse] = onPracticeLobbyJoinResponse;

var onPracticeLobbyListResponse = function onPracticeLobbyListResponse(message, callback) {
    var practiceLobbyListResponse = Dota2.schema.CMsgPracticeLobbyListResponse.decode(message);

    this.Logger.debug("Received practice lobby list response " + practiceLobbyListResponse);
    this.emit("practiceLobbyListData", practiceLobbyListResponse);
    if (callback) callback(null, practiceLobbyListResponse);
};
handlers[Dota2.schema.EDOTAGCMsg.k_EMsgGCPracticeLobbyListResponse] = onPracticeLobbyListResponse;

var onPracticeLobbyResponse = function onPracticeLobbyResponse(message, callback) {
    var practiceLobbyResponse = Dota2.schema.CMsgGenericResult.decode(message);

    this.Logger.debug("Received create/flip/shuffle/kick/launch/leave response " + JSON.stringify(practiceLobbyResponse));
    this.emit("practiceLobbyResponse", practiceLobbyResponse.result, practiceLobbyResponse);
    
    if (callback) {
        if (practiceLobbyResponse.result === 1) {
            callback(null, practiceLobbyResponse); 
        } else {
            callback(practiceLobbyResponse.result, practiceLobbyResponse); 
        }
    }
};
handlers[Dota2.schema.EDOTAGCMsg.k_EMsgGCPracticeLobbyResponse] = onPracticeLobbyResponse;

var onFriendPracticeLobbyListResponse = function onFriendPracticeLobbyListResponse(message, callback) {
    var practiceLobbyListResponse = Dota2.schema.CMsgFriendPracticeLobbyListResponse.decode(message);

    this.Logger.debug("Received friend practice lobby list response " + JSON.stringify(practiceLobbyListResponse));
    this.emit("friendPracticeLobbyListData", practiceLobbyListResponse);
    if (callback) callback(null, practiceLobbyListResponse);
};
handlers[Dota2.schema.EDOTAGCMsg.k_EMsgGCFriendPracticeLobbyListResponse] = onFriendPracticeLobbyListResponse;

var onInviteCreated = function onInviteCreated(message) {
    var inviteCreated = Dota2.schema.CMsgInvitationCreated.decode(message);
    var is_online = !inviteCreated.user_offline;

    this.Logger.debug("Created invitation to " + (is_online?"online":"offline") + " user " + inviteCreated.steam_id);
    this.emit("inviteCreated", inviteCreated.steam_id, inviteCreated.group_id, is_online);
}
handlers[Dota2.schema.EGCBaseMsg.k_EMsgGCInvitationCreated] = onInviteCreated;

