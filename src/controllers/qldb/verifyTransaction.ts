import { RequestHandler } from 'express';
import { verifyTransactionHandler } from '../../services/qldb/GetRevision';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(verifyTransactionHandler);
