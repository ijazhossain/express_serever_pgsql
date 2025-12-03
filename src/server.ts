import express, { Request, Response } from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });
const app = express();
const port = 5000;
//for parsing json data
app.use(express.json());
// app.use(express.urlencoded())

//creating a pool
const pool = new Pool({
  connectionString: `${process.env.CONNECTION_STR}`,
});

//create table into DB
const initDB = async () => {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        age INT,
        phone VARCHAR(15),
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `);
  await pool.query(`
            CREATE TABLE IF NOT EXISTS todos(
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE, 
            title VARCHAR(200) NOT NULL,
            description TEXT,
            completed BOOLEAN DEFAULT false,
            due_date DATE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at  TIMESTAMP DEFAULT NOW()
            )
            `);
};

initDB();

//root route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello Next level developers");
});

/* ====================
    USER CRUD START
=======================*/
//post users
app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO users(name,email) VALUES($1,$2) RETURNING *`,
      [name, email]
    );
    // console.log(result.rows[0]);
    res.status(200).json({
      success: true,
      message: "Data inserted successfully",
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//get users
app.get("/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM users`);
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.rows,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
      details: err,
    });
  }
});
//get single user
app.get("/users/:id", async (req: Request, res: Response) => {
  console.log(req.params);
  try {
    const result = await pool.query(`SELECT * FROM users WHERE ID=$1`, [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: result.rows[0],
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
//update a user
app.put("/users/:id", async (req: Request, res: Response) => {
  //   console.log(req.params);
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *`,
      [name, email, req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: result.rows[0],
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
  res.send({ message: "API is cool" });
});

//delete a user
app.delete("/users/:id", async (req: Request, res: Response) => {
  console.log(req.params);
  try {
    const result = await pool.query(`DELETE FROM users WHERE ID=$1`, [
      req.params.id,
    ]);
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: result.rows,
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
/* ================
    USER CRUD END
===================*/

/* ====================
    TODO CRUD START
=======================*/
//POST A TODO
app.post("/todos", async (req: Request, res: Response) => {
  const { user_id, title } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO todos(user_id, title) VALUES($1, $2) RETURNING *`,
      [user_id, title]
    );
    res.status(201).json({
      success: true,
      message: "Todo created",
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: true,
      message: err.message,
    });
  }
});
//GET TODOs
app.get("/todos", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM todos");

    res.status(201).json({ success: true, message: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch todo" });
  }
});
//GET SINGLE TODO
app.get("/todos", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM todos WHERE id=$1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.status(201).json({ success: true, message: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch todo" });
  }
});
//UPDATE TODO
app.put("/todos/:id", async (req: Request, res: Response) => {
  const { title, completed } = req.body;
  try {
    const result = await pool.query(
      "UPDATE todos SET title=$1, completed=$2 WHERE id=$3 RETURNING *",
      [title, completed, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update todo" });
  }
});
//DELETE TODO
app.delete("/todos/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "DELETE FROM todos WHERE id=$1 RETURNING *",
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ success: true, message: "Todo deleted", data: null });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete todo" });
  }
});
//not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

//for app listen
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
