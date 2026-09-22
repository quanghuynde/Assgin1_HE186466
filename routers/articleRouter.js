const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data.json");

const readData = () => {
    const rawData = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(rawData);
};


const writeData = (data) => {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf-8");
};


//1. GET /articles 
router.get("/", (req, res, next) => {
    try {
        const data = readData();
        res.json(data.articles || []);
    } catch (err) {
        next(err);
    }
});



//2. GET /articles/:id, GET /article/1, GET /article/999
router.get("/:id", (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const data = readData();
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


//3. GET /articles/:id/comments
router.get("/:id/comments", (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const data = readData();
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

//4. POST /articles
router.post("/", (req, res, next) => {
    try {
        const { title, content, author, date } = req.body;

        if (!title || !content || !author || !date) {
            const error = new Error("Title, content, author and date are required");
            error.status = 400;
            return next(error);
        }

        const data = readData();
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
        writeData(data);

        res.status(201).json(newArticle);
    } catch (err) {
        next(err);
    }
});

//5. PUT /articles/:id, PUT /article/1, PUT /article/999
router.put("/:id", (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { title, content, author, date } = req.body;

        const data = readData();
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

        writeData(data);

        res.json(article);
    } catch (err) {
        next(err);
    }
});

//7. DELETE /articles/:id, DELETE /article/1, DELETE /article/999
router.delete("/:id", (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const data = readData();
        const articles = data.articles || [];
        const index = articles.findIndex((a) => a.id === id);

        if (index === -1) {
            const error = new Error("Article not found");
            error.status = 404;
            return next(error);
        }

        const deletedArticle = articles.splice(index, 1)[0];
        data.articles = articles;
        writeData(data);

        res.json(deletedArticle);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
