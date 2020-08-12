import { RequestHandler } from 'express';
import { createTables } from '../../services/qldb/CreateTable';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(createTables);
