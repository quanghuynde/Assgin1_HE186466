const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");

const dataPath = path.join(__dirname, "../data.json");


const readData = async () => {
    const rawData = await fs.readFile(dataPath, "utf-8");
    return JSON.parse(rawData);
};


const writeData = async (data) => {
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2), "utf-8");
};

// 1. GET /articles 
router.get("/", async (req, res, next) => {
    try {
        const data = await readData();
        res.json(data.articles || []);
    } catch (err) {
        next(err);
    }
});

// 2. GET /articles/:id
router.get("/:id", async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const data = await readData();
        const article = (data.articles || []).find((a) => a.id === id);

        if (!article) {
            const error = new Error("Article not found");
            error.status = 404;
            return next(error);
        }

        res.json(article);
    } catch (err) {
        next(err);
    }
});

// 3. GET /articles/:id/comments
router.get("/:id/comments", async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const data = await readData();
        const article = (data.articles || []).find((a) => a.id === id);

        if (!article) {
            const error = new Error("Article not found");
            error.status = 404;
            return next(error);
        }

        const articleComments = (data.comments || []).filter(
            (comment) => comment.articleId === id
        );

        res.json({
            article: article,
            comments: articleComments,
        });
    } catch (err) {
        next(err);
    }
});

// 4. POST /articles
router.post("/", async (req, res, next) => {
    try {
        const { title, content, author, date } = req.body;

        if (!title || !content || !author || !date) {
            const error = new Error("Title, content, author and date are required");
            error.status = 400;
            return next(error);
        }

        const data = await readData();
        const articles = data.articles || [];

        const newId =
            articles.length > 0 ? Math.max(...articles.map((a) => a.id)) + 1 : 1;

        const newArticle = {
            id: newId,
            title,
            content,
            author,
            date,
        };

        articles.push(newArticle);
        data.articles = articles;
        await writeData(data);

        res.status(201).json(newArticle);
    } catch (err) {
        next(err);
    }
});

// 5. PUT /articles/:id
router.put("/:id", async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { title, content, author, date } = req.body;

        const data = await readData();
        const articles = data.articles || [];
        const article = articles.find((a) => a.id === id);

        if (!article) {
            const error = new Error("Article not found");
            error.status = 404;
            return next(error);
        }

        if (title) article.title = title;
        if (content) article.content = content;
        if (author) article.author = author;
        if (date) article.date = date;

        await writeData(data);

        res.json(article);
    } catch (err) {
        next(err);
    }
});

// 6. DELETE /articles/:id
router.delete("/:id", async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const data = await readData();
        const articles = data.articles || [];
        const index = articles.findIndex((a) => a.id === id);

        if (index === -1) {
            const error = new Error("Article not found");
            error.status = 404;
            return next(error);
        }

        const deletedArticle = articles.splice(index, 1)[0];
        data.articles = articles;
        await writeData(data);

        res.json(deletedArticle);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
