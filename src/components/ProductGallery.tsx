import { useState } from 'react';

export function ProductGallery({ name, images }: { name: string; images: string[] }) {
  const [selected, setSelected] = useState(0);
  return (
    <section className="gallery" aria-label={`Fotos de ${name}`}>
      <div className="gallery-main"><img src={images[selected]} alt={`${name}, foto ${selected + 1} de ${images.length}`} width="800" height="640" fetchPriority="high" /></div>
      {images.length > 1 && <>
        <div className="gallery-thumbnails">{images.map((url, index) => (
          <button key={url} className="thumbnail" type="button" aria-label={`Ver foto ${index + 1} de ${name}`} aria-pressed={selected === index} onClick={() => setSelected(index)}>
            <img src={url} alt="" width="100" height="80" loading="lazy" />
          </button>
        ))}</div>
        <p className="gallery-caption" aria-live="polite">Foto {selected + 1} de {images.length}</p>
      </>}
    </section>
  );
}
