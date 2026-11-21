'use client';
import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const start = useRef<number | null>(null);
  const dragged = useRef(false);
  function show(index: number) {
    setActive((index + images.length) % images.length);
    setZoom(false);
  }
  return (
    <div className="product-gallery">
      <div
        className="gallery-viewport"
        onKeyDown={(e) => {
          if (images.length < 2) return;
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            show(active + 1);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            show(active - 1);
          }
        }}
      >
        <button
          className={`gallery-main ${zoom ? 'zoomed' : ''}`}
          aria-label="Toggle image zoom"
          aria-pressed={zoom}
          onPointerDown={(e) => {
            start.current = e.clientX;
            dragged.current = false;
          }}
          onPointerUp={(e) => {
            if (start.current === null || images.length < 2) return;
            const distance = e.clientX - start.current;
            start.current = null;
            if (Math.abs(distance) > 40) {
              dragged.current = true;
              show(active + (distance < 0 ? 1 : -1));
            }
          }}
          onPointerCancel={() => {
            start.current = null;
          }}
          onClick={() => {
            if (dragged.current) {
              dragged.current = false;
              return;
            }
            setZoom(!zoom);
          }}
        >
          {images[active] ? (
            <img
              key={images[active]}
              src={images[active]}
              alt={`${name} — view ${active + 1}`}
              draggable={false}
              fetchPriority="high"
            />
          ) : (
            <span>IMAGE UNAVAILABLE</span>
          )}
        </button>
        {images.length > 1 && (
          <>
            <span className="gallery-caption">
              {String(active + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </span>
            <button
              className="gallery-control gallery-prev"
              aria-label="Previous product image"
              onClick={() => show(active - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="gallery-control gallery-next"
              aria-label="Next product image"
              onClick={() => show(active + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="thumbnails">
          {images.map((url, index) => (
            <button
              key={`${url}-${index}`}
              onClick={() => show(index)}
              aria-label={`Image ${index + 1}`}
              aria-pressed={active === index}
            >
              <img src={url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
