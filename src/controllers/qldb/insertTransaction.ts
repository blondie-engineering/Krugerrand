import { RequestHandler } from 'express';
import { insertTransactionHandler } from '../../services/qldb/InsertDocument';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(insertTransactionHandler);
