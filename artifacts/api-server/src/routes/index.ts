import { Router, type IRouter } from "express";
import healthRouter from "./health";
import locationsRouter from "./locations";
import gamesRouter from "./games";

const router: IRouter = Router();

router.use(healthRouter);
router.use(locationsRouter);
router.use(gamesRouter);

export default router;
