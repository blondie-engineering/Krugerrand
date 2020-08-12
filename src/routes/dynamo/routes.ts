import { Router } from 'express';
import * as DynamoController from '../../controllers/dynamo';

const router: Router = Router();

router.post('/insertStatistic', DynamoController.insertStatistic);
router.get('/getStatistics', DynamoController.getStatistics);

export default router;
