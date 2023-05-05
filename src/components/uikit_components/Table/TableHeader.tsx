import {TableHeaderProps} from "../globals";
import {setClassNames} from "../set-class-names";

export function TableHeader(props: TableHeaderProps) {
  const _setClassNames = () => {
    if (props.shrink && props.expand) {
      console.error('Please use only one width modfier on table components');
    } else if (props.expand && props.width) {
      console.error('Please use only one width modfier on table components');
    } else if (props.shrink && props.width) {
      console.error('Please use only one width modfier on table components');
    } else {
      return ({
        [`uk-table-expand`]: props.expand,
        [`uk-table-shrink`]: props.shrink,
        [`uk-table-${props.width}`]: !!props.width,
        ...setClassNames(props)
      });
    }
  };

  return (
    <th
      id={props.id}
      style={props.style}
      classList={_setClassNames()}
    >
      {props.children}
    </th>
  );
}
