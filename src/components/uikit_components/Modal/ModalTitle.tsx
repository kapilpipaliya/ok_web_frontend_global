import {JSX} from "solid-js";
import {setClassNames} from "../set-class-names";


export function ModalTitle(props: JSX.HTMLAttributes<HTMLHeadingElement>) {


  // @ts-ignore
  const { children, className, ...rest } = props;

  return (
    <h2

      classList={{
        [`uk-modal-title`]: true,
        ...setClassNames(props)
      }}
        {...rest}>
      {children}
    </h2>
  );
}
