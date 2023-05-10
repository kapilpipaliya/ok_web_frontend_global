import { SlideshowItemProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function SlideshowItem(props: SlideshowItemProps) {
  const renderBasedOnType = () => {
    if (props.type === "image") {
      return <img src={props.src} alt={props.alt} uk-cover="" />;
    }
    if (props.type === "video") {
      return (
        <video
          autoplay={props.autoPlay}
          loop={props.loop}
          muted={props.muted}
          playsinline={props.playsInline}
          data-uk-cover={""}
        >
          <source src={props.src} type={`${props.type}/${props.videoFormat}`} />
        </video>
      );
    }
    console.error("Type property on cover component must be either video or image");
  };

  return (
    <li id={props.id} style={props.style} classList={setClassNames(props)}>
      {renderBasedOnType()}
    </li>
  );
}
