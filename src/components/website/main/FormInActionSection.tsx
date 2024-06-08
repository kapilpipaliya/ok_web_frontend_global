import { For } from "solid-js";

const FormInActionSection = () => {
  return (
    <section class="forminaction pt-100 pb-100 bg-info-300">
      <div class="container">
        <h2 class="text-left">
          Watch <span class="color-info">EasyFormForge</span> form in action!
        </h2>
        <p class="font-600 mt-2">
          Build any form instantly using all the features
        </p>

        <div class="formsecparent mt-5">
          <FormTypes />
          <FormSection />
        </div>
      </div>
    </section>
  );
};

export default FormInActionSection;

const FormSection = () => {
  return (
    <div class="formsection">
      <div class="formtitle">
        <a class="btn-mid-icon-filled" href="#">
          Demo style 1
        </a>
        <a class="btn-transperant bg-transperant" href="#">
          Demo style 2
        </a>
      </div>

      <div class="actualform">
        <form action="#">
          <label for="fname">First Name</label>
          <input
            type="text"
            id="fname"
            name="firstname"
            placeholder="Your name.."
          />

          <label for="lname">Last Name</label>
          <input
            type="text"
            id="lname"
            name="lastname"
            placeholder="Your last name.."
          />

          <label for="country">Country</label>
          <select id="country" name="country">
            <option value="australia">Australia</option>
            <option value="canada">Canada</option>
            <option value="usa">USA</option>
          </select>

          <label for="subject">Subject</label>
          <textarea
            id="subject"
            name="subject"
            placeholder="Write something.."
            style="height:200px"
          />

          <input class="btn-small-icon-filled" type="submit" value="Submit" />
        </form>
      </div>
    </div>
  );
};

const FormTypes = () => {
  const formType = [
    { name: "Contact form", count: 2 },
    { name: "Quiz form", count: 1 },
    { name: "Feedback form", count: 4 },
    { name: "Admission form", count: 6 },
    { name: "Newsletter form", count: 3 },
    { name: "LogIn form", count: 2 },
    { name: "SignUp form", count: 1 },
    { name: "All form control", count: 2 },
  ];
  return (
    <div class="formtypes">
      <ul>
        <For each={formType}>
          {(form) => (
            <li>
              <a href="#">{form.name}</a> <span>({form.count})</span>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
};
