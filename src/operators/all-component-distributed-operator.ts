import { EMPTY } from 'rxjs';
import {
  ConfigLifecycle,
  DISTRIBUTED_OPERATOR_FACADE_NAME,
  DistributedOperatorFacade,
  DistributedOperatorFunction
} from '../facades/distributed-operator-facade';
import { AllComponentConfigurations } from '../components/scaffolding/all-component-configurations';
import { componentNameImplements } from '../components/scaffolding/component-utils';
import { AllComponentsLookup } from '../components/scaffolding/all-components-lookup';

export const allComponentDistributedOperator: DistributedOperatorFunction<AllComponentConfigurations> = (
  {
    nodeId,
    processManager,
    metadataDispatcher,
    rpcInterface,
    nodes$,
  },
  lifecycle,
) => {
  // Check if the component supports the distributed operator facade
  if (!componentNameImplements([DISTRIBUTED_OPERATOR_FACADE_NAME], lifecycle.name)) {
    return EMPTY;
  }

  // Look up the config name to find the component
  const componentFacades = AllComponentsLookup[lifecycle.name];
  const distributedOperatorFacade = componentFacades[DISTRIBUTED_OPERATOR_FACADE_NAME] as DistributedOperatorFacade<AllComponentConfigurations>;
  return distributedOperatorFacade.distributedOperatorFunction(
    {
      nodeId,
      nodes$,
      rpcInterface,
      metadataDispatcher,
      processManager,
    },
    // TODO I think this might be necessary while we only have one component with an operator.
    lifecycle as ConfigLifecycle<any>,
  );
};
