import {GridProps} from "../globals";
import {setClassNames} from "../set-class-names";


export function Grid(props: GridProps) {


  return (
    <div
      id={props.id}
      style={props.style}

      classList={{
        [`uk-grid-${props.gutter}`]: !!props.gutter,
        [`uk-grid-divider`]: props.divider,
        [`uk-grid-match`]: props.match,
        ...setClassNames(props)
      }}
      uk-grid={props.options ? props.options : ''}
    >
      {props.children}
    </div>
  );
}

export default Grid;
