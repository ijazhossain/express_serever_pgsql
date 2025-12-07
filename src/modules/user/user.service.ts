import { pool } from "../../config/db";
import bcrypt from "bcrypt";
const createUserIntoDB = async (payload: Record<string, unknown>) => {
  const { name, email, password } = payload;
  const hashedPassword = await bcrypt.hash(password as string, 10);
  const result = await pool.query(
    `INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING *`,
    [name, email, hashedPassword]
  );
  return result;
};
const getUsersFromDB = async () => {
  const result = await pool.query(`SELECT * FROM users`);
  return result;
};
const getSingleUserFromDB = async (id: string) => {
  const result = await pool.query(`SELECT * FROM users WHERE ID=$1`, [id]);
  return result;
};
const updateUserIntoDB = async (name: string, email: string, id: string) => {
  const result = await pool.query(
    `UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *`,
    [name, email, id]
  );
  return result;
};
const deleteUserFromDB = async (id: string) => {
  const result = await pool.query(`DELETE FROM users WHERE ID=$1`, [id]);
  return result;
};
export const userServices = {
  createUserIntoDB,
  getUsersFromDB,
  getSingleUserFromDB,
  updateUserIntoDB,
  deleteUserFromDB,
};
