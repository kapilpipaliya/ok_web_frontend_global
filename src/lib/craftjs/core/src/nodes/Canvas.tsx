import { deprecationWarning } from '@craftjs/utils';
import { createEffect } from 'solid-js';

import { Element, ElementProps } from './Element';

export type CanvasProps<T> = ElementProps<T>;

export const deprecateCanvasComponent = () =>
  deprecationWarning('<Canvas />', {
    suggest: '<Element canvas={true} />',
  });

export function Canvas<T>({
  ...props
}: CanvasProps<T>) {
  createEffect(() => deprecateCanvasComponent(), []);

  return <Element {...props} canvas={true} />;
}
