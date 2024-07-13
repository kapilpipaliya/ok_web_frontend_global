import { Icon } from "@iconify-icon/solid";
import { For } from "solid-js";

interface FooterLinkProps {
  children: string;
  href: string;
}

interface SocialIconProps {
  href: string;
  icon: string;
}

interface FooterSectionProps {
  links: { href: string; text: string }[];
  title: string;
}

const FooterLink = (props: FooterLinkProps) => (
  <li>
    <a href={props.href}>{props.children}</a>
  </li>
);

const SocialIcon = (props: SocialIconProps) => (
  <a aria-label={`Follow us on ${props.icon.split(":")[1]}`} href={props.href}>
    <Icon height={30} icon={props.icon} width={30} />
  </a>
);

const FooterSection = (props: FooterSectionProps) => (
  <div class="company">
    <h5>{props.title}</h5>
    <ul>
      <For each={props.links}>
        {(link) => <FooterLink href={link.href}>{link.text}</FooterLink>}
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
    <section aria-labelledby="footer-heading" class="footer">
      <h2 class="sr-only" id="footer-heading">
        Footer
      </h2>
      <div class="pb-3 flex ai:center flex-direction:row jc:space-around">
        <div class="info d-grid align-content-spacebetween">
          <div>
            <a aria-label="EasyFormForge Home" href="/">
              <img
                alt="EasyFormForge Logo"
                class="headerLogo"
                src="graphics/logo.png"
              />
            </a>
            <p>Design and publish forms faster, smoother</p>
          </div>

          <a
            aria-label="Get Easy Form Forge"
            class="pb-1 btn-underline"
            href="#"
          >
            Get Easy Form Forge <Icon icon="fa-solid:arrow-right" />
          </a>
          <div class="footericon">
            <For each={socialIcons}>
              {(icon) => <SocialIcon href={icon.href} icon={icon.icon} />}
            </For>
          </div>
        </div>
        <FooterSection links={companyLinks} title="Company" />
        <FooterSection links={links} title="Links" />
        <FooterSection links={companyLinks} title="Privacy" />
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
              <Icon
                aria-label={`Follow us on ${icon.icon.split(":")[1]}`}
                height={30}
                icon={icon.icon}
                width={30}
              />
            )}
          </For>
        </div>
      </div>
    </section>
  );
}
