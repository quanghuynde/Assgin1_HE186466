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

  console.error(err.stack);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
