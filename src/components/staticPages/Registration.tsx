import  bg from "../../../assests/signup/bg.png"
import  logo from "../../../assests/signup/logo.png"


export const Register = () => {

  return (
    <div class="rel bg:#fff8f8 p:40 h:full w:full">
      <div class="flex justify-content:center">
        <img src={logo} alt="logo" className="mt:30 w:200@md h:70  w:150 h:30"/>
      </div>


      <div class="p:10@md box-shadow:100 shadow:black mt:70">
      <img src={bg} alt="bg" class="abs z:1 ml:240@lg  ml:200@md ml:200@s mb:50 mt:160 w:200@md h:200@md hidden block@md " />

        <div className="mx:400@lg mx:300@md mx:200@s   mx:0 mt:50 b:2 b:#c5daff bg:#f4f8fe sticky z:10 flex justify-content:center r:10|10|10|10 ">

          <div className="flex flex:col	m:30@md m:20 w:fit">
            <div className=" mb:10 f:30 f:serif flex justify-content:center z:10">
              Sign Up
            </div>
            <input
                type="Name"
                name="name"
                placeholder="Name"
                required={true}
                minlength="8"
                class="my:10 p:10 w:full r:5|5|5|5"
            />
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
            <div className="m:10">
              <div className="flex justify-content:space-between ">
                <input type="checkbox"/>
                <span class="mx:10 f:15@md f:9">
                  I agree to easyform's{" "}
                  <u class="text-fill:blue">Terms & Condition</u>
                </span>
              </div>
            </div>
            <div>
              <button class="w:full bg:blue-20 h:40 r:5|5|5|5 text-fill:white my:10 {bg:blue;px:50}:hover
        ~padding:10|300ms|ease-in">
                Signup
              </button>
            </div>
          </div>
        </div>
        <div class="flex justify-content:center mt:20 f:15">
          <span>
            Already have an account?{" "}
            <a href="/nav/admin/login">
              <u class="font:bolder	text-fill:black">Login</u>
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};
