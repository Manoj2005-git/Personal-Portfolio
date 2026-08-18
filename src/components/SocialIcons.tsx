import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa6";
import "./styles/SocialIcons.css";
import { TbNotes } from "react-icons/tb";
import { useEffect } from "react";
import HoverLinks from "./HoverLinks";
import { profile } from "../data/profile";

const SocialIcons = () => {
  useEffect(() => {
    const social = document.getElementById("social") as HTMLElement;
    if (!social) return;

    const spans = social.querySelectorAll("span");
    const links = Array.from(spans).map((s) => s.querySelector("a") as HTMLElement).filter(Boolean);

    const mouseLocal = links.map(() => ({ x: 50, y: 25 }));
    const current = links.map(() => ({ x: 0, y: 0 }));

    const onMouseMove = (e: MouseEvent) => {
      spans.forEach((span, i) => {
        const r = (span as HTMLElement).getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        if (x >= 10 && x <= 40 && y >= 5 && y <= 40) {
          mouseLocal[i].x = x;
          mouseLocal[i].y = y;
        } else {
          mouseLocal[i].x = r.width / 2;
          mouseLocal[i].y = r.height / 2;
        }
      });
    };

    let rafId: number;
    const tick = () => {
      links.forEach((link, i) => {
        current[i].x += (mouseLocal[i].x - current[i].x) * 0.1;
        current[i].y += (mouseLocal[i].y - current[i].y) * 0.1;
        link.style.setProperty("--siLeft", `${current[i].x}px`);
        link.style.setProperty("--siTop", `${current[i].y}px`);
      });
      rafId = requestAnimationFrame(tick);
    };

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div className="icons-section">
      <div className="social-icons" data-cursor="icons" id="social">
        <span>
          <a href={profile.github} target="_blank" rel="noreferrer">
            <FaGithub />
          </a>
        </span>
        <span>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            <FaLinkedinIn />
          </a>
        </span>
        <span>
          <a href={profile.instagram} target="_blank" rel="noreferrer">
            <FaInstagram />
          </a>
        </span>
      </div>
      <a
        className="resume-button"
        href={profile.resume}
        target="_blank"
        rel="noopener noreferrer"
      >
        <HoverLinks text="RESUME" />
        <span>
          <TbNotes />
        </span>
      </a>
    </div>
  );
};

export default SocialIcons;
