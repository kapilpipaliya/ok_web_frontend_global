import { ParallaxProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function Parallax(props: ParallaxProps) {
  // TODO:
  const applyParallaxFiltersToChild = (): string => {
    return React.Children.map(props.children, (child: React.ReactChild, idx: number) => {
      if (idx > 0) return child;
      return React.cloneElement(child as React.ReactElement<any>, {
        "uk-parallax": props.options,
      });
    });
  };

  return (
    <div id={props.id} style={props.style} classList={setClassNames(props)}>
      {applyParallaxFiltersToChild()}
    </div>
  );
}
