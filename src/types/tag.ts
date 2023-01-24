// export class StringTag {
//   constructor(public readonly value: string) {}
// }
//
// export class NamedTuple {
//   constructor(public readonly name: string, public readonly values: Tag[]) {}
// }
//
// type Tag =
//   | StringTag;

// const TAG: unique symbol = Symbol('TAG');
//
// type TAG = typeof TAG;

import { Refine } from './refine';

interface Tag {
  get TAG(): string;
}

class String implements Tag {
  readonly TAG: 'String' = 'String';
}

class SerializationInterface<T extends AllTags> implements Tag {
  readonly TAG: `SerializationInterfaceName<${T['TAG']}>`;

  constructor(tag: T) {
    this.TAG = `SerializationInterfaceName<${tag.TAG}>`;
  }
}

type AllTags =
  | String
  | SerializationInterface<any>;

const InstanceLookup: { [K in AllTags['TAG']]: Refine<AllTags, { TAG: K }> } = {
  String: { TAG: 'String' },
  'SerializationInterfaceName<String>': {
    TAG: 'SerializationInterfaceName<String>',
    value(): number {
      return 1;
    }
  }
};



interface SerializerInterface<T> {
  serialize(value: T): string;
}

interface OperatorInterface<T> {
  build(): T;
}

type TaggedType<S extends string, T extends any> = [S, T];

type StringT = TaggedType<'String', string>;

type X<B extends TaggedType<string, any>> = TaggedType<`X`, B[1]>;

type Serializer<T extends TaggedType<string, any>> = TaggedType<`Serializer<${T[0]}>`, SerializerInterface<T[1]>>;

type Operator<T extends TaggedType<string, any>> = TaggedType<`Operator:${T[0]}`, OperatorInterface<T[1]>>;

type AllTaggedTypes = {
  wrapped:
    | StringT
    | X<AllTaggedTypes>
    | Serializer<AllTaggedTypes>
    | Operator<AllTaggedTypes>;
};

const lookup: { [K in AllTaggedTypes['S']]: Refine<AllTaggedTypes, { S: K }> extends { T: infer T } ? T : never } = {
  'Serializer:String': 'string',
  'Operator<String>': 1,
};

const x: Refine<AllTaggedTypes, { S: 'Serializer<String>', T: any }> extends { S: string, T: infer T } ? T : never = 1 as any;



// type AllTaggedInterfaces =
//   | OperatorInterface<TaggedType<string, any>>
//   | SerializerInterface<TaggedType<string, any>>;

const stringSerializer: SerializerInterface<StringT> = {
  tag: 'Serializer<String>',
  serialize(value: string): string {
    return '';
  },
}


