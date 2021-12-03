import avsc from 'avsc';
import { identity } from 'lodash';

export class Codec<T> {
  readonly avroType = avsc.Type.forSchema(this.avroSchema, { wrapUnions: 'always' });

  private constructor(
    readonly avroSchema: avsc.schema.DefinedType,
    private readonly toSerialized: (value: T) => any,
    private readonly fromSerialized: (value: any) => T | undefined,
  ) {}

  static fromSchema<T>(schema: avsc.schema.DefinedType): Codec<T> {
    return new Codec<T>(schema, identity, identity);
  }

  static create<T, S = any>(
    schema: avsc.schema.DefinedType,
    toSerialized: (value: T) => S,
    fromSerialized: (value: S) => T | undefined,
  ): Codec<T> {
    return new Codec<T>(schema, toSerialized, fromSerialized);
  }

  serialize(value: T): Buffer {
    return this.avroType.toBuffer(this.toSerialized(value));
  }

  deserialize(buffer: Buffer): T | undefined {
    try {
      return this.fromSerialized(this.avroType.fromBuffer(buffer));
    } catch {
      return undefined;
    }
  }
}

// export class UnionCodec<T> {
//   // readonly avroType = avsc.Type.forSchema(this.schemas, { wrapUnions: 'always' });
//
//   constructor(
//     readonly classes: (Function & { codec: Codec<any> })[],
//     // private readonly fromSerialized: (value: any) => T | undefined,
//     // private readonly toSerialized: (value: T) => any = v => v,
//   ) {}
//
//   serialize(value: T): Buffer {
//     this.classes.forEach(cls => {
//       if (value instanceof cls) {
//         cls.
//       }
//     })
//
//     return this.avroType.toBuffer(this.toSerialized(value));
//   }
//
//   deserialize(buffer: Buffer): T | undefined {
//     try {
//       return this.fromSerialized(this.avroType.fromBuffer(buffer));
//     } catch {
//       return undefined;
//     }
//   }
// }
