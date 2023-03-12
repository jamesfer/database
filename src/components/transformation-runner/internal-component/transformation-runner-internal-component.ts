import { TransformationRunnerInternalConfiguration } from './transformation-runner-internal-configuration';
import { ComponentName } from '../../scaffolding/component-name';
import { Component } from '../../scaffolding/component';
import {
  TransformationRunnerInternalFacadeNames,
  TransformationRunnerInternalFacades
} from './transformation-runner-internal-facades';

export type TransformationRunnerInternalComponent = Component<
  ComponentName.TransformationRunnerInternal,
  TransformationRunnerInternalConfiguration,
  TransformationRunnerInternalFacadeNames
>;

export const TransformationRunnerInternalComponent: TransformationRunnerInternalComponent = {
  NAME: ComponentName.TransformationRunnerInternal,
  FACADES: TransformationRunnerInternalFacades,
}
