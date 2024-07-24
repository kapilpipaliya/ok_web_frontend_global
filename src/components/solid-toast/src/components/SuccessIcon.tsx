import type { Component } from 'solid-js';

import type { IconProps } from '../types';

import { genSVGCubicBezier } from '../util';
import { MainCircle, SecondaryCircle } from './IconCircle';

export const Success: Component<IconProps> = (props: IconProps) => {
  const fill = props.primary || '#34C759';
  return (
    <svg height="1.25rem" style={{ overflow: 'visible' }} viewBox="0 0 32 32" width="1.25rem">
      <MainCircle fill={fill} />
      <SecondaryCircle begin="350ms" fill={fill} />
      <path
        d="M9.8,17.2l3.8,3.6c0.1,0.1,0.3,0.1,0.4,0l9.6-9.7"
        fill="none"
        stroke={props.secondary || '#FCFCFC'}
        stroke-dasharray="22"
        stroke-dashoffset="22"
        stroke-linecap="round"
        stroke-miterlimit="10"
        stroke-width="4"
      >
        <animate
          attributeName="stroke-dashoffset"
          begin="250ms"
          dur="0.25s"
          fill="freeze"
          values="22;0"
          {...genSVGCubicBezier('0.0, 0.0, 0.58, 1.0')}
        />
      </path>
    </svg>
  );
};
