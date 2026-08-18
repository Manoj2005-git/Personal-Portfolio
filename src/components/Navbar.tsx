import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "gsap";
import HoverLinks from "./HoverLinks";
import "./styles/Navbar.css";
import { profile } from "../data/profile";

gsap.registerPlugin(ScrollTrigger);

export const smoother = { paused: (_v: boolean) => {} };

const Navbar = () => {
  useEffect(() => {
    const links = document.querySelectorAll(".header ul a");
    links.forEach((elem) => {
      const element = elem as HTMLAnchorElement;
      element.addEventListener("click", (e) => {
        if (window.innerWidth > 1024) {
          const href = element.getAttribute("data-href");
          if (href && href.startsWith("#")) {
            e.preventDefault();
            const target = document.querySelector(href);
            target?.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      });
    });
  }, []);
  return (
    <>
      <div className="header">
        <a href="/#" className="navbar-title" data-cursor="disable">
          {profile.initials}
        </a>
        <a
          href={`mailto:${profile.email}`}
          className="navbar-connect"
          data-cursor="disable"
        >
          {profile.email}
        </a>
        <ul>
          <li>
            <a data-href="#about" href="#about">
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work">
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact">
              <HoverLinks text="CONTACT" />
            </a>
          </li>
        </ul>
      </div>

      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
