import { RequestHandler } from 'express';
import { updateTransactionAmountForCompanyHandler } from '../../services/qldb/AddAmountToTransaction';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(updateTransactionAmountForCompanyHandler);
