import { RequestHandler } from 'express';
import { getStatistics } from '../../services/dynamo/GetStatistics';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(getStatistics);
