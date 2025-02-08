export const STYLES = {
  // Common button styles
  button: "cursor:pointer transition:transform|0.2s|linear",
  // Container styles
  container: {
    base: "flex w:full",
    section: "b:1px|solid|lightgray p:5|10 w:full",
    withBorder: "b:1px|solid|lightgray r:5"
  },
  
  iconButton: "ai:center d:inline-flex",

  // Input styles
  input: {
    base: "b:1px|solid|#ccc outline:none r:6px w:100%",
    color: "b:none f:14 outline:none w:100%",
    text: "f:14 p:10px"
  },

  // Label styles
  label: "flex ai:center font-weight:400 f:14 gap:5 white-space:nowrap",

  // Tooltip styles
  tooltip: {
    animation: "corvu-open:animate-in corvu-open:fade-in-50 corvu-open:slide-in-from-bottom-1 corvu-closed:animate-out corvu-closed:fade-out-50 corvu-closed:slide-out-to-bottom-1",
    content: "center bg:#333 color:#fff f:13 font-family:poppins font-weight:300 max-w:fit-content min-w:fit-content p:3|10 r:5 text:nowrap w:full z-index:1"
  }
} as const; 