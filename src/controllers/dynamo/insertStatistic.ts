import { RequestHandler } from 'express';
import { insertStatistic } from '../../services/dynamo/InsertStatistic';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(insertStatistic);
