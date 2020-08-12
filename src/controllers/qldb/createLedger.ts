import { RequestHandler } from 'express';
import { requestLedger } from '../../services/qldb/CreateLedger';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(requestLedger);
