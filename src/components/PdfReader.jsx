import { useState, useCallback, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function PdfReader({ book, onClose }) {
  const [numPages, setNumPages] = useState(null);
  const [containerWidth, setContainerWidth] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [renderSet, setRenderSet] = useState(new Set());

  const bodyNodeRef = useRef(null);
  const visibleRatios = useRef({});
  const pageHeights = useRef({});
  const wrapperRefs = useRef({});

  const bodyRef = useCallback((node) => {
    bodyNodeRef.current = node;
    if (!node) return;
    setContainerWidth(node.getBoundingClientRect().width);
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setContainerWidth(e.contentRect.width);
    });
    ro.observe(node);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setCurrentPage(1);
    const initialSet = new Set(Array.from({ length: Math.min(5, numPages) }, (_, i) => i + 1));
    setRenderSet(initialSet);
  };

  useEffect(() => {
    if (!numPages || !bodyNodeRef.current) return;

    const root = bodyNodeRef.current;
    const thresholds = Array.from({ length: 11 }, (_, i) => i / 10);

    const pageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          visibleRatios.current[Number(e.target.dataset.page)] = e.intersectionRatio;
        });
        let best = 1, bestR = -1;
        for (const [p, r] of Object.entries(visibleRatios.current)) {
          if (r > bestR) { bestR = r; best = Number(p); }
        }
        if (bestR > 0) setCurrentPage(best);
      },
      { root, threshold: thresholds },
    );

    const renderObserver = new IntersectionObserver(
      (entries) => {
        setRenderSet((prev) => {
          const next = new Set(prev);
          entries.forEach((e) => {
            const page = Number(e.target.dataset.page);
            if (e.isIntersecting) next.add(page);
            else next.delete(page);
          });
          return next;
        });
      },
      { root, rootMargin: "150% 0px", threshold: 0 },
    );

    const wrappers = root.querySelectorAll("[data-page]");
    wrappers.forEach((el) => {
      pageObserver.observe(el);
      renderObserver.observe(el);
    });

    return () => {
      pageObserver.disconnect();
      renderObserver.disconnect();
    };
  }, [numPages]);

  const pageWidth = containerWidth
    ? Math.min(containerWidth - 48, 900)
    : undefined;

  const estimatedHeight = pageWidth ? Math.round(pageWidth * 1.414) : 1100;

  return (
    <div className="pdf-reader">
      <div className="reader-header">
        <button className="back-btn" onClick={onClose}>
          Quay lại
        </button>
        <h2 className="reader-title">{book.name}</h2>
        <span className="reader-spacer" />
      </div>

      <div className="pdf-body" ref={bodyRef}>
        {numPages && (
          <div className="pdf-page-badge">
            {currentPage} / {numPages}
          </div>
        )}
        <Document
          file={book.file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="pdf-status">Đang tải PDF…</div>}
          error={
            <div className="pdf-status pdf-status--error">
              Không thể tải file PDF.
            </div>
          }
        >
          {numPages &&
            Array.from({ length: numPages }, (_, i) => {
              const pageNum = i + 1;
              const shouldRender = renderSet.has(pageNum);
              const knownHeight = pageHeights.current[pageNum];
              return (
                <div
                  key={pageNum}
                  data-page={pageNum}
                  className="pdf-page-wrapper"
                  ref={(el) => { wrapperRefs.current[pageNum] = el; }}
                  style={
                    !shouldRender
                      ? { minHeight: knownHeight || estimatedHeight, width: pageWidth }
                      : undefined
                  }
                >
                  {shouldRender && (
                    <Page
                      pageNumber={pageNum}
                      width={pageWidth}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      onRenderSuccess={() => {
                        const el = wrapperRefs.current[pageNum];
                        if (el) pageHeights.current[pageNum] = el.getBoundingClientRect().height;
                      }}
                    />
                  )}
                </div>
              );
            })}
        </Document>
      </div>
    </div>
  );
}
