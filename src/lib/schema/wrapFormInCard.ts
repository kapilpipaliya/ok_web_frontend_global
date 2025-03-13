type FormSchema = {
  as?: string;
  attributes: any[];
  class?: string;
  componentName: string;
};

export const wrapFormInCard = (formSchema: FormSchema) => {
  return {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            as: "form",
            attributes: [formSchema],
            componentName: "Html",
            props: () => ({
              onSubmit: (e: Event) => {
                e.preventDefault();
              },
            }),
          }
        ],
        class: "bg:base-5 p:16 p:32@xs r:8 shadow:1|2|3|primary", // max-width:700px width:90%
        componentName: "Html",
      },
    ],
    class: "min-height:100vh bg:base-10 p:24 display:flex ai:center jc:center",
    componentName: "Html",
  };
};
