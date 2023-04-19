import { ComponentName } from '../../scaffolding/component-name';
import { Component } from '../../scaffolding/component';
import { JsonLinesRowBlockInternalConfiguration } from './json-lines-row-block-internal-configuration';
import { JsonLinesRowBlockInternalFacadeNames, JsonLinesRowBlockInternalFacades } from './json-lines-row-block-internal-facades';

export type JsonLinesRowBlockInternalComponent = Component<
  ComponentName.JsonLinesRowBlockInternal,
  JsonLinesRowBlockInternalConfiguration,
  JsonLinesRowBlockInternalFacadeNames
>;

export const JsonLinesRowBlockInternalComponent: JsonLinesRowBlockInternalComponent = {
  NAME: ComponentName.JsonLinesRowBlockInternal,
  FACADES: JsonLinesRowBlockInternalFacades,
}
