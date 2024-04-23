import { createSignal } from 'solid-js';

import {A} from "@solidjs/router";
import './css/krd.css';
import './css/style.css';
import logoImage from './graphics/logo.png';
import ukFlagImage from './graphics/ukflag.png';
interface FormData {
 firstname: string;
 lastname: string;
 email: string;
 phone: string;
 subject: string;
}
const ContactUs = () => {
 const [formData, setFormData] = createSignal<FormData>({
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  subject: ''
 });

 const updateField = (field: keyof FormData) => (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  setFormData((prev) => ({ ...prev, [field]: target.value }));
 };

 const handleSubmit = (event: Event) => {
  event.preventDefault();
  console.log('Form data:', formData());
  // Add form submission logic here, e.g., API call
 };

 return (
  <div>
   <section class="header container">
    <div class="logo">
     <A href="/public"><img class="headerLogo" src={logoImage} alt="logo" /></A>
    </div>
    <div class="links">
     <ul>
      <li><A class="bodycopytext-16" href="/public">Home</A></li>
      <li><A class="bodycopytext-16" href="/pricing.html">Pricing</A></li>
      <li><A class="bodycopytext-16" href="/contactus.html">Contact Us</A></li>
      <div class="dropdown">
       <a class="dropbtn bodycopytext-16" href="#">
        <img class="headerflag pr-1" src={ukFlagImage} alt="icon" />Language <i class="fa-solid fa-chevron-down"></i>
       </a>
       <div class="dropdown-content">
        <a href="#">Spanish</a>
        <a href="#">Russian</a>
        <a href="#">Korean</a>
       </div>
      </div>
     </ul>
    </div>
    <button class="btn-small-icon-filled">Get Started <i class="fa-solid fa-chevron-right"></i></button>
   </section>
   <div class="cntc pt-5">
    <div class="innersection container pb-100">
     <h1 class="pt-100">Get in touch</h1>
     <div class="container formContact mt-5">
      <form onSubmit={handleSubmit}>
       <div class="form-inline">
        <input type="text" id="fname" name="firstname" placeholder="First name.." onInput={updateField('firstname')} />
        <input type="text" id="lname" name="lastname" placeholder="Last name.." onInput={updateField('lastname')} />
       </div>
       <div class="form-inline">
        <input type="text" placeholder="Email" name="email" required onInput={updateField('email')} />
        <input type="text" id="phone" name="phone" placeholder="Phone Number" onInput={updateField('phone')} />
       </div>
       <textarea id="subject" name="subject" placeholder="Your message.." style="height:200px" onInput={updateField('subject')}></textarea>
       <input class="btn-small-icon-filled formsubmitbtn" type="submit" value="Submit" />
      </form>
     </div>
     <div class="contactways pt-5">
      <div class="phone">
       <a href="#"><i class="fa-solid fa-phone-volume"></i></a>
       <h5>Call</h5>
       <h4>9879879879</h4>
      </div>
      <div class="email">
       <a href="#"><i class="fa-solid fa-envelope"></i></a>
       <h5>Email</h5>
       <h4>hi@easyform.com</h4>
      </div>
      <div class="address">
       <a href="#"><i class="fa-solid fa-location-dot"></i></a>
       <h5>Address</h5>
       <p>#124, Rockwell street, <br/>Amhedabad, 360009</p>
      </div>
     </div>
    </div>
   </div>
   <section class="footer">
    <div class="row container d-flex pb-3">
     <div class="info d-grid align-content-spacebetween">
      <div>
       <A href="/public"><img class="headerLogo" src={logoImage} alt="logo" /></A>
       <p>Design and publish forms faster, smoother</p>
      </div>
      <div class="footericon">
       <a href="#"><i class="fa-brands fa-square-facebook"></i></a>
       <a href="#"><i class="fa-brands fa-square-x-twitter"></i></a>
       <a href="#"><i class="fa-brands fa-linkedin"></i></a>
       <a href="#"><i class="fa-brands fa-youtube"></i></a>
      </div>
     </div>
     <div class="company">
      <h5>Company</h5>
      <ul>
       <li><A href="#">About Us</A></li>
       <li><A href="#">Testimonials</A></li>
       <li><A href="#">My Account</A></li>
       <li><A href="#">Blogs</A></li>
      </ul>
     </div>
     <div class="company">
      <h5>Links</h5>
      <ul>
       <li><A href="#">Site maps</A></li>
       <li><A href="#">Blogs</A></li>
       <li><A href="#">Documentation</A></li>
       <li><A href="#">Return</A></li>
      </ul>
     </div>
     <div class="company">
      <h5>Privacy</h5>
      <ul>
       <li><A href="#">Privacy Policy</A></li>
       <li><A href="#">Terms of Use</A></li>
       <li><A href="#">Cookie Policy</A></li>
      </ul>
     </div>
    </div>
    <div class="copyrightandsocial container d-flex pt-2 justify-content-center">
     <div>
      <h6>© 2024 <b>EasyFromForge</b> All rights reserved</h6>
     </div>
    </div>
   </section>
  </div>
 );
};

export default ContactUs;
