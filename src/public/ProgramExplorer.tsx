import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { HomeProgram } from "./home-model";
import { HomeMedia } from "./HomeMedia";

export function ProgramExplorer({ programs }: { programs: HomeProgram[] }) {
  const [selected, setSelected] = useState(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const program = programs[selected] || programs[0];
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % programs.length
        : event.key === "ArrowLeft"
          ? (index + programs.length - 1) % programs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? programs.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    setSelected(next);
    buttons.current[next]?.focus();
  };
  return (
    <section
      id="find-your-future"
      className="sk-container sk-section sk-programs"
      aria-labelledby="programs-title"
      data-reveal
    >
      <div className="sk-section-heading">
        <div>
          <p className="sk-eyebrow">01 / A direction that feels like you</p>
          <h2 id="programs-title">
            Find your kind
            <br className="sk-mobile-break" /> of <em>future.</em>
          </h2>
        </div>
        <p>
          Different interests. Different possibilities.
          <br />
          One good place to begin.
        </p>
      </div>
      <div className="sk-program-desktop">
        <div
          className="sk-program-tabs"
          role="tablist"
          aria-label="Study pathways"
        >
          {programs.map((item, index) => (
            <button
              key={item.slug}
              type="button"
              role="tab"
              id={`program-tab-${item.slug}`}
              aria-controls={`program-panel-${item.slug}`}
              aria-selected={selected === index}
              tabIndex={selected === index ? 0 : -1}
              ref={(node) => {
                buttons.current[index] = node;
              }}
              onKeyDown={(event) => onKey(event, index)}
              onClick={() => setSelected(index)}
            >
              <span className="sk-tab-number">0{index + 1}</span>
              {item.label}
              <ArrowUpRight size={19} aria-hidden="true" />
            </button>
          ))}
        </div>
        {programs
          .filter((item) => item.slug !== program.slug)
          .map((item) => (
            <div
              key={item.slug}
              id={`program-panel-${item.slug}`}
              role="tabpanel"
              aria-labelledby={`program-tab-${item.slug}`}
              hidden
            />
          ))}
        <div
          className="sk-program-panel"
          role="tabpanel"
          key={program.slug}
          id={`program-panel-${program.slug}`}
          aria-labelledby={`program-tab-${program.slug}`}
          tabIndex={0}
        >
          <HomeMedia
            image={program.image}
            sizes="(min-width: 1200px) 660px, 60vw"
            className="sk-program-photo"
          />
          <div className="sk-program-copy">
            <p className="sk-eyebrow">
              Your {program.shortLabel.toLowerCase()} chapter
            </p>
            <h3>{program.title}</h3>
            <p>{program.summary}</p>
            <ul className="sk-tags">
              {program.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <Link className="sk-text-link" to={`/programs/${program.slug}`}>
              Explore {program.shortLabel.toLowerCase()}{" "}
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
      <div className="sk-program-mobile">
        {programs.map((item, index) => (
          <article key={item.slug}>
            <div className="sk-mobile-program-title">
              <span className="sk-eyebrow">0{index + 1}</span>
              <h3>{item.label}</h3>
            </div>
            <HomeMedia image={item.image} sizes="100vw" />
            <h4>{item.title}</h4>
            <p>{item.summary}</p>
            <Link className="sk-text-link" to={`/programs/${item.slug}`}>
              Explore pathway <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
