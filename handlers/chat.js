var Dota2 = require("../index"),
    util = require("util");

// Methods

Dota2.Dota2Client.prototype.joinChat = function(channel, type) {
  type = type || Dota2.DOTAChatChannelType_t.DOTAChannelType_Custom;

  /* Attempts to join a chat channel.  Expect k_EMsgGCJoinChatChannelResponse from GC */
  if (!this._gcReady) {
    if (this.debug) util.log("GC not ready, please listen for the 'ready' event.");
    return null;
  }

  if (this.debug) util.log("Joining chat channel: " + channel);
  var payload = new Dota2.schema.CMsgDOTAJoinChatChannel({
    "channelName": channel,
    "channelType": type
  });
  this.protoBufHeader.msg = Dota2.EDOTAGCMsg.k_EMsgGCJoinChatChannel;
  this._gc.send(this.protoBufHeader,
                payload.toBuffer()
  );
};

Dota2.Dota2Client.prototype.leaveChat = function(channel) {
  /* Attempts to leave a chat channel. GC does not send a response. */
  if (!this._gcReady) {
    if (this.debug) util.log("GC not ready, please listen for the 'ready' event.");
    return null;
  }

  if (this.debug) util.log("Leaving chat channel: " + channel);
  var channelId = this.chatChannels.filter(function (item) {if (item.channelName == channel) return true; }).map(function (item) { return item.channelId; })[0]
  if (channelId === undefined) {
    if (this.debug) util.log("Cannot leave a channel you have not joined.");
    return;
  }
  var payload = new Dota2.schema.CMsgDOTALeaveChatChannel({
    "channelId": channelId
  });
  this.protoBufHeader.msg = Dota2.EDOTAGCMsg.k_EMsgGCLeaveChatChannel;
  this._gc.send(this.protoBufHeader,
                payload.toBuffer()
  );
};

Dota2.Dota2Client.prototype.sendMessage = function(channel, message) {
  /* Attempts to send a message to a chat channel. GC does not send a response. */
  if (!this._gcReady) {
    if (this.debug) util.log("GC not ready, please listen for the 'ready' event.");
    return null;
  }

  if (this.debug) util.log("Sending message to " + channel);
  var channelId = this.chatChannels.filter(function (item) {if (item.channelName == channel) return true; }).map(function (item) { return item.channelId; })[0]
  if (channelId === undefined) {
    if (this.debug) util.log("Cannot send message to a channel you have not joined.");
    return;
  }
  var payload = new Dota2.schema.CMsgDOTAChatMessage({
    "channelId": channelId,
    "text": message
  });
  this.protoBufHeader.msg = Dota2.EDOTAGCMsg.k_EMsgGCChatMessage;
  this._gc.send(this.protoBufHeader,
                payload.toBuffer()
  );
};

Dota2.Dota2Client.prototype.requestChatChannels = function() {
  /* Attempts to send a message to a chat channel. GC does not send a response. */
  if (!this._gcReady) {
    if (this.debug) util.log("GC not ready, please listen for the 'ready' event.");
    return null;
  }

  if (this.debug) util.log("Requesting channel list");
  var payload = new Dota2.schema.CMsgDOTARequestChatChannelList({
  });
  this.protoBufHeader.msg = Dota2.EDOTAGCMsg.k_EMsgGCRequestChatChannelList;
  this._gc.send(this.protoBufHeader,
                payload.toBuffer()
  );
};

// Handlers

var handlers = Dota2.Dota2Client.prototype._handlers;

handlers[Dota2.EDOTAGCMsg.k_EMsgGCJoinChatChannelResponse] = function onJoinChatChannelResponse(message) {
  /* Channel data after we sent k_EMsgGCJoinChatChannel */
  var channelData = Dota2.schema.CMsgDOTAJoinChatChannelResponse.decode(message);
  this.chatChannels.push(channelData);
};

handlers[Dota2.EDOTAGCMsg.k_EMsgGCChatMessage] = function onChatMessage(message) {
  /* Chat channel message from another user. */
  var chatData = Dota2.schema.CMsgDOTAChatMessage.decode(message);
  this.emit("chatMessage",
    this.chatChannels.filter(function (item) {if (item.channelId === chatData.channelId) return true; }).map(function (item) { return item.channelName; })[0],
    chatData.personaName,
    chatData.text,
    chatData);
};

handlers[Dota2.EDOTAGCMsg.k_EMsgGCOtherJoinedChannel] = function onOtherJoinedChannel(message) {
  // TODO;
};

handlers[Dota2.EDOTAGCMsg.k_EMsgGCOtherLeftChannel] = function onOtherLeftChannel(message) {
  // TODO;
};

handlers[Dota2.EDOTAGCMsg.k_EMsgGCRequestChatChannelListResponse] = function onRequestChatChannelListResponse(message) {
  var channels = Dota2.schema.CMsgDOTARequestChatChannelListResponse.decode(message).channels;
  this.emit("chatChannelsReceived", channels)
}