export function NotAuthorized401() {
  return (
    <main class="bg:rgb(255,255,255) display:grid  min-height:100vh  place-items:center  px:1.5rem px:2rem@lg py:6rem py:8rem@sm">
      <div class="text-align:center ">
        <p class="lh:1.5rem color:rgb(79,70,229) f:1rem  font-weight:600 ">
          401
        </p>
        <h1 class="lh:2.25rem color:rgb(17,24,39) f:1.875rem f:3rem@sm  font-weight:700  letter-spacing:-0.025em  mt:1rem">
          Not Authorized
        </h1>
        <p class="lh:1.5rem color:rgb(75,85,99) f:1rem leading:1.75rem mt:1.5rem ">
          Sorry, you are not authorized to access this page.
        </p>
        <div class="flex align-items:center gap-x:1.5rem  justify-content:center  mt:2.5rem">
          <a
            class="lh:1.25rem  bg:rgb(79,70,229)  bg:rgb(99,102,241):hover border-radius:0.375rem box-shadow:0|1px|2px|0|rgba(0,0,0,0.05) color:rgb(255,255,255) f:0.875rem  font-weight:600  outline-color:rgb(23,17,123);:focus-visible  outline-offset:2px:focus-visible outline-style:solid:focus-visible outline-width:2px:focus-visible px:0.875rem py:0.625rem"
            href="/auth/login"
          >
            Go To Login
          </a>
          <a
            class="lh:1.25rem color:rgb(17,24,39) f:0.875rem  font-weight:600 "
            href="/contact-us"
          >
            Contact support <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </main>
  );
}
