import { updateTransactionAmountForCompanyHandler } from '../../services/qldb/AddAmountToTransaction';
import { RequestHandler } from 'express';
import handleErrorMiddleware from '../../middleware/handle-error-middleware';

export default handleErrorMiddleware(updateTransactionAmountForCompanyHandler);
