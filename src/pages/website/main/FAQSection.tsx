import { Icon } from "@iconify-icon/solid";
import { Show, createSignal } from "solid-js";

export function FAQSection() {
  const faqData = [
    {
      question: "Do I need knowledge of coding to Use EasyFormForge?",
      answer:
        "Absolutely not. You don’t need any coding skills required to use the EasyFormForge. It is a complete drag-and-drop form builder.",
    },
    {
      question: "Does EasyFormForge have any video documentation?",
      answer:
        "Absolutely Yes. Check our official YouTube channel for more information.",
    },
    {
      question: "What happens after the subscription expires?",
      answer:
        "In that case our system will send the notification to you several times to renew your subscription. In case you decide not to renew it, no worries. You will still be able to access old data and forms.",
    },
    {
      question: "How long do I get support?",
      answer: "We are open 24x7 every day for you!",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "We are sure that you will love EasyFormForge. However, if you are not satisfied with our product, within 7 days, you’re more than welcome to get a full refund!",
    },
  ];

  return (
    <section class="faq container d-flex pt-100 pb-100">
      <div>
        <h2>Frequently Asked Questions & Resources</h2>
        <p class="text-center p-12">
          We get it - Here're some frequently asked questions <br/> to help you
          along the way
        </p>

        <div class="accordionParent d-grid justify-content-center pt-5 gap:10px">
          {faqData.map((faq: any) => (
            <AccordionItem question={faq.question} answer={faq.answer}/>
          ))}
        </div>
      </div>
    </section>
  );
}

const AccordionItem = (props: Readonly<{ question: string; answer: string }>) => {
  const [isOpen, setIsOpen] = createSignal(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen());
  };

  return (
    <div class="m:5 bb:1px|solid|lightgray r:10 w:full m:10">
      <div class="flex gap:20% jc:space-between ai:center p:10 r:10">
        <h3 class="f:17 font-600 w:60vw">{props.question}</h3>
        <span
          class="cursor:pointer"
          onClick={(e) => {
            e.stopPropagation();
            toggleOpen();
          }}
        >
          <Icon
            icon="mingcute:down-fill"
            class={"transform 2s ease-in-out"}
            style={{
              transition: "transform 0.2s linear",
              "margin-top": "7px",
              transform: `${isOpen() ? "rotate(0deg)" : "rotate(180deg)"}`,
            }}
          />
        </span>
      </div>
      <Show when={isOpen()}>
        <div
          class="p:10 r:10"
          style={{
            display: isOpen() ? "block" : "none",
            "background-color": "transparent",
          }}
        >
          <p>{props.answer}</p>
        </div>
      </Show>
    </div>
  );
};
