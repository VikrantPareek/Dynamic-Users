const mysql = require("mysql2");
const { faker } = require("@faker-js/faker");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "test",
  password: "vikrantt123",
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

app.get("/", (req, res) => {
  let q = "SELECT count(*) FROM user";
  try {
    connection.query(q, (err, result) => {
      if (err) {
        throw err;
      }
      let count = result[0]["count(*)"];
      res.render("home.ejs", { count });
    });
  } catch (err) {
    res.send("error");
  }
});

app.get("/users", (req, res) => {
  let q = "SELECT id, username, email FROM user";
  try {
    connection.query(q, (err, result) => {
      if (err) {
        throw err;
      }
      let users = result;
      res.render("users.ejs", { users });
    });
  } catch (err) {
    res.send("error");
  }
});

app.get("/users/refresh",(req,res)=>{
  let q = "SELECT * FROM user ORDER BY username ASC";
  try {
    connection.query(q, (err, result) => {
      if (err) {
        throw err;
      }
      let users = result;
      res.render("users.ejs", { users });
    });
  } catch (err) {
    res.send("error");
  }
})

app.get("/users/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT id, username, email, password FROM user WHERE id = ?`;
  try {
    connection.query(q, id, (err, result) => {
      if (err) {
        throw err;
      }
      let data = result[0];
      res.render("edit.ejs", { data });
    });
  } catch (err) {
    res.send("error");
  }
});

app.patch("/users/:id", (req, res) => {
  let { id } = req.params;
  let { email, username, password } = req.body;
  let q = `UPDATE user SET email = ?, username = ? WHERE id = ? AND password = ?`;
  try {
    connection.query(q, [email, username, id, password], (err, result) => {
      if (err) {
        throw err;
      }
      if (result.affectedRows === 0) {
        res.send("enter correct password");
      } else {
        res.redirect("/users");
      }
    });
  } catch (err) {
    res.send("error");
  }
});

app.get("/users/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/users/new", (req, res) => {
  let { username, email, password } = req.body;
  let q = "INSERT INTO user VALUES (?, ?, ?, ?)";
  let data = [faker.string.uuid(), username, email, password];
  try {
    connection.query(q, data, (err, result) => {
      if (err) {
        throw err;
      }
      res.redirect("/users");
    });
  } catch (err) {
    res.send("error");
  }
});

app.delete("/users/:id",(req,res)=>{
  let {id} = req.params;
  let q = "DELETE FROM user WHERE id = ?";
  try {
    connection.query(q, id, (err, result) => {
      if (err) {
        throw err;
      }
      console.log(result)
      res.redirect("/users");
    });
  } catch (err) {
    res.send("error");
  }
})

app.listen(8080, () => {
  console.log("server is started");
});
