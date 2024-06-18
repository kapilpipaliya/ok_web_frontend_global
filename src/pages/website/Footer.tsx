import "~/pages/website/style.css";
import "~/pages/website/krd.css";
import { Icon } from "@iconify-icon/solid";
import { For } from "solid-js";

interface FooterLinkProps {
  href: string;
  children: string;
}

interface SocialIconProps {
  href: string;
  icon: string;
}

interface FooterSectionProps {
  title: string;
  links: { href: string; text: string }[];
}

const FooterLink = (props: FooterLinkProps) => (
  <li>
    <a href={props.href}>{props.children}</a>
  </li>
);

const SocialIcon = (props: SocialIconProps) => (
  <a href={props.href} aria-label={`Follow us on ${props.icon.split(":")[1]}`}>
    <Icon icon={props.icon} height={30} width={30} />
  </a>
);

const FooterSection = (props: FooterSectionProps) => (
  <div class="company">
    <h5>{props.title}</h5>
    <ul>
      <For each={props.links}>
        {(link) => (
          <FooterLink href={link.href}>{link.text}</FooterLink>
        )}
      </For>
    </ul>
  </div>
);

export function Footer() {
  const companyLinks = [
    { href: "#", text: "About Us" },
    { href: "#", text: "Testimonials" },
    { href: "#", text: "My Account" },
    { href: "#", text: "Blogs" },
  ];

  const links = [
    { href: "#", text: "Site maps" },
    { href: "#", text: "Blogs" },
    { href: "#", text: "Documentation" },
    { href: "#", text: "Return" },
  ];

  const socialIcons = [
    { href: "#", icon: "fa-brands:facebook-square" },
    { href: "#", icon: "fa-brands:twitter-square" },
    { href: "#", icon: "fa-brands:linkedin" },
    { href: "#", icon: "fa-brands:youtube-square" },
  ];

  return (
    <section class="footer" aria-labelledby="footer-heading">
      <h2 id="footer-heading" class="sr-only">Footer</h2>
      <div class="pb-3 flex jc:space-around ai:center flex-direction:row">
        <div class="info d-grid align-content-spacebetween">
          <div>
            <a href="/" aria-label="EasyFormForge Home">
              <img class="headerLogo" src="graphics/logo.png" alt="EasyFormForge Logo" />
            </a>
            <p>Design and publish forms faster, smoother</p>
          </div>

          <a class="pb-1 btn-underline" href="#" aria-label="Get Easy Form Forge">
            Get Easy Form Forge <Icon icon="fa-solid:arrow-right" />
          </a>
          <div class="footericon">
            <For each={socialIcons}>
              {(icon) => (
                <SocialIcon href={icon.href} icon={icon.icon} />
              )}
            </For>
          </div>
        </div>
        <FooterSection title="Company" links={companyLinks} />
        <FooterSection title="Links" links={links} />
        <FooterSection title="Privacy" links={companyLinks} />
      </div>
      <div class="copyrightandsocial container d-flex pt-2 justify-content-center">
        <div>
          <h6>
            © 2024 <b>EasyFormForge </b> All rights reserved
          </h6>
        </div>
        <div>
          <For each={socialIcons}>
            {(icon) => (
              <Icon icon={icon.icon} height={30} width={30} aria-label={`Follow us on ${icon.icon.split(":")[1]}`} />
            )}
          </For>
        </div>
      </div>
    </section>
  );
}
