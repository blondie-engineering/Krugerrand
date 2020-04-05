import { updateTransactionHandler } from '../../services/qldb/UpdateTransactionStatus';
import { RequestHandler } from 'express';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(updateTransactionHandler);
