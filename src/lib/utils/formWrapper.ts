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
        attributes: [formSchema],
        class: "bg:base-5 p:16 p:32@xs r:8 shadow:1|2|3|primary", // max-width:700px width:90%
        componentName: "Box",
      },
    ],
    class: "min-height:100vh bg:base-10 p:24 display:flex ai:center jc:center",
    componentName: "Box",
  };
}; 