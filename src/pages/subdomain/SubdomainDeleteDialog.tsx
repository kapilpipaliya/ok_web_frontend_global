import { type Accessor, createSignal, Show } from "solid-js";

import { CustomModal } from "~/components/styled/modal/CustomModal";
import { As } from "~/components/As";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import type { Vertex } from "~/lib/graph/type/vertex";

interface SubdomainDeleteDialogProps {
  deleteRowId: string | null;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  open: Accessor<boolean>;
  setOpen: (open: boolean) => void;
  subdomain?: Vertex;
}

export function SubdomainDeleteDialog(props: SubdomainDeleteDialogProps) {
  const [step, setStep] = createSignal<1 | 2>(1);
  const [databaseConfirmed, setDatabaseConfirmed] = createSignal(false);
  const [filesConfirmed, setFilesConfirmed] = createSignal(false);

  const subdomainKey = () => props.subdomain?.P?.key || "this subdomain";

  const resetState = () => {
    setStep(1);
    setDatabaseConfirmed(false);
    setFilesConfirmed(false);
  };

  const handleCancel = () => {
    resetState();
    props.onCancel();
  };

  const handleClose = () => {
    resetState();
    props.setOpen(false);
  };

  const canConfirmDelete = () =>
    databaseConfirmed() && filesConfirmed() && !props.isLoading;

  return (
    <CustomModal
      containerCss={"return `._id {z-index: 3;}`;"}
      customTitle={
        <As
          as="span"
          css={`return \`._id {
  color: \${t.var.color.error};
  font-weight: 700;
}\`;`}
        >
          {step() === 1
            ? "⚠️ Permanent Subdomain Deletion"
            : "Final Confirmation Required"}
        </As>
      }
      dialogCss={
        "return `._id {min-width: 28rem; max-width: 36rem; border-radius: 10px; padding: 0;}`;"
      }
      footer={() => (
        <As as="div" css={[SETTINGS_CONSTANTS.MODAL.FOOTER.CSS]}>
          <Show
            when={step() === 1}
            fallback={
              <>
                <As
                  as="button"
                  css={[SETTINGS_CONSTANTS.MODAL.BUTTONS.DELETE_CSS]}
                  disabled={!canConfirmDelete()}
                  onClick={props.onConfirm}
                  type="button"
                >
                  {props.isLoading ? "Deleting..." : "Yes, delete permanently"}
                </As>
                <As
                  as="button"
                  css={[SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CSS]}
                  disabled={props.isLoading}
                  onClick={() => setStep(1)}
                  type="button"
                >
                  Back
                </As>
              </>
            }
          >
            <As
              as="button"
              css={[SETTINGS_CONSTANTS.MODAL.BUTTONS.DELETE_CSS]}
              onClick={() => setStep(2)}
              type="button"
            >
              I understand, continue
            </As>
          </Show>
          <As
            as="button"
            css={[SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CSS]}
            disabled={props.isLoading}
            onClick={handleCancel}
            type="button"
          >
            Cancel
          </As>
        </As>
      )}
      open={props.open}
      setOpen={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <Show
        when={step() === 1}
        fallback={
          <As as="div" css={[SETTINGS_CONSTANTS.MODAL.BODY.CSS]}>
            <As
              as="p"
              css={`return \`._id {
  margin: 0 0 1rem 0;
  font-weight: 600;
  color: \${t.var.color.error};
}\`;`}
            >
              Please double confirm: all data will be lost permanently.
            </As>
            <As
              as="p"
              css={`return \`._id {
  margin: 0 0 1rem 0;
  line-height: 1.6;
}\`;`}
            >
              You are about to permanently delete{" "}
              <strong>{subdomainKey()}</strong>. This action cannot be undone.
            </As>
            <As
              as="label"
              css={`return \`._id {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  line-height: 1.5;
}\`;`}
            >
              <As
                as="input"
                type="checkbox"
                checked={databaseConfirmed()}
                onChange={(e: Event) =>
                  setDatabaseConfirmed((e.target as HTMLInputElement).checked)
                }
                css={`return \`._id {
  margin-top: 0.25rem;
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}\`;`}
              />
              <As as="span">
                The database will be deleted permanently. All pages, components,
                and custom data will be lost. Is this OK?
              </As>
            </As>
            <As
              as="label"
              css={`return \`._id {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  line-height: 1.5;
}\`;`}
            >
              <As
                as="input"
                type="checkbox"
                checked={filesConfirmed()}
                onChange={(e: Event) =>
                  setFilesConfirmed((e.target as HTMLInputElement).checked)
                }
                css={`return \`._id {
  margin-top: 0.25rem;
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}\`;`}
              />
              <As as="span">
                All files will also be deleted permanently and will not be
                recovered. Is this OK?
              </As>
            </As>
          </As>
        }
      >
        <As as="div" css={[SETTINGS_CONSTANTS.MODAL.BODY.CSS]}>
          <As
            as="p"
            css={`return \`._id {
  margin: 0 0 1rem 0;
  font-weight: 600;
  color: \${t.var.color.error};
}\`;`}
          >
            This will permanently destroy <strong>{subdomainKey()}</strong> and
            everything inside it.
          </As>
          <As
            as="ul"
            css={`return \`._id {
  margin: 0 0 1rem 0;
  padding-left: 1.25rem;
  line-height: 1.7;
}\`;`}
          >
            <As as="li">
              The Neo4j database for this subdomain will be dropped permanently.
            </As>
            <As as="li">
              All pages, components, themes, functions, and custom data will be
              permanently deleted.
            </As>
            <As as="li">
              All uploaded files and subdomain directories will be permanently
              deleted and cannot be recovered.
            </As>
            <As as="li">
              All workers, queues, and cached data for this subdomain will be
              removed.
            </As>
          </As>
          <As
            as="p"
            css={`return \`._id {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  background: \${t.var.color.error_light_900};
  border: 1px solid \${t.var.color.error};
  color: \${t.var.color.error_dark_300};
  font-weight: 500;
  line-height: 1.5;
}\`;`}
          >
            There is no undo. Backups are the only way to recover this data.
          </As>
        </As>
      </Show>
    </CustomModal>
  );
}
