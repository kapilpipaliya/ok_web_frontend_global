// /* eslint react/jsx-boolean-value:0, jsx-a11y/label-has-for:0 */
import { createMemo, JSX, mergeProps, splitProps } from "solid-js";
import clsx from "clsx";

interface Properties {
  /**
   * Children the Field contains.
   */
  children?: JSX.Element;
  /**
   * Help element to display with other elements.
   */
  help?: JSX.Element;
  /**
   * Legend for the input group.
   */
  legend?: string;
  /**
   * Attributes to attach to the legend.
   */
  // eslint-disable-next-line react/forbid-prop-types
  legendAttrs?: {};
  /**
   * Determines whether the fieldset is required.
   */
  required?: boolean;
  /**
   * Whether or not the legend is visible. Use this prop to hide a legend while still creating it on the DOM for accessibility.
   */
  isLegendHidden?: boolean;
}

const defaultProps = {
  legendAttrs: {} as { class?: string },
  required: false,
  isLegendHidden: false,
};
export const Fieldset = (props: Properties) => {
  props = mergeProps({}, defaultProps, props);
  const [p, customProps] = splitProps(props, ["children", "help", "legend", "legendAttrs", "isLegendHidden", "required", "class"]);
  const fieldsetClasses = createMemo(() => clsx(["fieldset", { "fieldset-required": props.required }], p.class));
  const legendClasses = createMemo(() => ["legend", props.legendAttrs.class, { "legend-visually-hidden": props.isLegendHidden }]);

  return (
    <fieldset {...customProps} class={fieldsetClasses()}>
      {props.legend && (
        <legend {...props.legendAttrs} class={legendClasses()}>
          {props.legend}
        </legend>
      )}
      {props.help && (
        <small class={"help-text"} tabIndex="-1">
          {props.help}
        </small>
      )}
      <div class={"fieldset-children"}>{props.children}</div>
    </fieldset>
  );
};
