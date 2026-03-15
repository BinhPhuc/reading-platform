import { useState, useEffect } from "react";
import { treeData } from "../data/books";

const CATEGORY_META = {
  "van-hoc": { icon: "📚", color: "#e91e8c" },
  "khoa-hoc": { icon: "🔬", color: "#00bcd4" },
  "lich-su": { icon: "🏛️", color: "#ff9800" },
  "cong-nghe": { icon: "💻", color: "#7c4dff" },
  "tam-ly": { icon: "🧠", color: "#66bb6a" },
  "nau-an": { icon: "🍳", color: "#f44336" },
  "giai-tri": { icon: "🎬", color: "#9c27b0" },
  "ky-nang": { icon: "⚒️", color: "#3f51b5" },
  "do-vui": { icon: "📚", color: "#009688" },
};

const isPdf = (book) => book?.file?.toLowerCase().endsWith(".pdf");

async function extractEpubCover(bookFile) {
  const { default: ePub } = await import("epubjs");
  const book = ePub(bookFile);
  try {
    await book.ready;
    await book.loaded.cover;

    let coverPath = book.cover;

    if (!coverPath) {
      const items = Object.values(book.packaging.manifest);
      const candidate = items.find(
        (item) =>
          item.properties?.includes("cover-image") ||
          item.id?.toLowerCase() === "cover" ||
          (item["media-type"]?.startsWith("image/") &&
            item.href?.toLowerCase().includes("cover")),
      );
      if (candidate) {
        coverPath = book.resolve(candidate.href);
      }
    }

    if (!coverPath) return null;

    return await book.archive.createUrl(coverPath, { base64: true });
  } catch {
    return null;
  } finally {
    try {
      book.destroy();
    } catch {}
  }
}

export default function BookSidebar({ selectedBook, onSelectBook }) {
  const [openCategories, setOpenCategories] = useState({});
  const [covers, setCovers] = useState({});

  useEffect(() => {
    const allEpubs = treeData.children
      .flatMap((cat) => cat.children)
      .filter((b) => !isPdf(b));

    if (allEpubs.length === 0) return;

    let cancelled = false;

    allEpubs.forEach(async (b) => {
      const dataUrl = await extractEpubCover(b.file);
      if (cancelled || !dataUrl) return;
      setCovers((prev) => ({ ...prev, [b.id]: dataUrl }));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleCategory = (catId) => {
    setOpenCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-header-icon">🌳</span>
        <span className="sidebar-header-title">Thư Viện</span>
      </div>

      <div className="sidebar-list">
        {treeData.children.map((cat) => {
          const isOpen = !!openCategories[cat.id];
          const meta = CATEGORY_META[cat.id] || {
            icon: "📁",
            color: "#4a90d9",
          };

          return (
            <div key={cat.id} className="sidebar-category">
              <button
                className={`sidebar-cat-btn ${isOpen ? "sidebar-cat-btn--open" : ""}`}
                onClick={() => toggleCategory(cat.id)}
                style={{ "--cat-color": meta.color }}
              >
                <span className="sidebar-cat-icon">{meta.icon}</span>
                <span className="sidebar-cat-name">{cat.name}</span>
                <span
                  className={`sidebar-chevron ${isOpen ? "sidebar-chevron--open" : ""}`}
                >
                  ▸
                </span>
              </button>

              {isOpen && (
                <ul className="sidebar-books">
                  {cat.children.map((book) => (
                    <li key={book.id}>
                      <button
                        className={`sidebar-book-btn ${
                          selectedBook?.id === book.id
                            ? "sidebar-book-btn--active"
                            : ""
                        }`}
                        onClick={() => onSelectBook(book)}
                        title={book.name}
                      >
                        <BookThumb book={book} coverUrl={covers[book.id]} />
                        <span className="sidebar-book-name">{book.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

function BookThumb({ book, coverUrl }) {
  if (isPdf(book)) {
    return <span className="sidebar-thumb sidebar-thumb--pdf">PDF</span>;
  }
  if (coverUrl) {
    return (
      <img
        className="sidebar-thumb sidebar-thumb--img"
        src={coverUrl}
        alt=""
        aria-hidden="true"
      />
    );
  }
  return <span className="sidebar-thumb sidebar-thumb--fallback">📗</span>;
}
