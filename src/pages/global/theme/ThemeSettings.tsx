import { SelectThemeMenu } from "~/pages/theme_menu/SelectThemeMenu";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export function ThemeSettings() {
  return (
    <As
      as="div"
      css={css`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`}
    >
      <As
        as="div"
        css={css`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`}
      >
        <As
          as="h2"
          css={css`
  white-space: 1.2rem;
  font-size: medium;
`}
        >
          Theme Management
        </As>
        <As
          as="p"
          css={css`
  color: \${args.theme.var.color.primary_400};
`}
        >
          Customize the look and feel of your application by managing themes.
        </As>
      </As>
      <As
        as="div"
        css={css`
  background-color: \${args.theme.var.color.base_4};
  border-radius: 6px;
  padding: 1rem;
`}
      >
        <SelectThemeMenu isStandalone={true} />
      </As>
    </As>
  );
}
