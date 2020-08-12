import { RequestHandler } from 'express';
import { insertDocumentHandler } from '../../services/qldb/InsertDocument';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(insertDocumentHandler);
