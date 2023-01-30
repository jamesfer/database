import { EMPTY } from 'rxjs';
import {
  ConfigLifecycle,
  DISTRIBUTED_OPERATOR_FACADE_NAME, DistributedOperatorFacade,
  DistributedOperatorFunction
} from '../facades/distributed-operator-facade';
import { AllComponentConfigurations } from '../components/scaffolding/all-component-configurations';
import {
  AllComponentsLookup,
  componentImplements
} from '../components/scaffolding/all-components-lookup';

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
  // Look up the config name to find the component
  const component = AllComponentsLookup[lifecycle.name];

  // Check if the component supports the distributed operator facade
  if (!componentImplements([DISTRIBUTED_OPERATOR_FACADE_NAME], component)) {
    // console.warn(`${lifecycle.name} component does not support distributed operator`)
    return EMPTY;
  }

  const distributedOperatorFacade = component.FACADES[DISTRIBUTED_OPERATOR_FACADE_NAME] as DistributedOperatorFacade<AllComponentConfigurations>;
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
