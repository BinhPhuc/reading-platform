# Reading Platform - Tree UI Plan

## Context
Xây dựng một web app demo đọc sách với giao diện cây (Tree UI) sử dụng ReactJS + D3.js.
Không có database - sách lưu trong thư mục `public/books/` và đọc trực tiếp từ file `.epub`.

---

## Cấu trúc thư mục sách
```
public/
└── books/
    ├── van-hoc/        ← Văn học
    ├── khoa-hoc/       ← Khoa học
    ├── lich-su/        ← Lịch sử
    ├── cong-nghe/      ← Công nghệ
    └── tam-ly/         ← Tâm lý
```

---

## Tech Stack
- **Vite + React** (scaffold nhanh, hỗ trợ static file serving)
- **D3.js** - vẽ cây tương tác
- **react-reader** (wrapper epubjs) - đọc file .epub
- **CSS modules** hoặc plain CSS - styling

---

## Project Structure
```
reading-platform/
├── public/
│   └── books/
│       ├── van-hoc/
│       ├── khoa-hoc/
│       ├── lich-su/
│       ├── cong-nghe/
│       └── tam-ly/
├── src/
│   ├── components/
│   │   ├── BookTree.jsx      # D3 tree visualization
│   │   └── EpubReader.jsx    # epub reader panel
│   ├── data/
│   │   └── books.js          # danh sách sách hardcoded theo topic
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## Implementation Steps

### 1. Scaffold project
```bash
npm create vite@latest reading-platform -- --template react
cd reading-platform
npm install d3 react-reader
```

### 2. src/data/books.js
Hardcode danh sách sách theo chủ đề. Mỗi book có:
- `id`, `title`, `file` (đường dẫn tới .epub trong public)

```js
export const treeData = {
  id: "root",
  name: "Thư Viện",
  children: [
    {
      id: "van-hoc",
      name: "Văn học",
      children: [
        { id: "book-1", name: "Tên sách", file: "/books/van-hoc/book.epub" }
      ]
    },
    // ... các topic khác
  ]
}
```

### 3. BookTree.jsx (D3 Tree)
- Dùng `d3.tree()` với layout ngang (horizontal): Root → Topics → Books
- SVG-based rendering trong React với `useEffect` + `useRef`
- **Tương tác:**
  - Click vào topic node → expand/collapse children
  - Click vào book node (leaf) → gọi callback `onSelectBook(book)`
- **Visual:**
  - Root node: hình tròn lớn, màu đậm
  - Topic nodes: hình tròn trung bình, màu trung gian
  - Book nodes: hình chữ nhật nhỏ hoặc tròn nhỏ, leaf style
  - Đường nối (links) có animation khi expand/collapse
  - Label hiển thị tên node

### 4. EpubReader.jsx
- Dùng `react-reader` component
- Nhận prop `bookUrl` (đường dẫn tới file .epub)
- Hiển thị thanh điều hướng (chaper list, prev/next)
- Nút đóng (X) để quay về cây

### 5. App.jsx - Layout logic
- State: `selectedBook` (null hoặc book object)
- **Khi không có sách được chọn:** Tree chiếm toàn màn hình, centered
- **Khi có sách được chọn:**
  - Layout split view: Tree thu nhỏ bên trái (35%), Reader hiện ra bên phải (65%)
  - CSS transition animation
- Truyền `onSelectBook` callback xuống BookTree
- Truyền `bookUrl` và `onClose` xuống EpubReader

---

## Layout Design (ASCII)

### Trạng thái ban đầu:
```
+------------------------------------------+
|         📚 Reading Platform              |
+------------------------------------------+
|                                          |
|          [Thư Viện]                      |
|         /    |    \                      |
|    [VH]  [KH]  [LS]  [CN]  [TL]        |
|     |     |                              |
|  [book] [book]                           |
|                                          |
+------------------------------------------+
```

### Khi chọn sách:
```
+-------------+----------------------------+
|   Tree      |     EPUB Reader            |
|   (35%)     |         (65%)              |
|             |  [← Back]  Chapter 1 of N  |
| [Thư Viện]  |                            |
|  /  |  \   |   Nội dung sách...         |
| [VH][KH].. |                            |
|   |         |   [Prev Page] [Next Page]  |
| [book*]     |                            |
+-------------+----------------------------+
```

---

## Verification
1. `npm install` → không có lỗi dependency
2. Đặt 1-2 file .epub thử vào `public/books/van-hoc/`
3. Cập nhật `src/data/books.js` với tên và đường dẫn file đó
4. `npm run dev` → mở browser tại localhost:5173
5. Kiểm tra cây hiển thị đúng: Root → 5 topics → books
6. Click topic → expand/collapse
7. Click book → reader mở bên phải
8. Click đóng → quay về cây toàn màn hình
