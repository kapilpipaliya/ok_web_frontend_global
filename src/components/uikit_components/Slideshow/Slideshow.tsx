import { SlideshowProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function Slideshow(props: SlideshowProps) {
  const setNavigation = () => {
    if (props.navigation) {
      return (
        <div class={`uk-position-relative uk-visible-toggle ${setNavigationStyle()}`}>
          <ul class="uk-slideshow-items">{props.children}</ul>
          <a
            class="uk-position-center-left uk-position-small uk-hidden-hover"
            href="#"
            uk-slidenav-previous=""
            uk-slideshow-item="previous"
          />
          <a
            class="uk-position-center-right uk-position-small uk-hidden-hover"
            href="#"
            uk-slidenav-next=""
            uk-slideshow-item="next"
          />
        </div>
      );
    }
    return <ul class="uk-slideshow-items">{props.children}</ul>;
  };

  const setNavigationStyle = () => {
    if (props.navigation && props.navigationStyle) {
      return `uk-${props.navigationStyle}`;
    }

    return `uk-dark`;
  };

  return (
    <div
      id={props.id}
      style={props.style}
      classList={setClassNames(props)}
      data-uk-slideshow={props.options ? props.options : ""}
    >
      {setNavigation()}
    </div>
  );
}
