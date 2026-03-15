import { useState } from "react";
import BookSidebar from "./components/BookSidebar";
import WelcomeContent from "./components/WelcomeContent";
import EpubReader from "./components/EpubReader";
import PdfReader from "./components/PdfReader";
import "./App.css";

const isPdf = (book) => book?.file?.toLowerCase().endsWith(".pdf");

export default function App() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSelectBook = (book) => {
    if (selectedBook?.id === book.id) return;
    setSelectedBook(book);
    setSidebarOpen(false);
  };

  const handleCloseReader = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedBook(null);
      setIsClosing(false);
    }, 300);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <img src="/icon.png" alt="logo" className="app-logo" />
        <h1 className="app-title">Vườn Sách</h1>
        <div className="header-spacer" />
        {selectedBook && (
          <span className="reading-indicator">
            Đang đọc: {selectedBook.name}
          </span>
        )}
        <button
          className="sidebar-toggle-btn"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Mở danh sách sách"
        >
          ☰
        </button>
      </header>

      {/* Main layout */}
      <main className="app-main">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left sidebar (30%) */}
        <div className={`sidebar-wrapper${sidebarOpen ? " sidebar-wrapper--open" : ""}`}>
          <BookSidebar
            selectedBook={selectedBook}
            onSelectBook={handleSelectBook}
          />
        </div>

        {/* Right content panel (70%) */}
        <div className="content-panel">
          {!selectedBook ? (
            <WelcomeContent />
          ) : (
            <div
              className={`reader-panel${isClosing ? " reader-panel--closing" : ""}`}
            >
              {isPdf(selectedBook) ? (
                <PdfReader book={selectedBook} onClose={handleCloseReader} />
              ) : (
                <EpubReader book={selectedBook} onClose={handleCloseReader} />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
