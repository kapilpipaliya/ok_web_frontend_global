import  bg from "../../../assests/signup/bg.png"
import  logo from "../../../assests/signup/logo.png"

export const Login = () => {
    return (
      <div class="rel bg:#fff8f8 p:40 h:full w:full">
      <img src={logo} alt="logo" class="w:200@md h:40@md  w:150 h:30" />

        <div class="mt:120@md mt:80 f:30 f:serif flex justify-content:center ">
          Welcome!
        </div>
        <div class="p:10@md">
        <img src={bg} alt="bg" class="abs z:1 ml:350@md mt:150@md w:200@md h:200@md hidden block@md " />
          <div class=" mx:500@md mx:0 b:2 b:#c5daff bg:#f4f8fe flex justify-content:center r:10|10|10|10 z:10 sticky p:30@md p:0">
            <div class="flex flex:col	m:30@md m:20 w:full">
             
              <input
                type="Email"
                name="email"
                placeholder="Email"
                required={true}
                minlength="8"
                class="my:10 p:10 w:full r:5|5|5|5"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required={true}
                minlength="8"
                class="my:10 p:10 w:full r:5|5|5|5"
              />
             
              <div>
                <button class="w:full bg:blue h:40 r:5|5|5|5 text-fill:white my:10">
                  Login
                </button>
              </div>
              <span class="my:10 flex justify-content:center">
              <a >
                <u class="font:bolder	text-fill:black f:15@md f:10">Forgot password?</u>
              </a>
            </span>
              <h2 class="w:full text-align:center border-bottom:1 lh:0.1 my:10">
                <span class="bg:#f4f8fe f:15 px:10">or</span>
              </h2>
              <div class="flex justify-content:space-between b:2 p:10 m:5 r:5|5|5|5 b:#d4d4d4 bg:white">
                <span class="m:6 f:sans text-fill:#7a7979 f:15@md f:12">
                  Login with Gmail
                </span>
                <div>
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 134 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0_1:194)">
                      <path
                        d="M9.09091 100H30.303V48.4848L0 25.7576V90.9091C0 95.9394 4.07576 100 9.09091 100Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M103.03 100H124.242C129.273 100 133.333 95.9242 133.333 90.9091V25.7576L103.03 48.4848"
                        fill="#34A853"
                      />
                      <path
                        d="M103.03 9.09091V48.4848L133.333 25.7576V13.6364C133.333 2.39394 120.5 -4.01515 111.515 2.72727"
                        fill="#FBBC04"
                      />
                      <path
                        d="M30.303 48.4848V9.09091L66.6667 36.3636L103.03 9.09091V48.4848L66.6667 75.7576"
                        fill="#EA4335"
                      />
                      <path
                        d="M0 13.6364V25.7576L30.303 48.4848V9.09091L21.8182 2.72727C12.8182 -4.01515 0 2.39394 0 13.6364"
                        fill="#C5221F"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_1:194">
                        <rect width="133.333" height="100" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-content:center mt:20 f:15">
            <span>
              Don't have an account?{" "}
              <a href="/nav/admin/signup">
                <u class="font:bolder	text-fill:black">Sign Up</u>
              </a>
            </span>
          </div>
        </div>
      </div>
    );
  };
  