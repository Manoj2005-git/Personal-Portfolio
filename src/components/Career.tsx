import "./styles/Career.css";
import { profile } from "../data/profile";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>

          {profile.internships.map((internship) => (
            <div className="career-info-box" key={`${internship.role}-${internship.company}`}>
              <div className="career-info-in">
                <div className="career-role">
                  <h4>{internship.role}</h4>
                  <h5>{internship.company}</h5>
                </div>
                <h3>{internship.period}</h3>
              </div>
              <p>{internship.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Career;
