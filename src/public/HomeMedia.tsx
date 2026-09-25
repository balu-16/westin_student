import { useState } from "react";
import { ImageOff } from "lucide-react";
import type { HomeImage } from "./home-model";

export function HomeMedia({
  image,
  className = "",
  sizes = "(max-width: 767px) 100vw, 50vw",
  caption,
  priority = false,
}: {
  image: HomeImage;
  className?: string;
  sizes?: string;
  caption?: string;
  priority?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const failed = failedSource === image.src;
  return (
    <figure className={`sk-media ${className}`}>
      <div className="sk-media-frame">
        {failed ? (
          <div
            className="sk-media-unavailable"
            role="img"
            aria-label={image.alt}
          >
            <ImageOff aria-hidden="true" />
            <span>Image currently unavailable</span>
          </div>
        ) : (
          <img
            src={image.src}
            srcSet={
              image.asset
                ? [480, 960, 1440]
                    .map(
                      (width) =>
                        `/images/skybook/${image.asset}-${width}.webp ${width}w`,
                    )
                    .join(", ")
                : undefined
            }
            sizes={image.asset ? sizes : undefined}
            width="1440"
            height="960"
            alt={image.alt}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
            style={{ objectPosition: image.position }}
            onError={() => setFailedSource(image.src)}
          />
        )}
      </div>
      <figcaption>
        {caption && <span>{caption}</span>}
        {image.generated && (
          <span className="sk-image-note">AI-generated illustration</span>
        )}
      </figcaption>
    </figure>
  );
}
