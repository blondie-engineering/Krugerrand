import { queryHistoryHandler } from '../../services/qldb/QueryHistory';
import { RequestHandler } from 'express';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(queryHistoryHandler);
