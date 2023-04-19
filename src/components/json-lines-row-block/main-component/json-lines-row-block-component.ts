import { ComponentName } from '../../scaffolding/component-name';
import { Component } from '../../scaffolding/component';
import { JsonLinesRowBlockConfiguration } from './json-lines-row-block-configuration';
import { JsonLinesRowBlockFacadeNames, JsonLinesRowBlockFacades } from './json-lines-row-block-facades';

export type JsonLinesRowBlockComponent = Component<
  ComponentName.JsonLinesRowBlock,
  JsonLinesRowBlockConfiguration,
  JsonLinesRowBlockFacadeNames
>;

export const JsonLinesRowBlockComponent: JsonLinesRowBlockComponent = {
  NAME: ComponentName.JsonLinesRowBlock,
  FACADES: JsonLinesRowBlockFacades,
}
