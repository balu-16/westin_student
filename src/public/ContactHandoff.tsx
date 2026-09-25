import { ArrowUpRight, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";

/** Listed by the official Vijayawada contact page; recheck before deployment. */
const contact = {
  telephone: "tel:+919393755755",
  whatsapp: "https://api.whatsapp.com/send?phone=919393755755",
  official: "https://www.westincolleges.com/vij/contact.html",
};

export function ContactActions() {
  return (
    <div className="sk-actions">
      <a className="sk-button" href={contact.telephone}>
        <Phone size={17} aria-hidden="true" />
        Call the college
      </a>
      <a
        className="sk-button sk-button-outline"
        href={contact.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle size={18} aria-hidden="true" />
        Chat on WhatsApp<span className="sr-only"> (opens a new tab)</span>
      </a>
    </div>
  );
}

export function ContactHandoff({ visit = false }: { visit?: boolean }) {
  return (
    <section
      className="sk-contact-page sk-container sk-section"
      id={visit ? "visit" : "contact-details"}
    >
      <p className="sk-eyebrow">
        {visit
          ? "Come get a feel for your next chapter"
          : "Let’s start a conversation"}
      </p>
      <h1>
        {visit ? "Picture yourself here." : "Good questions. Warm welcomes."}
      </h1>
      <p className="sk-lead">
        {visit
          ? "Talk to the Vijayawada team about visiting the college, exploring a program and finding your next step."
          : "Speak with the Vijayawada team about programs, admissions or a campus visit."}
      </p>
      <ContactActions />
      <div className="sk-contact-details">
        <div>
          <span className="sk-eyebrow">Vijayawada campus</span>
          <p>+91 93 93 755 755</p>
          <p>Bharathi Nagar, Vijayawada</p>
        </div>
        <div>
          <p>
            A conversation starts here. Admission and visit arrangements are
            confirmed directly by the college.
          </p>
          <a
            href={contact.official}
            target="_blank"
            rel="noopener noreferrer"
            className="sk-text-link"
          >
            Official contact details{" "}
            <ArrowUpRight size={17} aria-hidden="true" />
            <span className="sr-only"> (opens a new tab)</span>
          </a>
        </div>
      </div>
      <Link to="/programs" className="sk-text-link">
        Explore your study pathways{" "}
        <ArrowUpRight size={17} aria-hidden="true" />
      </Link>
    </section>
  );
}
