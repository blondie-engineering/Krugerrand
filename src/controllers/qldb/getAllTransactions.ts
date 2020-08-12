import { RequestHandler } from 'express';
import { getAllTransactionsHandler } from '../../services/qldb/FindTransactions';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(getAllTransactionsHandler);
