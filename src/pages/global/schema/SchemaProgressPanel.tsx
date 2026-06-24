import { Show } from "solid-js";
import { As } from "~/components/As";

export interface SchemaProgressPanelProps {
  title: string;
  updating: boolean;
  complete: number;
  total: number;
  running: number;
  queued: number;
  failed: number;
}

export function SchemaProgressPanel(props: SchemaProgressPanelProps) {
  const pct = () =>
    props.total > 0 ? Math.round((props.complete / props.total) * 100) : 0;

  return (
    <As
      as="section"
      css={`return \`._id {
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  border-radius: 0.5rem;
  border: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background_light_100};
}\`;`}
    >
      <As
        as="h2"
        css={`return \`._id {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}\`;`}
      >
        {props.title}
        {props.updating ? " (updating…)" : ""}
      </As>
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.5rem;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}\`;`}
      >
        <As as="span">
          Complete: {props.complete} / {props.total}
        </As>
        <As as="span">Running: {props.running}</As>
        <As as="span">Queued: {props.queued}</As>
        <Show when={props.failed > 0}>
          <As
            as="span"
            css={"return `._id { color: ${args.theme.var.color.error}; font-weight: 600; }`;"}
          >
            Failed: {props.failed}
          </As>
        </Show>
      </As>
      <As
        as="motionFragment"
        css={`return \`._id {
  height: 0.5rem;
  border-radius: 9999px;
  background: \${args.theme.var.color.background_light_300};
  overflow: hidden;
}\`;`}
      >
        <As
          as="motionFragment"
          css={() => {
            return `return \`._id {
  height: 100%;
  width: ${pct()}%;
  background: \${args.theme.var.color.primary};
  transition: width 0.3s ease;
}\`;`;
          }}
        />
      </As>
    </As>
  );
}
