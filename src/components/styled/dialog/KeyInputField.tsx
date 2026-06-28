import { As } from "~/components/As";

export function KeyInputField(props: {
  id?: string;
  label: string;
  value: string;
  onInput: (value: string) => void;
  ref?: (el: HTMLInputElement) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const inputId = () => props.id ?? "keyInput";
  return (
    <div>
      <As
        as="label"
        css={`return \`._id {
  color: \${args.theme.var.color.primary};
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
}\`;`}
        for={inputId()}
      >
        {props.label}
      </As>
      <As
        as="div"
        css={`return \`._id {
  margin-top: 2px;
}\`;`}
      >
        <As
          as="input"
          css={`return \`._id {
              border-radius: 0.375rem;
              border-width: 0;
              box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
              color: \${args.theme.var.color.primary};
              display: block;
              font-size: 0.875rem;
              padding: 0.375rem 0.75rem;
              width: 100%;
          }\`;`}
          disabled={props.disabled}
          id={inputId()}
          onInput={(e) => props.onInput(e.currentTarget.value)}
          placeholder={props.placeholder}
          ref={props.ref}
          type="text"
          value={props.value}
        />
      </As>
    </div>
  );
}
