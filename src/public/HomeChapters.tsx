import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Compass,
  Download,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { HomeMedia } from "./HomeMedia";
import { ContactActions } from "./ContactHandoff";
import { displayDate, homeImages, type HomeModel } from "./home-model";

export function LearningChapter({ model }: { model: HomeModel }) {
  const content = model.sections.learning;
  return (
    <section
      className="sk-learning sk-section"
      aria-labelledby="learning-title"
      data-reveal
    >
      <div className="sk-container sk-learning-grid">
        <div className="sk-learning-images">
          <span className="sk-hand-note">
            a little theory.
            <br />a lot of possibility.
          </span>
          <HomeMedia
            image={content?.image || homeImages.business}
            caption="Ideas take shape."
            className="sk-learning-first"
            sizes="(max-width: 767px) 60vw, 350px"
          />
          <HomeMedia
            image={homeImages.hospitality}
            caption="Details make a difference."
            className="sk-learning-second"
            sizes="(max-width: 767px) 60vw, 350px"
          />
          <svg
            className="sk-doodle-path"
            viewBox="0 0 450 360"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M25 320C220 350 60 205 160 165S340 275 355 170 420 55 440 35"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="5 7"
            />
            <path d="m420 40 20-5-4 22" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="sk-learning-copy">
          <p className="sk-eyebrow">02 / More than a classroom</p>
          <h2 id="learning-title">
            {content?.title || (
              <>
                Big ideas.
                <br />
                <em>Real-world</em> practice.
              </>
            )}
          </h2>
          <p className="sk-lead">
            {content?.summary ||
              "A question becomes a conversation. An idea becomes a project. And somewhere along the way, you start seeing what you could become."}
          </p>
          <ol className="sk-learning-notes">
            <li>
              <span>01</span>Stay curious.
            </li>
            <li>
              <span>02</span>Try something new.
            </li>
            <li>
              <span>03</span>Make it matter.
            </li>
          </ol>
          <Link to="/why-westin" className="sk-text-link">
            Discover the Westin way{" "}
            <ArrowUpRight size={19} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function CampusChapter({ model }: { model: HomeModel }) {
  const content = model.sections.campus;
  return (
    <section
      className="sk-container sk-section sk-campus"
      aria-labelledby="campus-title"
      data-reveal
    >
      <div className="sk-section-heading">
        <div>
          <p className="sk-eyebrow">03 / Make room for the moments</p>
          <h2 id="campus-title">
            {content?.title || (
              <>
                There’s more
                <br />
                to <em>your day.</em>
              </>
            )}
          </h2>
        </div>
        <div>
          <p>
            {content?.summary ||
              "The conversations after class. The idea you share. The people who make a place feel like yours."}
          </p>
          <Link to="/campus" className="sk-text-link">
            Explore campus life <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="sk-campus-mosaic">
        <HomeMedia
          image={content?.image || homeImages.campus}
          caption="Find your people. Bring your perspective."
          className="sk-campus-wide"
          sizes="(min-width: 768px) 70vw, 100vw"
        />
        <div className="sk-campus-side">
          <HomeMedia
            image={homeImages.collaboration}
            caption="Better ideas, together."
            sizes="(min-width: 768px) 30vw, 100vw"
          />
          <HomeMedia
            image={homeImages.foundation}
            caption="A quiet moment to grow."
            sizes="(min-width: 768px) 30vw, 100vw"
          />
        </div>
      </div>
      <div className="sk-campus-bottom">
        <p className="sk-hand-note">Every day, a new page.</p>
        <Link to="/gallery" className="sk-text-link">
          Explore the gallery <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export function CareerChapter({ model }: { model: HomeModel }) {
  const content = model.sections.career;
  return (
    <section
      className="sk-career sk-section"
      aria-labelledby="career-title"
      data-reveal
    >
      <div className="sk-container">
        <div className="sk-section-heading">
          <div>
            <p className="sk-eyebrow">04 / A future worth getting ready for</p>
            <h2 id="career-title">
              {content?.title || (
                <>
                  From your first idea
                  <br />
                  to your <em>next opportunity.</em>
                </>
              )}
            </h2>
          </div>
          <p>
            {content?.summary ||
              "You don’t need every answer on day one. Start with curiosity, make space for practice and keep looking ahead."}
          </p>
        </div>
        <div className="sk-career-grid">
          <HomeMedia
            image={content?.image || homeImages.mentoring}
            sizes="(min-width: 768px) 50vw, 100vw"
            caption="Make space for a conversation about what comes next."
          />
          <div className="sk-career-path">
            <ol>
              {[
                [
                  "01",
                  "Prepare",
                  "Ask questions. Explore your interests. Build the foundations for the direction you choose.",
                ],
                [
                  "02",
                  "Practise",
                  "Put your thinking to work. Learn from people, projects and the details that make a difference.",
                ],
                [
                  "03",
                  "Look ahead",
                  "Explore career guidance and discover the possibilities beyond your next chapter.",
                ],
              ].map(([number, title, summary]) => (
                <li key={number}>
                  <span className="sk-career-node">{number}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{summary}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="sk-career-links">
              <Link className="sk-text-link" to="/placements">
                Explore placements <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
              <Link className="sk-text-link" to="/career-planner">
                Career planner <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PeopleChapter({ model }: { model: HomeModel }) {
  const { voice } = model;
  return (
    <section
      className="sk-container sk-section sk-people"
      aria-labelledby="people-title"
      data-reveal
    >
      <div className="sk-people-photo">
        <HomeMedia
          image={voice?.image || homeImages.campus}
          sizes="(min-width: 768px) 420px, 100vw"
        />
        <span className="sk-people-stamp" aria-hidden="true">
          <Sparkles size={23} />
          Room to
          <br />
          be you.
        </span>
      </div>
      <div className="sk-people-copy">
        <p className="sk-eyebrow">05 / The people make the place</p>
        {voice ? (
          <>
            <h2 id="people-title">
              A chapter in
              <br />
              <em>their own words.</em>
            </h2>
            <blockquote>
              <p>“{voice.quote}”</p>
              <footer>
                {voice.name}
                {voice.context && <span>{voice.context}</span>}
              </footer>
            </blockquote>
          </>
        ) : (
          <>
            <h2 id="people-title">
              Different dreams.
              <br />
              <em>A shared beginning.</em>
            </h2>
            <p className="sk-lead">
              Come with your own story. Find new perspectives, build connections
              and make room for the person you’re becoming.
            </p>
            <p>You bring the possibilities. Let’s see where they take you.</p>
          </>
        )}
        <Link
          to={voice ? "/testimonials" : "/success-stories"}
          className="sk-text-link"
        >
          Explore people & stories <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export function JournalChapter({
  model,
  loading,
  unavailable,
}: {
  model: HomeModel;
  loading: boolean;
  unavailable: boolean;
}) {
  const featured = model.stories[0];
  return (
    <section
      className="sk-journal sk-section"
      aria-labelledby="journal-title"
      data-reveal
    >
      <div className="sk-container">
        <div className="sk-section-heading">
          <div>
            <p className="sk-eyebrow">06 / There’s always another story</p>
            <h2 id="journal-title">
              The campus <em>journal.</em>
            </h2>
          </div>
          <Link className="sk-text-link" to="/news">
            Explore the journal <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <div className="sk-journal-grid">
          <article className="sk-featured-story">
            <HomeMedia
              image={featured?.image || homeImages.collaboration}
              sizes="(min-width: 768px) 55vw, 100vw"
            />
            <div className="sk-story-meta">
              <span>
                {featured?.category || "Ideas & everyday discoveries"}
              </span>
              {featured?.date && (
                <time dateTime={featured.date}>
                  {displayDate(featured.date)}
                </time>
              )}
            </div>
            <h3>
              {featured?.title || "Good things begin with a little curiosity."}
            </h3>
            <p>
              {featured?.summary ||
                "Discover the ideas, conversations and moments that bring a college community to life."}
            </p>
            <Link to={featured?.href || "/blog"} className="sk-text-link">
              {featured
                ? "Explore this collection"
                : "Explore ideas & perspectives"}{" "}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </article>
          <div className="sk-journal-list" aria-busy={loading}>
            {loading && (
              <p className="sk-content-status" role="status">
                Checking for the latest published stories…
              </p>
            )}
            {unavailable && (
              <p className="sk-content-status" role="status">
                The latest stories couldn’t be loaded. You can still explore
                Westin below.
              </p>
            )}
            {model.stories.length > 1
              ? model.stories.slice(1).map((story, index) => (
                  <article key={story.id}>
                    <span className="sk-journal-number">0{index + 2}</span>
                    <div>
                      <div className="sk-story-meta">
                        <span>{story.category}</span>
                        {story.date && (
                          <time dateTime={story.date}>
                            {displayDate(story.date)}
                          </time>
                        )}
                      </div>
                      <h3>{story.title}</h3>
                      <p>{story.summary}</p>
                      <Link to={story.href} className="sk-text-link">
                        Explore collection{" "}
                        <ArrowUpRight size={17} aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                ))
              : [
                  [
                    "01",
                    "Campus life",
                    "Make room for the moments.",
                    "Explore life beyond the classroom.",
                    "/campus/events",
                  ],
                  [
                    "02",
                    "Ideas & perspectives",
                    "A different way to see things.",
                    "Discover the college blog.",
                    "/blog",
                  ],
                  [
                    "03",
                    "People & possibilities",
                    "Every journey has a story.",
                    "Explore the success-stories collection.",
                    "/success-stories",
                  ],
                ].map(([number, label, title, copy, to]) => (
                  <article key={number}>
                    <span className="sk-journal-number">{number}</span>
                    <div>
                      <p className="sk-story-meta">{label}</p>
                      <h3>
                        <Link to={to}>
                          {title} <ArrowUpRight size={19} aria-hidden="true" />
                        </Link>
                      </h3>
                      <p>{copy}</p>
                    </div>
                  </article>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function PublicationChapter({ model }: { model: HomeModel }) {
  return (
    <section
      className="sk-container sk-section sk-publications"
      aria-labelledby="publications-title"
      data-reveal
    >
      <div className="sk-publication-copy">
        <p className="sk-eyebrow">07 / A little something to take with you</p>
        <h2 id="publications-title">
          Ideas worth
          <br />
          <em>turning a page for.</em>
        </h2>
        <p className="sk-lead">
          A new perspective. A favourite moment. A story to return to. Discover
          the Westin magazine and visual journal.
        </p>
        <div className="sk-actions">
          <Link className="sk-text-link" to="/magazine">
            <BookOpen size={18} aria-hidden="true" />
            Explore publications <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <Link className="sk-text-link" to="/gallery">
            View gallery <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="sk-publication-art">
        <HomeMedia
          image={homeImages.publications}
          sizes="(min-width: 768px) 50vw, 100vw"
          caption="An illustrated invitation to explore. Not a published edition."
        />
      </div>
      {model.publications.length > 0 && (
        <ul className="sk-editions">
          {model.publications.map((edition) => (
            <li key={edition.id}>
              {edition.image && (
                <HomeMedia image={edition.image} sizes="240px" />
              )}
              <h3>{edition.title}</h3>
              {edition.date && (
                <time dateTime={edition.date}>{displayDate(edition.date)}</time>
              )}
              {edition.pdf ? (
                <a
                  className="sk-text-link"
                  href={edition.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download size={16} aria-hidden="true" />
                  Open PDF
                  {edition.sizeBytes
                    ? ` · ${(edition.sizeBytes / 1024 / 1024).toFixed(1)} MB`
                    : ""}
                  <span className="sr-only"> (opens a new tab)</span>
                </a>
              ) : (
                <Link className="sk-text-link" to="/magazine">
                  Explore publications{" "}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function AdmissionsInvitation() {
  return (
    <section
      className="sk-container sk-invitation-wrap"
      aria-labelledby="invitation-title"
      data-reveal
    >
      <div className="sk-invitation">
        <div className="sk-invitation-paper" aria-hidden="true">
          <BookOpen size={96} strokeWidth={1} />
          <span>
            your next
            <br />
            <em>chapter.</em>
          </span>
          <svg viewBox="0 0 140 70" fill="none">
            <path
              d="M4 51c41 32 30-58 74-38s-12 48-1 26 41-19 56-27m-23 1 23-1-7 21"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div>
          <p className="sk-eyebrow">A little curiosity. A bright beginning.</p>
          <h2 id="invitation-title">
            Your next chapter starts
            <br />
            with a <em>conversation.</em>
          </h2>
          <p>
            Ask about a program. Talk through your options.
            <br />
            Come and see what your next chapter could look like.
          </p>
          <ContactActions />
          <Link to="/admissions#visit" className="sk-text-link">
            <Compass size={17} aria-hidden="true" />
            Plan a campus visit <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
