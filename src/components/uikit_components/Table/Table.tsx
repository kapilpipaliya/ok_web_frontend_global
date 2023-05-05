import {setClassNames} from "../set-class-names";
import {TableProps} from "../globals";

export function Table(props: TableProps) {

  return (
    <table
      id={props.id}
      style={props.style}
       classList={{
         'uk-table': true,
         [`uk-table-divider`]: props.divider,
         [`uk-table-striped`]: props.striped,
         [`uk-table-hover`]: props.hover,
         [`uk-table-justify`]: props.justify,
         [`uk-table-middle`]: props.center,
         [`uk-overflow-auto`]: props.responsive,
         [`uk-table-${props.size}`]: !!props.size,
         ...setClassNames(props)
      }}
    >
      {props.children}
    </table>
  );
}
