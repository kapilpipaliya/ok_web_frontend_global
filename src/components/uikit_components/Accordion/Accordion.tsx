import {setClassNames} from "../set-class-names";
import {AccordionProps} from "../globals";
import {createEffect, createSignal} from "solid-js";
// @ts-ignore
import  UIkit from 'uikit';

export function Accordion(props: AccordionProps) {
  const [state, setState] = createSignal({
    mounted: false,
    component: null,
  });
  const [accordionRef, setAccordionRef] = createSignal<HTMLUListElement>();

  createEffect(() => {
    if (accordionRef()) {
      const { options } = props;
      // setState({ ...state, component: UIkit.accordion(accordionRef.current, options) })
      UIkit.util.on(
        accordionRef() as HTMLElement,
        'beforeshow beforehide show shown hide hidden',
        (e: any) => {
          const eventName = e.type;
          /**
           * @description Fires before an item is shown. Can prevent showing by returning false.
           */
          if (eventName === 'beforeshow' && props.onBeforeShow) {
            props.onBeforeShow(e, props);
          }
          /**
           * @description Fires after an item is shown.
           */
          if (eventName === 'show' && props.onShow) {
            props.onShow(e, props);
          }
          /**
           * @description Fires after the item's show animation has completed.
           */
          if (eventName === 'shown' && props.onShown) {
            props.onShown(e, props);
          }
          /**
           * @description Fires before an item is hidden. Can prevent hiding by returning false.
           */
          if (eventName === 'beforehide' && props.onBeforeHide) {
            props.onBeforeHide(e, props);
          }
          /**
           *  @description  Fires after an item's hide animation has started.
           */
          if (eventName === 'hide' && props.onHide) {
            props.onHide(e, props);
          }
          /**
           * @description  Fires after an item is hidden.
           */
          if (eventName === 'hidden' && props.onHidden) {
            props.onHidden(e, props);
          }
        },
      );
    }
  }, []);

  return (
    <ul
      uk-accordion={props.options ? props.options : ''}
      ref={setAccordionRef}
      id={props.id}
      style={props.style}
      classList={setClassNames(props)}
    >
      {props.children}
    </ul>
  );
}
