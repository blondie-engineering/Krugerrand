import { requestLedger } from '../../services/qldb/CreateLedger';
import { RequestHandler } from 'express';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(requestLedger);
