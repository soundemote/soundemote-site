import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export type GalleryItem =
  | {
      type: "video";
      youtubeId: string;
      title: string;
      /** Optional external link instead of opening a lightbox (e.g. open on YouTube directly). */
      href?: string;
    }
  | {
      type: "image";
      src: string;
      alt: string;
      /** Optional external link instead of opening a lightbox. */
      href?: string;
    };

function youtubeThumbnail(youtubeId: string) {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

/**
 * Simple click-to-open gallery: a row of thumbnails (video or image), each
 * opening either an inline lightbox (video plays embedded, image shows
 * full-size) or an external link if `href` is set.
 */
export function MediaGallery({ items, className }: { items: GalleryItem[]; className?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openItem = openIndex !== null ? items[openIndex] : null;

  return (
    <>
      <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${className ?? ""}`}>
        {items.map((item, index) => {
          const thumbnail = item.type === "video" ? youtubeThumbnail(item.youtubeId) : item.src;
          const label = item.type === "video" ? item.title : item.alt;
          const content = (
            <>
              <img src={thumbnail} alt={label} className="h-full w-full object-cover" loading="lazy" />
              {item.type === "video" && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-black/70 text-scope">▶</span>
                </span>
              )}
              <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5 text-left mono text-[0.65rem] text-white/90">
                {label}
              </span>
            </>
          );
          const className =
            "group relative aspect-video overflow-hidden rounded-lg border border-border/60 bg-black/40 outline-none transition-colors hover:border-scope/50 focus-visible:border-scope/50";

          return item.href ? (
            <a key={label} href={item.href} target="_blank" rel="noreferrer" className={className} aria-label={label}>
              {content}
            </a>
          ) : (
            <button key={label} type="button" onClick={() => setOpenIndex(index)} className={className} aria-label={label}>
              {content}
            </button>
          );
        })}
      </div>

      <Dialog open={openItem !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="max-w-3xl border-border/60 bg-background p-2 sm:p-4">
          <DialogTitle className="sr-only">
            {openItem ? (openItem.type === "video" ? openItem.title : openItem.alt) : "Media"}
          </DialogTitle>
          {openItem?.type === "video" && (
            <div className="aspect-video w-full overflow-hidden rounded">
              <iframe
                src={`https://www.youtube.com/embed/${openItem.youtubeId}?autoplay=1`}
                title={openItem.title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          {openItem?.type === "image" && (
            <img src={openItem.src} alt={openItem.alt} className="max-h-[80vh] w-full rounded object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default MediaGallery;
