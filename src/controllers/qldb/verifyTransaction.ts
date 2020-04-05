import { verifyTransactionHandler } from '../../services/qldb/GetRevision';
import { RequestHandler } from 'express';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(verifyTransactionHandler);
