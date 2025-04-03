import stylus from 'stylus';

import { Vertex } from '~/lib/graph/graph';
import { GraphInterface } from '~/lib/graph/GraphContext';


export function stylusToCss(stylusCode: string, vertex: Vertex, meta: Vertex, graph: GraphInterface): string {
  try {
    return stylus(stylusCode).render();
  } catch (error) {
    console.error('Error converting Stylus to CSS:', error);
    return ""
  }
} 