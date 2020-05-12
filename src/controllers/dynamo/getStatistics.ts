import { getStatistics } from '../../services/dynamo/GetStatistics';
import { RequestHandler } from 'express';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(getStatistics);
