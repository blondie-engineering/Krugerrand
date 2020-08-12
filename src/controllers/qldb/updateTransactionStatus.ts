import { RequestHandler } from 'express';
import { updateTransactionHandler } from '../../services/qldb/UpdateTransactionStatus';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(updateTransactionHandler);
