import { Router } from 'express';
import * as QldbController from '../../controllers/qldb';

const router: Router = Router();

router.get('/createLedger', QldbController.createLedger);
router.get('/connectLedger', QldbController.connectLedger);
router.get('/createModel', QldbController.createTable);
router.get('/findTransactionsForCompany', QldbController.findTransactionsForCompany);
router.get('/getAllTransactions', QldbController.getAllTransactions);
router.post('/insertDocument', QldbController.insertDocument);
router.post('/insertTransaction', QldbController.insertTransaction);
router.get('/updateTransactionStatus', QldbController.updateTransactionStatus);
router.get('/history', QldbController.queryHistory);
router.get('/verifyTransaction', QldbController.verifyTransaction);
router.get('/updateAmount', QldbController.updateAmount);
router.delete('/deleteAllData', QldbController.deleteAllData);
router.delete('/deleteLedger', QldbController.deleteLedger);

export default router;
