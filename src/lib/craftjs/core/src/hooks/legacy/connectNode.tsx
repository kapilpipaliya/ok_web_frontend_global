import { Node } from '../../interfaces';
import { useNode } from '../useNode';

export function connectNode<C>(collect?: (state: Node) => C) {
  return function (WrappedComponent) {
    return (props: any) => {
      const node = useNode(collect);
      return <WrappedComponent {...node} {...props} />;
    };
  };
}
