import { Request, Response, Router } from "express";

import { userController } from "./user.controller";

const router = Router();

router.post("/", userController.createUser);
router.get("/", userController.getUsers);
router.get("/:id", userController.getSingleUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
export const userRoutes = router;
