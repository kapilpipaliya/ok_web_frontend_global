

/**
 * The 'x'-button that is visible when closing the modal
 * @param mode
 * @constructor
 */
export function ModalCloseButton({ mode }: { mode?: 'default' | 'outside' }) {
  const className = `uk-modal-close-${mode ?? 'default'}`;

  return <button class={className} type="button" data-uk-close />;
}
