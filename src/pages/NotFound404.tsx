

export function NotFound404() {
  return (
    <main class="height:100vh  isolation:isolate  position:relative ">
      <img
        class="height:100%  inset:0px object-fit:cover object-position:top  position:absolute width:100%  z-index:-10 "
        src="https://images.unsplash.com/photo-1545972154-9bb223aac798?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3050&q=80&exp=8&con=-15&sat=-75"
      />
      <div class="max-width:80rem mx:auto  px:1.5rem px:2rem@lg py:8rem  py:10rem@sm text-align:center">
        <p class="lh:1.5rem color:rgb(255,255,255) f:1rem  font-weight:600 leading:2rem ">
          404
        </p>
        <h1 class="lh:2.25rem color:rgb(255,255,255) f:1.875rem f:3rem@sm  font-weight:700  letter-spacing:-0.025em  mt:1rem">
          Page not found
        </h1>
        <p class="lh:1.5rem color:rgb(255,255,255,0.7) f:1rem mt:1rem  mt:1.5rem@sm">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div class="flex justify-content:center mt:2.5rem ">
          <a
            class="lh:1.25rem color:rgb(255,255,255) f:0.875rem  font-weight:600 leading:1.75rem "
            href="/public"
          >
            <span aria-hidden="true">&larr;</span> Back to home
          </a>
        </div>
      </div>
    </main>
  );
}
