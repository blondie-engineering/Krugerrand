import { RequestHandler } from 'express';
import { findTransactionsHandler } from '../../services/qldb/FindTransactions';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(findTransactionsHandler);
