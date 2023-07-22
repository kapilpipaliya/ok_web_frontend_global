import { createRoot } from 'react-dom/client'
import {createElement} from 'react';
import ReactPlayer, { ReactPlayerProps } from "react-player";
import { BaseReactPlayerProps } from "react-player/base";
import { onMount } from "solid-js";

// https://github.com/cookpete/react-player
// use like:  <Player url={'https://www.youtube.com/watch?v=d46Azg3Pm4c'}/>
export const Player = (props: BaseReactPlayerProps & ReactPlayerProps) => {
 return <div ref={el => {
  onMount(() => {
   const root = createRoot(el);
   root.render((createElement(ReactPlayer, props, null)));
  })
 }}/>
}