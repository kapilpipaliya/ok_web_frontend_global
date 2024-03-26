import bg from "../../../assests/signup/bg.png";
import logo from "../../../assests/signup/logo.png";


export const LoginPage = () => {

  return (
      <div class="login rel bg:#FFF1F1 r:5|5|5|5">
      <div class="flex justify-content:center ai:center">
        <img src={logo} alt="logo" class="mt:30 w:200@md h:70  w:150 h:30"/>
      </div>

        <div class="p:10@md box-shadow:100 shadow:black mt:70 h:70% flex ai:center jc:center">

          <div>
            {/*<img src={bg} alt="bg"*/}
            {/*     className="abs z:1 w:200@md h:200@md"/>*/}
            <div>

              <div
                  class="mt:50 b:2 b:#c5daff bg:#f4f8fe sticky z:10 flex justify-content:center r:10|10|10|10 m:10">

                <div class="flex:col m:20@md m:20 w:fit p:20">
                  <div class=" mb:10 f:30 font-weight:bold flex justify-content:center z:10">
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
                    <button class="w:full bg:#4A92FD h:40 r:5|5|5|5 text-fill:white">
                      Login
                    </button>
                  </div>

                  <span class="my:10 flex justify-content:center">
              <a>
                <u class="font:bolder text-fill:black f:15 cursor:pointer">Forgot password ?</u>
              </a>
            </span>
                </div>

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
      </div>
  );
};
