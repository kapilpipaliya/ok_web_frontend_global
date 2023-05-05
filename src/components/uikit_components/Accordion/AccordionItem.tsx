import {AccordionItemProps} from "../globals";
import {splitProps} from "solid-js";


export function AccordionItem(props: AccordionItemProps) {
  const [p, rest] = splitProps(props, ['title', 'children'])
  return (
    <li {...rest}>
      <a role="button" class="uk-accordion-title">
        {p.title}
      </a>
      <div class="uk-accordion-content">{p.children}</div>
    </li>
  );
}
