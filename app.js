const express = require("express");

const articleRouter = require("./routers/articleRouter");
const commentRouter = require("./routers/commentRouter");

const app = express();

const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers
app.use("/articles", articleRouter);
app.use("/comments", commentRouter);

// Error-handling middleware
app.use((err, req, res, next) => {
  if (err.status === 400 && (err instanceof SyntaxError || err.type === 'entity.parse.failed')) {
    return res.status(400).json({
      error: "Cú pháp JSON không hợp lệ! Vui lòng kiểm tra lại Body trong Postman (xóa các dấu ngoặc kép bọc ngoài, dấu phẩy thừa hoặc ô trống).",
    });
  }

  console.error(err.stack);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
