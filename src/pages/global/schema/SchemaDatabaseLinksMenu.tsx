import { createSignal, For, Show } from "solid-js";
import { As } from "~/components/As";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { ZIndex } from "~/components/fields/ZIndex";
import type { SchemaDatabaseAdminLink } from "~/pages/global/schema/schemaOperationsUtils";
import { schemaOpButtonCss } from "~/pages/global/schema/schemaOperationsUtils";

export interface SchemaDatabaseLinksMenuProps {
  databaseName: string;
  links: readonly SchemaDatabaseAdminLink[];
  getPageUrl: (databaseName: string, path: string) => string;
  disabled?: boolean;
}

export function SchemaDatabaseLinksMenu(props: SchemaDatabaseLinksMenuProps) {
  const [open, setOpen] = createSignal(false);
  let btnEl: HTMLButtonElement | undefined;

  const handleClose = () => setOpen(false);

  return (
    <>
      <As
        as="button"
        type="button"
        ref={(el: HTMLButtonElement) => {
          btnEl = el;
        }}
        disabled={props.disabled}
        onClick={() => setOpen((v) => !v)}
        title={`Open admin pages on ${props.databaseName}`}
        css={schemaOpButtonCss("ghost", "sm")}
        aria-expanded={open()}
        aria-haspopup="menu"
      >
        Links
      </As>
      <Show when={open() && btnEl}>
        <ZIndex>
          <DropdownMenu
            onClickOutside={handleClose}
            parentRef={btnEl!}
            placement="bottom-start"
            css={`return \`._id {
  min-width: 14rem;
  padding: 0.35rem 0;
}\`;`}
          >
            <As
              as="ul"
              role="menu"
              css={`return \`._id {
  list-style: none;
  margin: 0;
  padding: 0;
}\`;`}
            >
              <For each={props.links}>
                {(link) => {
                  const href = () =>
                    props.getPageUrl(props.databaseName, link.path);
                  return (
                    <As
                      as="li"
                      role="none"
                      css={`return \`._id { margin: 0; padding: 0; }\`;`}
                    >
                      <As
                        as="a"
                        role="menuitem"
                        href={href()}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={href()}
                        onClick={handleClose}
                        css={`return \`._id {
  display: block;
  padding: 0.45rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: \${args.theme.var.color.text};
  text-decoration: none;
  white-space: nowrap;
}
._id:hover {
  background: \${args.theme.var.color.background_light_200};
  color: \${args.theme.var.color.primary};
}\`;`}
                      >
                        <As
                          as="span"
                          css={`return \`._id {
  display: block;
  font-weight: 600;
}\`;`}
                        >
                          {link.label}
                        </As>
                        <As
                          as="span"
                          css={`return \`._id {
  display: block;
  font-size: 0.65rem;
  color: \${args.theme.var.color.muted};
  font-family: ui-monospace, monospace;
}\`;`}
                        >
                          {link.path}
                        </As>
                      </As>
                    </As>
                  );
                }}
              </For>
            </As>
          </DropdownMenu>
        </ZIndex>
      </Show>
    </>
  );
}
