const resizeHandleShared = `
  width: 100%;
  height: 8px;
  cursor: ns-resize;
  position: absolute;
  left: 0;
  z-index: 100;
  user-select: none;
  touch-action: none;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background-color: \${t.var.color.border};
    transition: all 0.2s ease;
    opacity: 0.5;
  }

  &:hover::before {
    height: 2px;
    background-color: \${t.var.color.primary};
    opacity: 1;
  }

  &::after {
    content: "";
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 3px;
    background-color: \${t.var.color.border};
    border-radius: 2px;
    transition: all 0.2s ease;
    opacity: 0;
  }

  &:hover::after {
    background-color: \${t.var.color.primary};
    height: 4px;
    opacity: 1;
  }
`;

export const bottomResizeHandleStyles = `return \`._id {
  ${resizeHandleShared}
  bottom: -4px;

  &::before {
    bottom: 2px;
  }

  &::after {
    bottom: 0;
  }
}\`;`;

export const topResizeHandleStyles = `return \`._id {
  ${resizeHandleShared}
  top: -4px;

  &::before {
    top: 2px;
  }

  &::after {
    top: 0;
  }
}\`;`;

/** @deprecated Use bottomResizeHandleStyles */
export const resizeHandleStyles = bottomResizeHandleStyles;

export const resizeContainerStyles = `return \`._id {
  position: relative;
  padding-top: 4px;
  padding-bottom: 4px;
}\`;`;
