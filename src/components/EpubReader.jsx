import { useState } from "react";
import { ReactReader } from "react-reader";

export default function EpubReader({ book, onClose }) {
  const [location, setLocation] = useState(null);
  const [toc, setToc] = useState([]);
  const [overlayKey, setOverlayKey] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const handleLocationChanged = (loc) => {
    setLocation(loc);
    if (!isFirstLoad) {
      setOverlayKey((k) => k + 1);
    } else {
      setIsFirstLoad(false);
    }
  };

  return (
    <div className="epub-reader">
      <div className="reader-header">
        <button className="back-btn" onClick={onClose}>
          Quay lại
        </button>
        <h2 className="reader-title">{book.name}</h2>
        <span className="reader-spacer" />
      </div>

      <div className="reader-body">
        {overlayKey > 0 && (
          <div key={overlayKey} className="page-turn-overlay" />
        )}
        <ReactReader
          url={book.file}
          location={location}
          locationChanged={handleLocationChanged}
          tocChanged={(t) => setToc(t)}
          epubOptions={{
            flow: "paginated",
            manager: "default",
          }}
        />
      </div>
    </div>
  );
}
