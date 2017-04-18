var Dota2 = require("../index"),
    util = require("util");

// Methods
/**
 * Attempts to change the position of one or more items in your inventory.
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#setItemPositions
 * @param {Object[]} item_positions - The new positions of the items
 * @param {number} item_positions[].item_id - ID of the item
 * @param {number} item_positions[].position - New position of the item
 */
Dota2.Dota2Client.prototype.setItemPositions = function(item_positions) {
    if (this.debug) util.log("Setting item positions.");
    
    var payload = {
        "itemPositions": item_positions
    };
    this.sendToGC(  Dota2.schema.lookupEnum("EDOTAGCMsg").values.k_EMsgGCSetItemPositions, 
                    Dota2.schema.lookupType("CMsgSetItemPositions").encode(payload).finish());
};

/**
 * Attempts to delete an item in your inventory.
 * Requires the GC to be {@link module:Dota2.Dota2Client#event:ready|ready}.
 * @alias module:Dota2.Dota2Client#deleteItem
 * @param {number} item_id - ID of the item
 */
Dota2.Dota2Client.prototype.deleteItem = function(item_id) {
    /* Attempts to delete item by itemid. */
    if (!this._gcReady) {
        if (this.debug) util.log("GC not ready, please listen for the 'ready' event.");
        return null;
    }
    var buffer = new Buffer(8);
    buffer.writeUInt64LE(item_id);
    this._gc.send({
            "msg": Dota2.schema.lookupEnum("EGCItemMsg").values.k_EMsgGCDelete
        },
        buffer
    );
};