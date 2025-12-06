import { pool } from "../../config/db";

const createUserIntoDB = async (payload: Record<string, unknown>) => {
  const { name, email } = payload;
  const result = await pool.query(
    `INSERT INTO users(name,email) VALUES($1,$2) RETURNING *`,
    [name, email]
  );
  return result;
};
export const userServices={
    createUserIntoDB
}