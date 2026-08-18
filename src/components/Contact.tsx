import { MdArrowOutward, MdCopyright } from "react-icons/md";
import { TbDownload } from "react-icons/tb";
import "./styles/Contact.css";
import { profile } from "../data/profile";

const Contact = () => {
  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>Contact</h3>
        <div className="contact-flex">
          <div className="contact-box">
            <h4>Email</h4>
            <p>
              <a href={`mailto:${profile.email}`} data-cursor="disable">
                {profile.email}
              </a>
            </p>
          </div>
          <div className="contact-box">
            <h4>Phone</h4>
            <p>
              <a href={`tel:${profile.phone.replace(/\s+/g, "")}`} data-cursor="disable">
                {profile.phone}
              </a>
            </p>
          </div>
          <div className="contact-box">
            <h4>Social</h4>
            <a
              href={profile.github}
              target="_blank"
              data-cursor="disable"
              className="contact-social"
            >
              Github <MdArrowOutward />
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              data-cursor="disable"
              className="contact-social"
            >
              Linkedin <MdArrowOutward />
            </a>
          </div>
          <div className="contact-box">
            <a
              href={profile.resume}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="disable"
              className="contact-resume"
            >
              <TbDownload /> Download Resume
            </a>
          </div>
          <div className="contact-box">
            <h2>
              Built by <span>{profile.name}</span>
            </h2>
            <h5>
              <MdCopyright /> 2026 {profile.name}. All Rights Reserved.
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
