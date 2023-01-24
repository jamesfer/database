import { EMPTY, NEVER } from 'rxjs';
import { DISTRIBUTED_OPERATOR_FACADE_NAME, DistributedOperatorFunction, ConfigLifecycle } from '../facades/distributed-operator-facade';
import { AllComponentConfigurations } from '../components/scaffolding/all-component-configurations';
import { AllComponentsLookup } from '../components/scaffolding/all-components-lookup';

const emptyComponentInitializer: DistributedOperatorFunction<any> = () => NEVER;

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
  if (!(DISTRIBUTED_OPERATOR_FACADE_NAME in component.FACADES)) {
    console.warn(`${lifecycle.name} component does not support distributed operator`)
    return EMPTY;
  }

  const distributedOperatorFacade = component.FACADES[DISTRIBUTED_OPERATOR_FACADE_NAME];
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
