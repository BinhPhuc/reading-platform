import { useState, useEffect, useRef } from "react";
import { ReactReader } from "react-reader";

export default function EpubReader({ book, onClose }) {
  const locationRef = useRef(null);
  const isSettledRef = useRef(false);
  const settleTimerRef = useRef(null);
  const [toc, setToc] = useState([]);
  const [overlayKey, setOverlayKey] = useState(0);

  useEffect(() => {
    return () => clearTimeout(settleTimerRef.current);
  }, []);

  const handleLocationChanged = (loc) => {
    locationRef.current = loc;

    if (isSettledRef.current) {
      setOverlayKey((k) => k + 1);
    } else {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = setTimeout(() => {
        isSettledRef.current = true;
      }, 800);
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
          location={null}
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
