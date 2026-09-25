import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  ConciergeBell,
  GraduationCap,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { HomeModel } from "./home-model";

const pathwayIcons = [BriefcaseBusiness, ConciergeBell, GraduationCap];

export function SkybookHero({ model }: { model: HomeModel }) {
  const [failed, setFailed] = useState(false);
  const defaultTitle = model.hero.title === "Big dreams. Bright beginnings.";
  return (
    <section className="sk-hero" aria-labelledby="skybook-title">
      <div className="sk-container sk-hero-grid">
        <div className="sk-hero-copy">
          <p className="sk-eyebrow">
            <span className="sk-small-line" aria-hidden="true" />
            {model.hero.eyebrow}
          </p>
          <h1 id="skybook-title">
            {defaultTitle ? (
              <>
                Big dreams.
                <br />
                <span>
                  Bright
                  <br className="sk-desktop-break" /> beginnings.
                </span>
              </>
            ) : (
              model.hero.title
            )}
          </h1>
          <p className="sk-hero-description">{model.hero.summary}</p>
          <div className="sk-actions">
            <Link to="/programs" className="sk-button">
              Explore programs <ArrowRight size={19} aria-hidden="true" />
            </Link>
            <Link
              to="/admissions#visit"
              className="sk-button sk-button-outline"
            >
              Plan a campus visit
            </Link>
          </div>
          <p className="sk-signature">Learn. Grow. Belong.</p>
        </div>
        <figure className="sk-hero-art">
          {failed ? (
            <div className="sk-hero-art-fallback">
              <BookOpen size={88} strokeWidth={1} aria-hidden="true" />
              <span>A new chapter is waiting.</span>
            </div>
          ) : (
            <picture>
              <source
                media="(max-width: 767px)"
                srcSet="/images/skybook/skybook-mobile-480.webp 480w, /images/skybook/skybook-mobile-960.webp 960w"
                sizes="100vw"
              />
              <img
                src="/images/skybook/skybook-desktop-1440.webp"
                srcSet="/images/skybook/skybook-desktop-960.webp 960w, /images/skybook/skybook-desktop-1440.webp 1440w, /images/skybook/skybook-desktop-1920.webp 1920w"
                sizes="(min-width: 1440px) 900px, (min-width: 1024px) 65vw, 100vw"
                alt="Illustrative AI-generated artwork: an open sketchbook becomes an imagined campus, with a blue path and a college-age student turning a page."
                width="1440"
                height="1080"
                fetchPriority="high"
                loading="eager"
                onError={() => setFailed(true)}
              />
            </picture>
          )}
          <figcaption>
            Imagination, illustrated. <span>AI-generated campus concept.</span>
          </figcaption>
        </figure>
      </div>
      <div className="sk-container sk-pathway-wrap">
        <nav className="sk-pathways" aria-label="Explore study pathways">
          {model.programs.map((program, index) => {
            const Icon = pathwayIcons[index];
            return (
              <Link to={`/programs/${program.slug}`} key={program.slug}>
                <Icon size={28} strokeWidth={1.5} aria-hidden="true" />
                <span>{program.label}</span>
                <ArrowRight size={21} aria-hidden="true" />
              </Link>
            );
          })}
        </nav>
        <a className="sk-scroll-note" href="#find-your-future">
          A little curiosity goes a long way{" "}
          <ArrowDown size={14} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
