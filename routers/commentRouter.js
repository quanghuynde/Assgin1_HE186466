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

//1. GET /comments 
router.get("/", (req, res, next) => {
    try {
        const data = readData();
        res.json(data.comments || []);
    } catch (err) {
        next(err);
    }
});

//2. GET /comments/:id 
router.get("/:id", (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const data = readData();
        const comment = (data.comments || []).find((c) => c.id === id);

        if (!comment) {
            const error = new Error("Comment not found");
            error.status = 404;
            return next(error);
        }

        res.json(comment);
    } catch (err) {
        next(err);
    }
});

//3. POST /comments
router.post("/", (req, res, next) => {
    try {
        const { articleId, author, content } = req.body;

        if (!articleId || !author || !content) {
            const error = new Error("articleId, author and content are required");
            error.status = 400;
            return next(error);
        }

        const data = readData();
        const articles = data.articles || [];
        const comments = data.comments || [];

        // Check articleId exist
        const articleExists = articles.some((a) => a.id === parseInt(articleId));
        if (!articleExists) {
            const error = new Error(`Article with ID ${articleId} does not exist`);
            error.status = 400;
            return next(error);
        }

        const newId = comments.length > 0 ? Math.max(...comments.map((c) => c.id)) + 1 : 1;
        const newComment = {
            id: newId,
            articleId: parseInt(articleId),
            author,
            content,
            date: new Date().toISOString().split("T")[0],
        };

        comments.push(newComment);
        data.comments = comments;
        writeData(data);

        res.status(201).json(newComment);
    } catch (err) {
        next(err);
    }
});

//4. PUT /comments/:id 
router.put("/:id", (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { author, content } = req.body;

        const data = readData();
        const comments = data.comments || [];
        const comment = comments.find((c) => c.id === id);

        if (!comment) {
            const error = new Error("Comment not found");
            error.status = 404;
            return next(error);
        }

        if (author) comment.author = author;
        if (content) comment.content = content;

        writeData(data);

        res.json(comment);
    } catch (err) {
        next(err);
    }
});

//5. DELETE /comments/:id
router.delete("/:id", (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const data = readData();
        const comments = data.comments || [];
        const index = comments.findIndex((c) => c.id === id);

        if (index === -1) {
            const error = new Error("Comment not found");
            error.status = 404;
            return next(error);
        }

        const deletedComment = comments.splice(index, 1)[0];
        data.comments = comments;
        writeData(data);

        res.json(deletedComment);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
