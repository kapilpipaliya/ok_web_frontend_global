import '../base.css'
export default function NotFound() {
  return (
      <main className="position:relative  isolation:isolate  height:100vh ">
          <img
              src="https://images.unsplash.com/photo-1545972154-9bb223aac798?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3050&q=80&exp=8&con=-15&sat=-75"
              alt=""
              className="position:absolute  inset:0px z-index:-10 height:100%  width:100%  object-position:top "
          />
          <div className="mx:auto max-width:80rem  px:1.5rem py:8rem text-align:center  py:10rem@sm px:2rem@lg">
              <p className="f:1rem lh:1.5rem font-weight:600  leading:2rem color:rgb(255,255,255) ">404</p>
              <h1 className="mt:1rem f:1.875rem lh:2.25rem font-weight:700  letter-spacing:-0.025em  color:rgb(255,255,255)  f:3rem@sm">Page
                  not found</h1>
              <p className="mt:1rem f:1rem lh:1.5rem color:rgb(255,255,255,0.7)  mt:1.5rem@sm">Sorry, we couldn't find
                  the page you're looking for.</p>
              <div className="mt:2.5rem flex justify-content:center ">
                  <a href="/"
                     className="f:0.875rem lh:1.25rem font-weight:600  leading:1.75rem color:rgb(255,255,255) ">
                      <span aria-hidden="true">&larr;</span> Back to home
                  </a>
              </div>
          </div>
      </main>
  );
}
