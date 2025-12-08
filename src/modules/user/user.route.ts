import { Request, Response, Router } from "express";

import { userController } from "./user.controller";
import auth from "../../middleware/auth";
import logger from "../../middleware/logger";

const router = Router();

router.post("/", userController.createUser);
router.get("/", logger, auth("admin"), userController.getUsers);
router.get("/:id", userController.getSingleUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
export const userRoutes = router;
