import type { Component } from 'solid-js';
import type { JSX } from 'solid-js';

import { genSVGCubicBezier } from '../util';

export const MainCircle: Component<{ fill: string }> = (props) => {
  const publicProps: JSX.AnimateSVGAttributes<SVGAnimateElement> = {
    begin: '100ms',
    calcMode: 'spline',
    dur: '0.35s',
    fill: 'freeze',
    keySplines: '0.25 0.71 0.4 0.88; .59 .22 .87 .63',
    keyTimes: '0; 0.6; 1',
  };
  return (
    <circle cx="16" cy="16" fill={props.fill} r="0">
      <animate attributeName="opacity" values="0; 1; 1" {...publicProps} />
      <animate attributeName="r" values="0; 17.5; 16" {...publicProps} />
    </circle>
  );
};

export const SecondaryCircle: Component<{ begin?: string; fill: string }> = (props) => {
  const publicProps: JSX.AnimateSVGAttributes<SVGAnimateElement> = {
    begin: props.begin || '320ms',
    dur: '1s',
    fill: 'freeze',
    ...genSVGCubicBezier('0.0 0.0 0.2 1'),
  };
  return (
    <circle cx="16" cy="16" fill={props.fill} opacity="0" r="12">
      <animate attributeName="opacity" values="1; 0" {...publicProps} />
      <animate attributeName="r" values="12; 26" {...publicProps} />
    </circle>
  );
};
