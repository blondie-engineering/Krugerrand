import { RequestHandler } from 'express';
import { deleteLedgerHandler } from '../../services/qldb/DeleteLedger';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(deleteLedgerHandler);
