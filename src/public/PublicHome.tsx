import { useMemo } from "react";
import { createHomeModel } from "./home-model";
import { PUBLIC_CONTENT_MODE, usePublishedSite } from "./usePublicContent";
import { useSkybookMotion } from "./useSkybookMotion";
import { SkybookHero } from "./SkybookHero";
import { ProgramExplorer } from "./ProgramExplorer";
import {
  AdmissionsInvitation,
  CampusChapter,
  CareerChapter,
  JournalChapter,
  LearningChapter,
  PeopleChapter,
  PublicationChapter,
} from "./HomeChapters";

export function PublicHome() {
  const published = usePublishedSite();
  const model = useMemo(
    () => createHomeModel(published.data),
    [published.data],
  );
  const motion = useSkybookMotion();
  return (
    <div
      ref={motion}
      className="sk-home"
      data-public-fixture={
        PUBLIC_CONTENT_MODE === "fixture" ? "true" : undefined
      }
    >
      <SkybookHero model={model} />
      <ProgramExplorer programs={model.programs} />
      <LearningChapter model={model} />
      <CampusChapter model={model} />
      <CareerChapter model={model} />
      <PeopleChapter model={model} />
      <JournalChapter
        model={model}
        loading={published.loading}
        unavailable={!!published.error}
      />
      <PublicationChapter model={model} />
      <AdmissionsInvitation />
    </div>
  );
}
