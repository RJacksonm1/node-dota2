var Dota2 = require("../index"),
    util = require("util");

// Methods
Dota2.Dota2Client.prototype._getChannelByName = function(channel_name, channel_type) {
    // Returns the channel corresponding to the given channel_name
    if (this.chatChannels) {
        return this.chatChannels.filter(
            function(item) {
                if(channel_type >= 0)
                    return (item.channel_name === channel_name && item.channel_type === channel_type);
                else
                    return (item.channel_name === channel_name);
            }
        )[0];
    } else {
        return null;
    }
}

Dota2.Dota2Client.prototype._getChannelById = function(channel_id) {
    // Returns the channel corresponding to the given channel_id
    if (this.chatChannels) {
        return this.chatChannels.filter(
            // channel_id is a uint64 which is a compound object. Using '===' or '==' doesn't work to check the equality necessitating the cast to String
            function(item) {
                return ("" + item.channel_id === "" + channel_id);
            }
        )[0];
    } else {
        return null;
    }
}

Dota2.Dota2Client.prototype.joinChat = function(channel_name, channel_type) {
    channel_type = channel_type || Dota2.schema.DOTAChatChannelType_t.DOTAChannelType_Custom;

    /* Attempts to join a chat channel.  Expect k_EMsgGCJoinChatChannelResponse from GC */
    if (this.debug) util.log("Joining chat channel: " + channel_name);
    
    var payload = new Dota2.schema.CMsgDOTAJoinChatChannel({
        "channel_name": channel_name,
        "channel_type": channel_type
    });
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCJoinChatChannel, payload);
};

Dota2.Dota2Client.prototype.leaveChat = function(channel_name, channel_type) {
    /* Attempts to leave a chat channel. GC does not send a response. */
    if (this.debug) util.log("Leaving chat channel: " + channel_name);
    // Clear cache
    var cache = this._getChannelByName(channel_name, channel_type);
    if (cache === undefined) {
        if (this.debug) util.log("Cannot leave a channel you have not joined.");
        return;
    }
    
    var payload = new Dota2.schema.CMsgDOTALeaveChatChannel({
        "channel_id": cache.channel_id
    });
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCLeaveChatChannel, payload);
};

Dota2.Dota2Client.prototype.sendMessage = function(channel_name, message, channel_type) {
    /* Attempts to send a message to a chat channel. GC does not send a response. */
    if (this.debug) util.log("Sending message to " + channel_name);
    // Check cache
    var cache = this._getChannelByName(channel_name, channel_type);
    if (cache === undefined) {
        if (this.debug) util.log("Cannot send message to a channel you have not joined.");
        return;
    }
    
    var payload = new Dota2.schema.CMsgDOTAChatMessage({
        "channel_id": cache.channel_id,
        "text": message
    });
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCChatMessage, payload);
};

Dota2.Dota2Client.prototype.privateChatKick = function(channel, accountID) {
    /* Attempts to send a message to a chat channel. GC does not send a response. */
    if (this.debug) util.log("Sending kick  of " +accountID+ " to " + channel);
    // Check cache
    var cache = this._getChannelByName(channel);
    if (cache === undefined) {
        if (this.debug) util.log("Cannot send message to a channel you have not joined.");
        return;
    }
    
    var payload = new Dota2.schema.CMsgClientToGCPrivateChatKick({
        "private_chat_channel_name": channel,
        "kick_account_id": accountID
    });
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgClientToGCPrivateChatKick, payload);
};
Dota2.Dota2Client.prototype.privateChatInvite = function(channel, accountID) {
    /* Attempts to send a message to a chat channel. GC does not send a response. */
    if (this.debug) util.log("Sending Invite  of " +accountID+ " to " + channel);
    // Check cache
    var cache = this._getChannelByName(channel);
    if (cache === undefined) {
        if (this.debug) util.log("Cannot send message to a channel you have not joined.");
        return;
    }
    
    var payload = new Dota2.schema.CMsgClientToGCPrivateChatInvite({
        "private_chat_channel_name": channel,
        "invited_account_id": accountID
    });
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgClientToGCPrivateChatInvite, payload);
};
Dota2.Dota2Client.prototype.privateChatDemote = function(channel, accountID) {
    /* Attempts to send a message to a chat channel. GC does not send a response. */
    if (this.debug) util.log("Sending demote  of " +accountID+ " to " + channel);
    // Check cache
    var cache = this._getChannelByName(channel);
    if (cache === undefined) {
        if (this.debug) util.log("Cannot send message to a channel you have not joined.");
        return;
    }
    
    var payload = new Dota2.schema.CMsgClientToGCPrivateChatDemote({
        "private_chat_channel_name": channel,
        "demote_account_id": accountID
    });
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgClientToGCPrivateChatDemote, payload);
};
Dota2.Dota2Client.prototype.privateChatPromote = function(channel, accountID) {
    /* Attempts to send a message to a chat channel. GC does not send a response. */
    if (this.debug) util.log("Sending promote of " +accountID+ " to " + channel);
    // Check cache
    var cache = this._getChannelByName(channel);
    if (cache === undefined) {
        if (this.debug) util.log("Cannot send message to a channel you have not joined.");
        return;
    }
    
    var payload = new Dota2.schema.CMsgClientToGCPrivateChatPromote({
        "private_chat_channel_name": channel,
        "promote_account_id": accountID
    });
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgClientToGCPrivateChatPromote, payload);
};
Dota2.Dota2Client.prototype.requestPrivateChatInfo = function(channel) {
    /* Attempts to send a message to a chat channel. GC does not send a response. */
    if (this.debug) util.log("Requesting Chat Info about  " + channel);
    // Check cache
    
    
    var payload = new Dota2.schema.CMsgClientToGCPrivateChatInfoRequest({
        "private_chat_channel_name": channel,
    });
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgClientToGCPrivateChatInfoRequest, payload);
};

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
    
    var payload = new Dota2.schema.CMsgDOTAChatMessage({
        "channel_id": cache.channel_id,
        "share_lobby_id": this.Lobby.lobby_id,
        "share_lobby_passkey": this.Lobby.pass_key
    });
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCChatMessage, payload);
};

Dota2.Dota2Client.prototype.flipCoin = function(channel_name, channel_type) {
    /* Attempts to send a coin flip to a chat channel. Expect a chatmessage in response. */
    if (this.debug) util.log("Sending coin flip to " + channel_name);
    // Check cache
    var cache = this._getChannelByName(channel_name, channel_type);
    if (cache === undefined) {
        if (this.debug) util.log("Cannot send message to a channel you have not joined.");
        return;
    }
    
    var payload = new Dota2.schema.CMsgDOTAChatMessage({
        "channel_id": cache.channel_id,
        "coin_flip": true
    });
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCChatMessage, payload);
};

Dota2.Dota2Client.prototype.rollDice = function(channel_name, min, max, channel_type) {
    /* Attempts to send a dice roll to a chat channel. Expect a chatmessage in response. */
    if (this.debug) util.log("Sending dice roll to " + channel_name);
    // Check cache
    var cache = this._getChannelByName(channel_name, channel_type);
    if (cache === undefined) {
        if (this.debug) util.log("Cannot send message to a channel you have not joined.");
        return;
    }
    
    var payload = new Dota2.schema.CMsgDOTAChatMessage({
        "channel_id": cache.channel_id,
        "dice_roll": {
            "roll_min": min,
            "roll_max": max
        }
    });
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCChatMessage, payload);
};

Dota2.Dota2Client.prototype.requestChatChannels = function() {
    /* Requests a list of chat channels from the GC. */
    if (this.debug) util.log("Requesting channel list");
    
    var payload = new Dota2.schema.CMsgDOTARequestChatChannelList({});
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCRequestChatChannelList, payload);
};

// Handlers

var handlers = Dota2.Dota2Client.prototype._handlers;

var onJoinChatChannelResponse = function onJoinChatChannelResponse(message) {
    /* Channel data after we sent k_EMsgGCJoinChatChannel */
    var channelData = Dota2.schema.CMsgDOTAJoinChatChannelResponse.decode(message);
    if (this.debug) util.log("Chat channel " + channelData.channel_name + " has " + channelData.members.length + " person(s) online");
    this.chatChannels.push(channelData);
};
handlers[Dota2.schema.EDOTAGCMsg.k_EMsgGCJoinChatChannelResponse] = onJoinChatChannelResponse;

var onChatMessage = function onChatMessage(message) {
    /* Chat channel message from another user. */
    var chatData = Dota2.schema.CMsgDOTAChatMessage.decode(message);
    var channel = this._getChannelById(chatData.channel_id);

    if (this.debug) util.log("Received chat message from " + chatData.persona_name + " in channel " + channel.channel_name);
    this.emit("chatMessage",
        channel.channel_name,
        chatData.persona_name,
        chatData.text,
        chatData);
};
handlers[Dota2.schema.EDOTAGCMsg.k_EMsgGCChatMessage] = onChatMessage;

var onOtherJoinedChannel = function onOtherJoinedChannel(message) {
    /* Someone joined a chat channel you're in. */
    var otherJoined = Dota2.schema.CMsgDOTAOtherJoinedChatChannel.decode(message);
    var channel = this._getChannelById(otherJoined.channel_id);
    if (this.debug) util.log(otherJoined.steam_id + " joined channel " + channel.channel_name);
    this.emit("chatJoin",
        channel.channel_name,
        otherJoined.persona_name,
        otherJoined.steam_id,
        otherJoined);
    // Add member to cached chatChannels
    channel.members.push(new Dota2.schema.CMsgDOTAChatMember({
        steam_id: otherJoined.steam_id,
        persona_name: otherJoined.persona_name
    }));
};
handlers[Dota2.schema.EDOTAGCMsg.k_EMsgGCOtherJoinedChannel] = onOtherJoinedChannel;

var onOtherLeftChannel = function onOtherLeftChannel(message) {
    /* Someone left a chat channel you're in. */
    var otherLeft = Dota2.schema.CMsgDOTAOtherLeftChatChannel.decode(message);
    var channel = this._getChannelById(otherLeft.channel_id);
    // Check if it is me that left the channel
    if ("" + otherLeft.steam_id === "" + this._client.steamID) {
        if (this.debug) {
            if (channel) {
                util.log("Left channel " + channel.channel_name);
            } else {    
                util.log("This probably should be physically impossible, but whatever: you managed to leave a channel you didn't know you were in, congratulations...");
            }
        }
        this.emit("chatLeave",
            channel.channel_name,
            otherLeft.steam_id,
            otherLeft);
        // Delete channel from cache
        this.chatChannels = this.chatChannels.filter(function(item) {
            if ("" + item.channel_id == "" + channel.channel_id) return false;
        });
    } else {
        if (this.debug) {
            if (channel) {
                util.log(otherLeft.steam_id + " left channel " + channel.channel_name);
            } else {
                util.log(otherLeft.steam_id + " left channel " + otherLeft.channel_id + " (PS: why do I get messages from a chat I don't know? Did you kill me D: ?)");
            }
        }
        this.emit("chatLeave",
            channel.channel_name,
            otherLeft.steam_id,
            otherLeft);
        // Delete member from cached chatChannel
        channel.members = channel.members.filter(function(item) {
            return ("" + item.steam_id !== "" + otherLeft.steam_id);
        });
    }
};
handlers[Dota2.schema.EDOTAGCMsg.k_EMsgGCOtherLeftChannel] = onOtherLeftChannel;

var onChatChannelsResponse = function onChatChannelsResponse(message) {
    var channels = Dota2.schema.CMsgDOTARequestChatChannelListResponse.decode(message).channels;
    this.emit("chatChannelsData", channels)
};
handlers[Dota2.schema.EDOTAGCMsg.k_EMsgGCRequestChatChannelListResponse] = onChatChannelsResponse;

var onChatPrivateChatResponse = function onChatPrivateChatResponse(message) {
    var result = Dota2.schema.CMsgGCToClientPrivateChatResponse.decode(message).result;
	var channel_name = Dota2.schema.CMsgGCToClientPrivateChatResponse.decode(message).private_chat_channel_name;
    this.emit("privateChatResult", result, channel_name)
};
handlers[Dota2.schema.EDOTAGCMsg.k_EMsgGCToClientPrivateChatResponse] = onChatPrivateChatResponse;

var onChatPrivateChatInfoResponse = function onChatPrivateChatInfoResponse(message) {
    var result = Dota2.schema.CMsgGCToClientPrivateChatInfoResponse.decode(message).result;
	var channel_name = Dota2.schema.CMsgGCToClientPrivateChatInfoResponse.decode(message).private_chat_channel_name;
    this.emit("privateChatInfoResult", result, channel_name)
};
handlers[Dota2.schema.EDOTAGCMsg.k_EMsgGCToClientPrivateChatInfoResponse] = onChatPrivateChatInfoResponse;
