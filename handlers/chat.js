var Dota2 = require("../index"),
    util = require("util");

// Methods
Dota2.Dota2Client.prototype._getChannelByName = function(channel_name, channel_type) {
    // Returns the channel corresponding to the given channel_name
    return this.chatChannels.filter(
        function(item) {
            if(channel_type >= 0)
                return (item.channel_name === channel_name && item.channel_type === channel_type);
            else
                return (item.channel_name === channel_name);
        }
    )[0];
    
}

Dota2.Dota2Client.prototype._getChannelById = function(channel_id) {
    // Returns the channel corresponding to the given channel_id
    return this.chatChannels.filter(
        // channel_id is a uint64 so it's mapped to a Long.js type
        function(item) {
            return (item.channel_id.eq(channel_id));
        }
    )[0];
}

Dota2.Dota2Client.prototype._leaveChatChannelById = function(channelId) {
    var payload = {
        "channel_id": channelId
    };
    //this.chatChannels = this.chatChannels.filter(item => item.channel_id.notEquals(channelId));
    this.sendToGC(  Dota2.schema.lookupEnum("EDOTAGCMsg").values.k_EMsgGCLeaveChatChannel, 
                    Dota2.schema.lookupType("CMsgDOTALeaveChatChannel").encode(payload).finish());
    if (this.debug) {
        util.log("Leaving channel " + channelId);
    }
};

/**
 * Joins a chat channel. If the chat channel with the given name doesn't exist, it 
 * is created. Listen for the `chatMessage` event for other people's chat messages.
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#joinChat
 * @param {string} channel_name - Name of the chat channel
 * @param {DOTAChatChannelType_t} [channel_type=DOTAChatChannelType_t.DOTAChatChannelType_Custom] - The type of the channel being joined
 */
Dota2.Dota2Client.prototype.joinChat = function(channel_name, channel_type) {
    channel_type = channel_type == null ? Dota2.schema.lookupEnum("DOTAChatChannelType_t").values.DOTAChannelType_Custom : channel_type;

    /* Attempts to join a chat channel.  Expect k_EMsgGCJoinChatChannelResponse from GC */
    if (this.debug) util.log("Joining chat channel: " + channel_name);
    
    var payload = {
        "channel_name": channel_name,
        "channel_type": channel_type
    };
    this.sendToGC(  Dota2.schema.lookupEnum("EDOTAGCMsg").values.k_EMsgGCJoinChatChannel, 
                    Dota2.schema.lookupType("CMsgDOTAJoinChatChannel").encode(payload).finish());
};

/**
 * Leaves a chat channel. If you've joined different channels with the same name,
 * specify the type to prevent unexpected behaviour.
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#leaveChat
 * @param {string} channel_name - Name of the chat channel
 * @param {DOTAChatChannelType_t} [channel_type] - The type of the channel being joined
 */
Dota2.Dota2Client.prototype.leaveChat = function(channel_name, channel_type) {
    /* Attempts to leave a chat channel. GC does not send a response. */
    if (this.debug) util.log("Leaving chat channel: " + channel_name);
    // Clear cache
    var cache = this._getChannelByName(channel_name, channel_type);
    if (cache === undefined) {
        if (this.debug) util.log("Cannot leave a channel you have not joined.");
        return;
    }
    this._leaveChatChannelById(cache.channel_id)
};

/**
 * Sends a message to the specified chat channel. Won't send if you're not in the channel you try to send to.
 * If you've joined different channels with the same name, specify the type to prevent unexpected behaviour.
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#sendMessage
 * @param {string} message - The message you want to send
 * @param {string} channel_name - Name of the chat channel
 * @param {DOTAChatChannelType_t} [channel_type] - The type of the channel being joined
 */
Dota2.Dota2Client.prototype.sendMessage = function(message, channel_name, channel_type) {
    /* Attempts to send a message to a chat channel. GC does not send a response. */
    if (this.debug) util.log("Sending message to " + channel_name);
    // Check cache
    var cache = this._getChannelByName(channel_name, channel_type);
    if (cache === undefined) {
        if (this.debug) util.log("Cannot send message to a channel you have not joined.");
        return;
    }
    
    var payload = {
        "channel_id": cache.channel_id,
        "text": message
    };
    this.sendToGC(  Dota2.schema.lookupEnum("EDOTAGCMsg").values.k_EMsgGCChatMessage, 
                    Dota2.schema.lookupType("CMsgDOTAChatMessage").encode(payload).finish());
};

/**
 * Shares the lobby you're currently in with the chat so other people can join.
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#shareLobby
 * @param {string} channel_name - Name of the chat channel
 * @param {DOTAChatChannelType_t} [channel_type] - The type of the channel being joined
 */
Dota2.Dota2Client.prototype.shareLobby = function(channel_name, channel_type) {
    /* Attempts to send a message to a chat channel. GC does not send a response. */
    if (this.debug) util.log("Sharing lobby to " + channel_name);
    // Check cache
    var cache = this._getChannelByName(channel_name, channel_type);
    if (cache === undefined) {
        if (this.debug) util.log("Cannot send message to a channel you have not joined.");
        return;
    }
    if (this.Lobby === undefined) {
        if (this.debug) util.log("Cannot share a lobby when you're not in one.");
        return;
    }
    
    var payload = {
        "channel_id": cache.channel_id,
        "share_lobby_id": this.Lobby.lobby_id,
        "share_lobby_passkey": this.Lobby.pass_key
    };
    this.sendToGC(  Dota2.schema.lookupEnum("EDOTAGCMsg").values.k_EMsgGCChatMessage, 
                    Dota2.schema.lookupType("CMsgDOTAChatMessage").encode(payload).finish());
};

/**
 * Sends a coin flip to the specified chat channel. Won't send if you're not in the channel you try to send to.
 * If you've joined different channels with the same name, specify the type to prevent unexpected behaviour.
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#flipCoin
 * @param {string} channel_name - Name of the chat channel
 * @param {DOTAChatChannelType_t} [channel_type] - The type of the channel being joined
 */
Dota2.Dota2Client.prototype.flipCoin = function(channel_name, channel_type) {
    /* Attempts to send a coin flip to a chat channel. Expect a chatmessage in response. */
    if (this.debug) util.log("Sending coin flip to " + channel_name);
    // Check cache
    var cache = this._getChannelByName(channel_name, channel_type);
    if (cache === undefined) {
        if (this.debug) util.log("Cannot send message to a channel you have not joined.");
        return;
    }
    
    var payload = {
        "channel_id": cache.channel_id,
        "coin_flip": true
    };
    this.sendToGC(  Dota2.schema.lookupEnum("EDOTAGCMsg").values.k_EMsgGCChatMessage, 
                    Dota2.schema.lookupType("CMsgDOTAChatMessage").encode(payload).finish());
};

/**
 * Sends a dice roll to the specified chat channel. Won't send if you're not in the channel you try to send to.
 * If you've joined different channels with the same name, specify the type to prevent unexpected behaviour.
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#rollDice
 * @param {number} min - Lower bound of the dice roll
 * @param {number} max - Upper bound of the dice roll
 * @param {string} channel_name - Name of the chat channel
 * @param {DOTAChatChannelType_t} [channel_type] - The type of the channel being joined
 */
Dota2.Dota2Client.prototype.rollDice = function(min, max, channel_name, channel_type) {
    /* Attempts to send a dice roll to a chat channel. Expect a chatmessage in response. */
    if (this.debug) util.log("Sending dice roll to " + channel_name);
    // Check cache
    var cache = this._getChannelByName(channel_name, channel_type);
    if (cache === undefined) {
        if (this.debug) util.log("Cannot send message to a channel you have not joined.");
        return;
    }
    
    var payload = {
        "channel_id": cache.channel_id,
        "dice_roll": {
            "roll_min": min,
            "roll_max": max
        }
    };
    this.sendToGC(  Dota2.schema.lookupEnum("EDOTAGCMsg").values.k_EMsgGCChatMessage, 
                    Dota2.schema.lookupType("CMsgDOTAChatMessage").encode(payload).finish());
};

/**
 * Requests a list of chat channels from the GC. Listen for the `chatChannelsData` event for the GC's response.
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#requestChatChannels
 */
Dota2.Dota2Client.prototype.requestChatChannels = function() {
    /* Requests a list of chat channels from the GC. */
    if (this.debug) util.log("Requesting channel list");
    
    var payload = {};
    this.sendToGC(  Dota2.schema.lookupEnum("EDOTAGCMsg").values.k_EMsgGCRequestChatChannelList, 
                    Dota2.schema.lookupType("CMsgDOTAChatMessage").encode(payload).finish());
};

// Events
/**
 * Event that's emitted whenever the bot joins a chat channel
 * @event module:Dota2.Dota2Client#chatJoined
 * @param {Object} channelData - A `CMsgDOTAJoinChatChannelResponse` object containing information about the chat channel.
 */
/**
 * Event that's emitted whenever someone else joins a chat channel the bot is in
 * @event module:Dota2.Dota2Client#chatJoin
 * @param {string} channel - Name of the chat channel someone joined
 * @param {string} joiner_name - Persona name of the person that joined the channel
 * @param {external:Long} joiner_steam_id - Steam ID of the person that joined the channel
 * @param {CMsgDOTAOtherJoinedChatChannel} otherJoined_object - The raw message data.
 */
/**
 * Event that's emitted whenever someone else leaves a chat channel the bot is in
 * @event module:Dota2.Dota2Client#chatLeave
 * @param {string} channel - Name of the chat channel someone left
 * @param {string} leaver_steam_id - Persona name of the person that left the channel
 * @param {CMsgDOTAOtherLeftChatChannel} otherLeft_object - The raw message data.
 */
/**
 * Event that's emitted whenever the bot left a chat channel
 * @event module:Dota2.Dota2Client#chatLeft
 * @param {string} channel - Name of the chat channel the bot left
 */
/**
 * Event that's emitted whenever someone sends a message in a channel the bot is in
 * @event module:Dota2.Dota2Client#chatMessage
 * @param {string} channel - Name of the chat channel the message was sent to
 * @param {string} sender_name - Persona name of the sender of the message
 * @param {string} message - The message that was sent
 * @param {CMsgDOTAChatMessage} chatData - The raw message data containing the message and its metadata.
 */
/**
 * Event that's emitted after requesting a list of chat channels via {@link module:Dota2.Dota2Client#requestChatChannels}
 * @event module:Dota2.Dota2Client#chatChannelsData
 * @param {Object[]} channels - An array of ChatChannel objects
 * @param {string} channels[].channel_name - Name of the chat channel
 * @param {number} channels[].num_members - Number of members in the channel
 * @param {DOTAChatChannelType_t} channels[].channel_type - The type of the channel
 */

// Handlers
var handlers = Dota2.Dota2Client.prototype._handlers;

var onJoinChatChannelResponse = function onJoinChatChannelResponse(message) {
    /* Channel data after we sent k_EMsgGCJoinChatChannel */
    var channelData = Dota2.schema.lookupType("CMsgDOTAJoinChatChannelResponse").decode(message);
    if (this.debug) util.log("Chat channel " + channelData.channel_name + " has " + channelData.members.length + " person(s) online");
    this.chatChannels.push(channelData);
    this.emit("chatJoined", channelData);
};
handlers[Dota2.schema.lookupEnum("EDOTAGCMsg").values.k_EMsgGCJoinChatChannelResponse] = onJoinChatChannelResponse;

var onChatMessage = function onChatMessage(message) {
    /* Chat channel message from another user. */
    var chatData = Dota2.schema.lookupType("CMsgDOTAChatMessage").decode(message);
    var channel = this._getChannelById(chatData.channel_id);

    if (this.debug) {
        if (channel) {
            util.log("Received chat message from " + chatData.persona_name + " in channel " + channel.channel_name);
        } else {
            util.log("Received chat message from " + chatData.persona_name + " in unknown channel");
        }
    }
    this.emit("chatMessage",
        channel.channel_name,
        chatData.persona_name,
        chatData.text,
        chatData);
};
handlers[Dota2.schema.lookupEnum("EDOTAGCMsg").values.k_EMsgGCChatMessage] = onChatMessage;

var onOtherJoinedChannel = function onOtherJoinedChannel(message) {
    /* Someone joined a chat channel you're in. */
    var otherJoined = Dota2.schema.lookupType("CMsgDOTAOtherJoinedChatChannel").decode(message);
    var channel = this._getChannelById(otherJoined.channel_id);
    if (channel) {
        if (this.debug) util.log(otherJoined.steam_id + " joined channel " + channel.channel_name);
        this.emit("chatJoin",
            channel.channel_name,
            otherJoined.persona_name,
            otherJoined.steam_id,
            otherJoined);
        // Add member to cached chatChannels
        channel.members.push(Dota2.schema.lookupType("CMsgDOTAChatMember").create({
            steam_id: otherJoined.steam_id,
            persona_name: otherJoined.persona_name
        }));
    }
};
handlers[Dota2.schema.lookupEnum("EDOTAGCMsg").values.k_EMsgGCOtherJoinedChannel] = onOtherJoinedChannel;

var onUserLeftChannel = function onOtherLeftChannel(message) {
    /* Someone left a chat channel you're in. */
    var userWhoLeft = Dota2.schema.lookupType("CMsgDOTAOtherLeftChatChannel").decode(message);
    var channel = this._getChannelById(userWhoLeft.channel_id);
    // Check if it is me that left the channel
    if (userWhoLeft.steam_id.equals(this._client.steamID)) {
        // Delete channel from cache
        this.chatChannels = this.chatChannels.filter(item => item.channel_id.notEquals(userWhoLeft.channel_id));
        if (channel) {
            // TODO 6.0.0 - Delete this event
            this.emit("chatLeave", channel.channel_name, userWhoLeft.steam_id, userWhoLeft);
            this.emit("chatLeft", channel.channel_name);
            if (this.debug)
                util.log("Left channel " + channel.channel_name);
        } else {
            this._leaveChatChannelById(userWhoLeft.channel_id);
            if (this.debug)
                util.log("I left unknown channel " + userWhoLeft.channel_id);
        }
    } else {
        if (channel) {
            this.emit("chatLeave", channel.channel_name, userWhoLeft.steam_id, userWhoLeft);
            // Delete member from cached chatChannel
            channel.members = channel.members.filter(item => item.steam_id.notEquals(userWhoLeft.steam_id));
            if (this.debug)
                util.log(userWhoLeft.steam_id + " left channel " + channel.channel_name);
        } else {
            this._leaveChatChannelById(userWhoLeft.channel_id);
            if (this.debug)
                util.log(userWhoLeft.steam_id + " left unknown channel " + userWhoLeft.channel_id);
        }
    }
};
handlers[Dota2.schema.lookupEnum("EDOTAGCMsg").values.k_EMsgGCOtherLeftChannel] = onUserLeftChannel;

var onChatChannelsResponse = function onChatChannelsResponse(message) {
    var channels = Dota2.schema.lookupType("CMsgDOTARequestChatChannelListResponse").decode(message).channels;
    this.emit("chatChannelsData", channels)
};
handlers[Dota2.schema.lookupEnum("EDOTAGCMsg").values.k_EMsgGCRequestChatChannelListResponse] = onChatChannelsResponse;