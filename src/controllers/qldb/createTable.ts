import { createTables } from '../../services/qldb/CreateTable';
import { RequestHandler } from 'express';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(createTables);
