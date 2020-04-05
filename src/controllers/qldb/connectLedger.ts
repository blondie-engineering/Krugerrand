import { connectLedger } from '../../services/qldb/ConnectToLedger';
import { RequestHandler } from 'express';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(connectLedger);
