import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "permalist",
    password: "password@1010",
    port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
    {id : 1, title : "write code"},
    {id : 2, title : "wash hair"},
];
//Get all items in the list
app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM items ORDER BY id ASC");
        items = result.rows;
        res.render("index.ejs", {listTitle: "Today", listItems: items});
    } catch (err) {
        console.log(err);
    }
});

app.post("/add", async (req, res) => {
    const item = req.body.newItem;
    try {
        await db.query("INSERT INTO items (title) VALUES ($1);",[item]);  
        res.redirect("/");
    } catch (err) {
        console.log(err)
    }
});
app.post("/edit", async(req, res) => {
    //get hold of the id
    const id = req.body.updatedItemId;
    const newname = req.body.updatedItemTitle;
    //change the table
    try {
        await db.query("UPDATE items SET title = $1 WHERE id = $2", [newname, id]);
        res.redirect("/");
    } catch (err) {
        console.log(err)
    }
});
app.post("/delete", async (req, res) => {
    //get hold of the id
    const id = req.body.deleteItemId;
    try {
        await db.query("DELETE FROM items WHERE id = $1", [id]);
        res.redirect("/");
    } catch (err) {
        console.log(err)
    }
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});