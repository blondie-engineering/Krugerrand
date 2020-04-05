import { findTransactionsHandler } from '../../services/qldb/FindTransactions';
import { RequestHandler } from 'express';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(findTransactionsHandler);
