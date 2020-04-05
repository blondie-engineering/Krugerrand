import { deleteLedgerHandler } from '../../services/qldb/DeleteLedger';
import { RequestHandler } from 'express';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(deleteLedgerHandler);
