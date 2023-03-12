import { Component } from '../../scaffolding/component';
import { ComponentName } from '../../scaffolding/component-name';
import { TransformationRunnerConfiguration } from './transformation-runner-configuration';
import { TransformationRunnerFacadeNames, TransformationRunnerFacades } from './transformation-runner-facades';

export type TransformationRunnerComponent = Component<
  ComponentName.TransformationRunner,
  TransformationRunnerConfiguration,
  TransformationRunnerFacadeNames
>;

export const TransformationRunnerComponent: TransformationRunnerComponent = {
  NAME: ComponentName.TransformationRunner,
  FACADES: TransformationRunnerFacades,
}
