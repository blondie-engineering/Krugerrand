import { insertDocumentHandler } from '../../services/qldb/InsertDocument';
import { RequestHandler } from 'express';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(insertDocumentHandler);
