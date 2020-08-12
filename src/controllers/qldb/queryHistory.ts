import { RequestHandler } from 'express';
import { queryHistoryHandler } from '../../services/qldb/QueryHistory';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(queryHistoryHandler);
