import { RequestHandler } from 'express';
import { connectLedger } from '../../services/qldb/ConnectToLedger';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(connectLedger);
