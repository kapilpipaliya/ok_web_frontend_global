import {TableDataProps} from "../globals";
import {setClassNames} from "../set-class-names";

export function TableData(props: TableDataProps) {
  const _setClassNames = () => {
    if (props.shrink && props.expand) {
      console.error('Please use only one width modfier on table components');
    } else if (props.expand && props.width) {
      console.error('Please use only one width modfier on table components');
    } else if (props.shrink && props.width) {
      console.error('Please use only one width modfier on table components');
    } else {
      const isWidth = props.width ? true : false;
      return {
        [`uk-table-expand`]: props.expand,
        [`uk-table-shrink`]: props.shrink,
        [`uk-table-${props.width}`]: isWidth,
        ...setClassNames(props)
      };
    }
  };

  return (
    <td
      id={props.id}
      style={props.style}
      classList={_setClassNames()}
    >
      {props.children}
    </td>
  );
}
