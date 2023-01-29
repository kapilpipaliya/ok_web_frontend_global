import { JSX, For, splitProps } from "solid-js";
import {ButtonItem} from "../Form";


const Button = (props: ButtonItem) => {
  const [selectedProps, customProps] = splitProps(props, ["children"]);

  return <button type="button" {...customProps}>{selectedProps.children}</button>;
};

interface ButtonGroupProps {
  items: ButtonItem[];
}

export const ButtonGroup = (props: ButtonGroupProps) => {
  return <div><For each={props.items}>{(button) => <Button {...button} />}</For></div>;
};
