/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const GossipStateRequest = $root.GossipStateRequest = (() => {

    /**
     * Properties of a GossipStateRequest.
     * @exports IGossipStateRequest
     * @interface IGossipStateRequest
     * @property {Uint8Array} bloomFilter GossipStateRequest bloomFilter
     */

    /**
     * Constructs a new GossipStateRequest.
     * @exports GossipStateRequest
     * @classdesc Represents a GossipStateRequest.
     * @implements IGossipStateRequest
     * @constructor
     * @param {IGossipStateRequest=} [properties] Properties to set
     */
    function GossipStateRequest(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * GossipStateRequest bloomFilter.
     * @member {Uint8Array} bloomFilter
     * @memberof GossipStateRequest
     * @instance
     */
    GossipStateRequest.prototype.bloomFilter = $util.newBuffer([]);

    /**
     * Creates a new GossipStateRequest instance using the specified properties.
     * @function create
     * @memberof GossipStateRequest
     * @static
     * @param {IGossipStateRequest=} [properties] Properties to set
     * @returns {GossipStateRequest} GossipStateRequest instance
     */
    GossipStateRequest.create = function create(properties) {
        return new GossipStateRequest(properties);
    };

    /**
     * Encodes the specified GossipStateRequest message. Does not implicitly {@link GossipStateRequest.verify|verify} messages.
     * @function encode
     * @memberof GossipStateRequest
     * @static
     * @param {IGossipStateRequest} message GossipStateRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    GossipStateRequest.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        writer.uint32(/* id 16, wireType 2 =*/130).bytes(message.bloomFilter);
        return writer;
    };

    /**
     * Encodes the specified GossipStateRequest message, length delimited. Does not implicitly {@link GossipStateRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof GossipStateRequest
     * @static
     * @param {IGossipStateRequest} message GossipStateRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    GossipStateRequest.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a GossipStateRequest message from the specified reader or buffer.
     * @function decode
     * @memberof GossipStateRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {GossipStateRequest} GossipStateRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    GossipStateRequest.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.GossipStateRequest();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 16:
                message.bloomFilter = reader.bytes();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        if (!message.hasOwnProperty("bloomFilter"))
            throw $util.ProtocolError("missing required 'bloomFilter'", { instance: message });
        return message;
    };

    /**
     * Decodes a GossipStateRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof GossipStateRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {GossipStateRequest} GossipStateRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    GossipStateRequest.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a GossipStateRequest message.
     * @function verify
     * @memberof GossipStateRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    GossipStateRequest.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (!(message.bloomFilter && typeof message.bloomFilter.length === "number" || $util.isString(message.bloomFilter)))
            return "bloomFilter: buffer expected";
        return null;
    };

    /**
     * Creates a GossipStateRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof GossipStateRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {GossipStateRequest} GossipStateRequest
     */
    GossipStateRequest.fromObject = function fromObject(object) {
        if (object instanceof $root.GossipStateRequest)
            return object;
        let message = new $root.GossipStateRequest();
        if (object.bloomFilter != null)
            if (typeof object.bloomFilter === "string")
                $util.base64.decode(object.bloomFilter, message.bloomFilter = $util.newBuffer($util.base64.length(object.bloomFilter)), 0);
            else if (object.bloomFilter.length)
                message.bloomFilter = object.bloomFilter;
        return message;
    };

    /**
     * Creates a plain object from a GossipStateRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof GossipStateRequest
     * @static
     * @param {GossipStateRequest} message GossipStateRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    GossipStateRequest.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults)
            if (options.bytes === String)
                object.bloomFilter = "";
            else {
                object.bloomFilter = [];
                if (options.bytes !== Array)
                    object.bloomFilter = $util.newBuffer(object.bloomFilter);
            }
        if (message.bloomFilter != null && message.hasOwnProperty("bloomFilter"))
            object.bloomFilter = options.bytes === String ? $util.base64.encode(message.bloomFilter, 0, message.bloomFilter.length) : options.bytes === Array ? Array.prototype.slice.call(message.bloomFilter) : message.bloomFilter;
        return object;
    };

    /**
     * Converts this GossipStateRequest to JSON.
     * @function toJSON
     * @memberof GossipStateRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    GossipStateRequest.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return GossipStateRequest;
})();

module.exports = $root;
