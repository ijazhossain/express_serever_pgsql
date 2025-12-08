import express, { Request, Response } from "express";

import dotenv from "dotenv";
import path from "path";
import config from "./config";
import initDB, { pool } from "./config/db";
import { userRoutes } from "./modules/user/user.route";
import { authRoutes } from "./modules/auth/auth.routes";
dotenv.config({ path: path.join(process.cwd(), ".env") });
const app = express();
const port = config.port;
//for parsing json data
app.use(express.json());
// app.use(express.urlencoded())

initDB();

//root route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello Next level developers");
});

//user route
app.use("/users", userRoutes);

//auth routes
app.use("/auth", authRoutes);
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
export default app;
