import { setClassNames } from "../set-class-names";
import { CoverProps } from "../globals";

export function Cover(props: CoverProps) {
  const renderResponsiveMode = () => {
    if (props.responsive) {
      return <canvas width={props.width} height={props.height} />;
    }
  };

  const renderBasedOnType = () => {
    if (props.type === "image") {
      return <img src={props.src} alt={props.alt} width={props.width} height={props.height} data-uk-cover={""} />;
    }
    if (props.type === "video") {
      return (
        <video
          autoplay={props.autoPlay}
          loop={props.loop}
          muted={props.muted}
          playsinline={props.playsInline}
          width={props.width}
          height={props.height}
          data-uk-cover={""}
        >
          <source src={props.src} type={`${props.type}/${props.videoFormat}`} />
        </video>
      );
    }
    console.error("Type property on cover component must be either video or image");
  };

  return (
    <div
      id={props.id}
      style={props.style}
      classList={{
        "uk-cover-container": true,
        ...setClassNames(props),
      }}
    >
      {renderResponsiveMode()}
      {renderBasedOnType()}
    </div>
  );
}
