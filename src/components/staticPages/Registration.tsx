import  logo from "../../../assets/signup/logo.png"


export const Register = () => {

  return (
      <div class="login rel bg:#FFF1F1 r:5|5|5|5">
        <div class="flex justify-content:center ai:center">
          <img src={logo} alt="logo" class="mt:80px w:200 h:50"/>
        </div>

        <div class="p:10@md box-shadow:100 shadow:black mt:50 h:70% flex ai:center jc:center">

          <div>
            {/*<img src={bg} alt="bg"*/}
            {/*     class="abs z:1 w:200@md h:200@md"/>*/}
            <div class={'flex justify-content:center ai:centernp'}>

              <div
                  class="mt:50 w:70% b:2 b:#c5daff bg:#f4f8fe z:10 flex justify-content:center r:10|10|10|10">

                <div class="flex:col m:20 w:70%">
                  <div class=" mb:10 f:30 font-weight:bold flex justify-content:center z:10">
                    Sign Up
                  </div>
                  <input
                      type="Name"
                      name="name"
                      placeholder="Enter Name"
                      required={true}
                      class="my:10 p:10 w:full r:5|5|5|5"
                  />
                  <input
                      type="Email"
                      name="email"
                      placeholder="Enter Email"
                      required={true}
                      minLength="4"
                      class="my:10 p:10 w:full r:5|5|5|5"
                  />
                  <input
                      type="password"
                      name="password"
                      placeholder="Enter Password"
                      required={true}
                      minLength="8"
                      class="my:10 p:10 w:full r:5|5|5|5"
                  />

                  <div>
                    <button class="w:full bg:#4A92FD h:40 r:5|5|5|5 text-fill:white">
                      Sign Up
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
            Already have an account?{" "}
            <a href="/admin/login">
              <u class="font:bolder text-fill:black">Sign In</u>
            </a>
          </span>
            </div>
          </div>
        </div>
      </div>
  );
};
