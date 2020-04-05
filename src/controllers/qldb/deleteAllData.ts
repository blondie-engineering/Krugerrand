import { deleteDataHandler } from '../../services/qldb/DeleteData';
import { RequestHandler } from 'express';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(deleteDataHandler);
