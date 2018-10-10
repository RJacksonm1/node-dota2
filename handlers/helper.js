var Dota2 = require("../index"),
    util = require("util");

// Enums
/**
 * Enum for the different fantasy stats
 * @alias module:Dota2.FantasyStats
 * @readonly
 * @enum {number}
 **/
Dota2.FantasyStats = {
    KILLS: 0,
    DEATHS: 1,
    CREEPS: 2,
    GPM: 3,
    TOWERS: 4,
    ROSHAN: 5,
    TEAMFIGHT: 6,
    OBSERVER: 7,
    STACKS: 8,
    RUNES: 9,
    FIRSTBLOOD: 10,
    STUNS: 11
}
/**
 * Enum for all possible `EResult` values
 * @alias module:Dota2.EResult
 * @readonly 
 * @enum {number}
 */
Dota2.EResult = {
    k_EResultOK : 1, // success
    k_EResultFail : 2, // generic failure 
    k_EResultNoConnection : 3, // no/failed network connection
    // k_EResultNoConnectionRetry : 4, // OBSOLETE - removed
    k_EResultInvalidPassword : 5, // password/ticket is invalid
    k_EResultLoggedInElsewhere : 6, // same user logged in elsewhere
    k_EResultInvalidProtocolVer : 7, // protocol version is incorrect
    k_EResultInvalidParam : 8, // a parameter is incorrect
    k_EResultFileNotFound : 9, // file was not found
    k_EResultBusy : 10, // called method busy - action not taken
    k_EResultInvalidState : 11, // called object was in an invalid state
    k_EResultInvalidName : 12, // name is invalid
    k_EResultInvalidEmail : 13, // email is invalid
    k_EResultDuplicateName : 14, // name is not unique
    k_EResultAccessDenied : 15, // access is denied
    k_EResultTimeout : 16, // operation timed out
    k_EResultBanned : 17, // VAC2 banned
    k_EResultAccountNotFound : 18, // account not found
    k_EResultInvalidSteamID : 19, // steamID is invalid
    k_EResultServiceUnavailable : 20, // The requested service is currently unavailable
    k_EResultNotLoggedOn : 21, // The user is not logged on
    k_EResultPending : 22, // Request is pending (may be in process, or waiting on third party)
    k_EResultEncryptionFailure : 23, // Encryption or Decryption failed
    k_EResultInsufficientPrivilege : 24, // Insufficient privilege
    k_EResultLimitExceeded : 25, // Too much of a good thing
    k_EResultRevoked : 26, // Access has been revoked (used for revoked guest passes)
    k_EResultExpired : 27, // License/Guest pass the user is trying to access is expired
    k_EResultAlreadyRedeemed : 28, // Guest pass has already been redeemed by account, cannot be acked again
    k_EResultDuplicateRequest : 29, // The request is a duplicate and the action has already occurred in the past, ignored this time
    k_EResultAlreadyOwned : 30, // All the games in this guest pass redemption request are already owned by the user
    k_EResultIPNotFound : 31, // IP address not found
    k_EResultPersistFailed : 32, // failed to write change to the data store
    k_EResultLockingFailed : 33, // failed to acquire access lock for this operation
    k_EResultLogonSessionReplaced : 34,
    k_EResultConnectFailed : 35,
    k_EResultHandshakeFailed : 36,
    k_EResultIOFailure : 37,
    k_EResultRemoteDisconnect : 38,
    k_EResultShoppingCartNotFound : 39, // failed to find the shopping cart requested
    k_EResultBlocked : 40, // a user didn't allow it
    k_EResultIgnored : 41, // target is ignoring sender
    k_EResultNoMatch : 42, // nothing matching the request found
    k_EResultAccountDisabled : 43,
    k_EResultServiceReadOnly : 44, // this service is not accepting content changes right now
    k_EResultAccountNotFeatured : 45, // account doesn't have value, so this feature isn't available
    k_EResultAdministratorOK : 46, // allowed to take this action, but only because requester is admin
    k_EResultContentVersion : 47, // A Version mismatch in content transmitted within the Steam protocol.
    k_EResultTryAnotherCM : 48, // The current CM can't service the user making a request, user should try another.
    k_EResultPasswordRequiredToKickSession : 49, // You are already logged in elsewhere, this cached credential login has failed.
    k_EResultAlreadyLoggedInElsewhere : 50, // You are already logged in elsewhere, you must wait
    k_EResultSuspended : 51,
    k_EResultCancelled : 52,
    k_EResultDataCorruption : 53,
    k_EResultDiskFull : 54,
    k_EResultRemoteCallFailed : 55,
};
/**
 * Enum for all server regions. This enum is kept up to date on a best effort base.
 * For the up-to-date values, check your game's regions.txt or {@link https://github.com/SteamDatabase/GameTracking-Dota2/blob/master/game/dota/pak01_dir/scripts/regions.txt|SteamDB's version}
 * @alias module:Dota2.ServerRegion
 * @readonly 
 * @enum {number}
 */
Dota2.ServerRegion = {
    UNSPECIFIED : 0,
    USWEST : 1,
    USEAST : 2,
    EUROPE : 3,
    KOREA : 4,
    SINGAPORE : 5,
    DUBAI : 6,
    AUSTRALIA : 7,
    STOCKHOLM : 8,
    AUSTRIA : 9,
    BRAZIL : 10,
    SOUTHAFRICA : 11,
    PWTELECOMSHANGHAI : 12,
    PWUNICOM : 13,
    CHILE : 14,
    PERU : 15,
    INDIA : 16,
    PWTELECOMGUANGZHOU : 17,
    PWTELECOMZHEJIANG : 18,
    JAPAN : 19,
    PWTELECOMWUHAN : 20
};

/**
 * Enum for different types of series.
 * @alias module:Dota2.SeriesType
 * @readonly
 * @enum {number}
 */
Dota2.SeriesType = {
    NONE: 0,
    BEST_OF_THREE: 1,
    BEST_OF_FIVE: 2
};

/**
 * Enum for different bot difficulty levels.
 * @alias module:Dota2.BotDifficulty
 * @readonly
 * @enum {number}
 */
Dota2.BotDifficulty = {
    PASSIVE: 0,
    EASY: 1,
    MEDIUM: 2,
    HARD: 3,
    UNFAIR: 4
};

/**
 * Enum for profile card slot types.
 * @alias module:Dota2.EProfileCardSlotType
 * @readonly
 * @enum {number}
 */
Dota2.EProfileCardSlotType = {
	k_EProfileCardSlotType_Empty: 0,
	k_EProfileCardSlotType_Stat: 1,
	k_EProfileCardSlotType_Trophy: 2,
	k_EProfileCardSlotType_Item: 3,
	k_EProfileCardSlotType_Hero: 4,
	k_EProfileCardSlotType_Emoticon: 5,
	k_EProfileCardSlotType_Team: 6
};

/**
 * Enum for profile stat ids.
 * @alias module:Dota2.EStatID
 * @readonly
 * @enum {number}
 */
Dota2.EStatID = {
    k_eStat_SoloRank: 1,
    k_eStat_PartyRank: 2,
    k_eStat_Wins: 3,
    k_eStat_Commends: 4,
    k_eStat_GamesPlayed: 5,
    k_eStat_FirstMatchDate: 6,
    k_eStat_PreviousSeasonRank: 7
};

/**
 * @callback module:Dota2~requestCallback
 * @param {number} errorCode - Null if everything went well, else the error code
 * @param {Object} responseMessage - The response message the GC sent
 */

// Helper methods
Dota2._parseOptions = function(options, possibleOptions) {
    var details, option, type, value;

    details = {};

    for (option in options) {
        value = options[option];
        type = possibleOptions[option];
        if (type == null) {
            if (this.debug) {
                this.Logger.debug("Option " + option + " is not possible.");
            }
            continue;
        }
        if (typeof value !== type) {
            if (this.debug) {
                this.Logger.debug("Option " + option + " must be a " + type + ".");
            }
            continue;
        }
        details[option] = value;
    }

    return details;
};

Dota2._convertCallback = function(handler, callback) {
    var self = this;
    if (callback && handler) {
        return function (header, body) {
            handler.call(self, body, callback);
        }
    } else {
        return undefined;
    }
};

Dota2._getMessageName = function(kMsg) {
    var msgTypes = [Dota2.schema.lookupEnum("EDOTAGCMsg"), 
                    Dota2.schema.lookupEnum("EGCSystemMsg"), 
                    Dota2.schema.lookupEnum("ESOMsg"), 
                    Dota2.schema.lookupEnum("EGCBaseClientMsg"),
                    Dota2.schema.lookupEnum("EGCToGCMsg"),
                    Dota2.schema.lookupEnum("EGCEconBaseMsg")];
    for (var i=0; i<msgTypes.length; i++) {
        if (msgTypes[i].valuesById[kMsg]) return msgTypes[i].valuesById[kMsg];
    }
}