import bg from "../../../assests/signup/bg.png";
import logo from "../../../assests/signup/logo.png";

export const LoginPage = () => {
  return (
      <div class="rel bg:#fff8f8 p:40 h:full w:full">
        <div class="flex justify-content:center">
          <img src={logo} alt="logo" class="mt:30 w:200@md h:70  w:150 h:30"/>
        </div>


        <div class="p:10@md box-shadow:100 shadow:black mt:70">
          <img src={bg} alt="bg"
               class="abs z:1 ml:240@lg  ml:200@md ml:200@s mb:50 mt:160 w:200@md h:200@md hidden block@md "/>

          <div
              class="mx:400@lg mx:300@md mx:200@s   mx:0 mt:50 b:2 b:#c5daff bg:#f4f8fe sticky z:10 flex justify-content:center r:10|10|10|10 ">

            <div class="flex:col m:30@md m:20 w:fit">
              <div class=" mb:10 f:30 f:serif flex justify-content:center z:10">
                Sign In
              </div>
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
                <button class="w:full bg:blue-20 h:40 r:5|5|5|5 text-fill:white my:10 {bg:blue;px:50}:hover
        ~padding:10|300ms|ease-in">
                  Login
                </button>
              </div>

              <span class="my:10 flex justify-content:center">
              <a>
                <u class="font:bolder text-fill:black f:16 f:10">Forgot password?</u>
              </a>
            </span>
            </div>
          </div>

          <div class="flex justify-content:center mt:20 f:15">
          <span>
            Don't have an account?{" "}
            <a href="/nav/admin/signup">
              <u class="font:bolder text-fill:black">Sign Up</u>
            </a>
          </span>
          </div>
        </div>
      </div>
  );
};
