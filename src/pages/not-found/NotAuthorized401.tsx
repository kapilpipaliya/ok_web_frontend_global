import "~/css/base.css";

export default function NotAuthorized401() {
  return (
    <main class="display:grid min-height:100vh  place-items:center  bg:rgb(255,255,255)  px:1.5rem py:6rem py:8rem@sm px:2rem@lg">
      <div class="text-align:center ">
        <p class="f:1rem lh:1.5rem font-weight:600  color:rgb(79,70,229) ">
          401
        </p>
        <h1 class="mt:1rem f:1.875rem lh:2.25rem font-weight:700  letter-spacing:-0.025em  color:rgb(17,24,39)  f:3rem@sm">
          Not Authorized
        </h1>
        <p class="mt:1.5rem f:1rem lh:1.5rem leading:1.75rem color:rgb(75,85,99) ">
          Sorry, you are not authorized to access this page.
        </p>
        <div class="mt:2.5rem flex align-items:center  justify-content:center  gap-x:1.5rem">
          <a
            href="/auth/login"
            class="border-radius:0.375rem  bg:rgb(79,70,229)  px:0.875rem py:0.625rem f:0.875rem lh:1.25rem font-weight:600  color:rgb(255,255,255)  box-shadow:0|1px|2px|0|rgba(0,0,0,0.05)  bg:rgb(99,102,241):hover outline-style:solid:focus-visible outline-width:2px:focus-visible outline-offset:2px:focus-visible outline-color:rgb(23,17,123);:focus-visible"
          >
            Go To Login
          </a>
          <a
            href="/contact-us"
            class="f:0.875rem lh:1.25rem font-weight:600  color:rgb(17,24,39) "
          >
            Contact support <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </main>
  );
}
