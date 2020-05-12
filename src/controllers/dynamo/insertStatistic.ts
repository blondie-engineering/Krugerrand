import { insertStatistic } from '../../services/dynamo/InsertStatistic';
import { RequestHandler } from 'express';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(insertStatistic);
