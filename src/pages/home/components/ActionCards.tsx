import { ComponentProps } from "../../../utils/Form";
import { actionCardsData } from "../data";
import { Icon } from "@iconify-icon/solid";

export function ActionCards(props: ComponentProps) {
  return (
    <div class="mb:1.5rem mt:10">
      <div class="grid-cols:4 gap:8 w:full text:center">
        {actionCardsData.map((card) => (
          <div class="bg:#fff box-shadow:1|1|7|#ddd r:5 height:4rem flex flex:column jc:space-evenly ai:center cursor:pointer">
            <div
              class="w:100% h:100% flex ai:center jc:center flex:3"
              style={{ "background-image": `url(${card.image})` }}
            >
              <Icon icon={card.icon} width={25} />
            </div>
            <small class="flex flex:2 ai:center">{card.title}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
