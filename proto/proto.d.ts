import * as $protobuf from "protobufjs";
/** Properties of a GossipStateRequest. */
export interface IGossipStateRequest {

    /** GossipStateRequest bloomFilter */
    bloomFilter: Uint8Array;
}

/** Represents a GossipStateRequest. */
export class GossipStateRequest implements IGossipStateRequest {

    /**
     * Constructs a new GossipStateRequest.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGossipStateRequest);

    /** GossipStateRequest bloomFilter. */
    public bloomFilter: Uint8Array;

    /**
     * Creates a new GossipStateRequest instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GossipStateRequest instance
     */
    public static create(properties?: IGossipStateRequest): GossipStateRequest;

    /**
     * Encodes the specified GossipStateRequest message. Does not implicitly {@link GossipStateRequest.verify|verify} messages.
     * @param message GossipStateRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGossipStateRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GossipStateRequest message, length delimited. Does not implicitly {@link GossipStateRequest.verify|verify} messages.
     * @param message GossipStateRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGossipStateRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GossipStateRequest message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GossipStateRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GossipStateRequest;

    /**
     * Decodes a GossipStateRequest message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GossipStateRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GossipStateRequest;

    /**
     * Verifies a GossipStateRequest message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GossipStateRequest message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GossipStateRequest
     */
    public static fromObject(object: { [k: string]: any }): GossipStateRequest;

    /**
     * Creates a plain object from a GossipStateRequest message. Also converts values to other types if specified.
     * @param message GossipStateRequest
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GossipStateRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GossipStateRequest to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}
