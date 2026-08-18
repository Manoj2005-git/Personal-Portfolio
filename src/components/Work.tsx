import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { profile } from "../data/profile";

gsap.registerPlugin(useGSAP);

interface WorkProject {
  name: string;
  category: string;
  description: string;
  tech: string;
  link?: string;
  webpage?: string;
  video?: string;
  image?: string;
}

const Work = () => {
  useGSAP(() => {
  let translateX: number = 0;

  function setTranslateX() {
    const box = document.getElementsByClassName("work-box");
    const rectLeft = document
      .querySelector(".work-container")!
      .getBoundingClientRect().left;
    const rect = box[0].getBoundingClientRect();
    const parentWidth = box[0].parentElement!.getBoundingClientRect().width;
    let padding: number =
      parseInt(window.getComputedStyle(box[0]).padding) / 2;
    translateX = rect.width * box.length - (rectLeft + parentWidth) + padding;
  }

  setTranslateX();

  let timeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".work-section",
      start: "top top",
      end: `+=${translateX}`, // Use actual scroll width
      scrub: true,
      pin: true,
      id: "work",
    },
  });

  timeline.to(".work-flex", {
    x: -translateX,
    ease: "none",
  });

  // Scroll progress bar
  timeline.to(".work-scroll-progress", {
    scaleX: 1,
    ease: "none",
  }, 0);

  // Clean up (optional, good practice)
  return () => {
    timeline.kill();
    ScrollTrigger.getById("work")?.kill();
  };
}, []);
  return (
    <div className="work-section" id="work">
      <div className="work-scroll-track">
        <div className="work-scroll-progress" />
      </div>
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          {(profile.projects as WorkProject[]).map((project, index) => (
            <div className="work-box" key={index}>
              <div className="work-info">
                <div className="work-title">
                  <h3>0{index + 1}</h3>

                  <div>
                    <h4>{project.name}</h4>
                    <p>{project.category}</p>
                  </div>
                </div>
                {project.description && <p>{project.description}</p>}
                <h4>Tools and features</h4>
                <p>{project.tech}</p>
                {"link" in project && project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="disable"
                    className="work-project-link"
                  >
                    View GitHub
                  </a>
                )}
                {"webpage" in project && project.webpage && (
                  <a
                    href={project.webpage}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="disable"
                    className="work-project-link"
                  >
                    View Webpage
                  </a>
                )}
              </div>
              <WorkImage
                image={"image" in project && project.image ? project.image : "/images/placeholder.webp"}
                alt={project.name}
                video={"video" in project ? project.video : undefined}
                link={"webpage" in project ? project.webpage : "link" in project ? project.link : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
