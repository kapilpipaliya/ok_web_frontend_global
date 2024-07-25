export function ClientCardHeader(props: { imgSrc: string; clientName: string; }) {
  return (
    <div class="flex align-items:center gap-x:1rem border-color:rgb(17,24,39,0.05) bg:rgb(249,250,251) p:1.5rem">
      <img
        src={props.imgSrc}
        alt={props.clientName}
        class="h:3rem w:3rem flex:none border-radius:0.5rem bg:rgb(255,255,255) object-fit:cover box-shadow:0|0|0|1px|rgba(0,0,0,0.5) box-shadow:0|0|0|calc(1px+10px)|rgba(17,24,39,0.1)" />
      <div class="f:0.875rem lh:1.25rem font-weight:500 leading:1.5rem color:rgb(17,24,39)">
        {props.clientName}
      </div>
    </div>
  );
}
