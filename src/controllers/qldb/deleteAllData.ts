import { RequestHandler } from 'express';
import { deleteDataHandler } from '../../services/qldb/DeleteData';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(deleteDataHandler);
