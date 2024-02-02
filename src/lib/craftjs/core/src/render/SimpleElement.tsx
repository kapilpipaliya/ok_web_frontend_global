import { useNode } from '../hooks/useNode';

export const SimpleElement = (props) => {
  const { connect, drag } = useNode().connectors;

  // SolidJS does not have a cloneElement equivalent, so you handle it differently
  // Assuming that render is a function that returns JSX
  // Wrap it with the desired functionalities (connect and drag)
  return () => {
    const element = props.render();
    if (typeof element.type === 'string') {
      // Handle connecting and dragging for native elements
      // You might need a custom logic here depending on what connect and drag do
      return connect(drag(element));
    }
    // For SolidJS components, return the render function directly
    return element;
  };
};
