import { For } from "solid-js";

export function FormInActionSection() {
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
          <FormTypes/>
          <FormSection/>
        </div>
      </div>
    </section>
  );
}

const FormSection = () => {
  return (
    <div class="formsection">
      <div class="formtitle">
        <a aria-label="Demo style 1" class="btn-mid-icon-filled" href="#">
          Demo style 1
        </a>
        <a aria-label="Demo style 2" class="btn-transperant bg-transperant" href="#">
          Demo style 2
        </a>
      </div>

      <div class="actualform">
        <form action="#" method="post">
          <label for="fname">First Name</label>
          <input
            aria-label="First Name"
            id="fname"
            name="firstname"
            placeholder="Your name.."
            type="text"
          />

          <label for="lname">Last Name</label>
          <input
            aria-label="Last Name"
            id="lname"
            name="lastname"
            placeholder="Your last name.."
            type="text"
          />

          <label for="country">Country</label>
          <select aria-label="Country" id="country" name="country">
            <option value="australia">Australia</option>
            <option value="canada">Canada</option>
            <option value="usa">USA</option>
          </select>

          <label for="subject">Subject</label>
          <textarea
            aria-label="Subject"
            id="subject"
            name="subject"
            placeholder="Write something.."
            style="height:200px"
          />

          <input aria-label="Submit" class="btn-small-icon-filled" type="submit" value="Submit" />
        </form>
      </div>
    </div>
  );
};

const FormTypes = () => {
  const formType = [
    { count: 2, name: "Contact form" },
    { count: 1, name: "Quiz form" },
    { count: 4, name: "Feedback form" },
    { count: 6, name: "Admission form" },
    { count: 3, name: "Newsletter form" },
    { count: 2, name: "LogIn form" },
    { count: 1, name: "SignUp form" },
    { count: 2, name: "All form control" },
  ];
  return (
    <div class="formtypes">
      <ul>
        <For each={formType}>
          {(form) => (
            <li>
              <a aria-label={form.name} href="#">{form.name}</a> <span>({form.count})</span>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
};
