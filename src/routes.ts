import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import apiSpec from '../openapi.json';
import QldbRouter from './routes/qldb/routes';
import DynamoRouter from './routes/dynamo/routes';

const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }'
};

const router = Router();

router.use('/qldb', QldbRouter);
router.use('/dynamo', DynamoRouter);

// Dev routes
if (process.env.NODE_ENV === 'development') {
  router.use('/dev/api-docs', swaggerUi.serve);
  router.get('/dev/api-docs', swaggerUi.setup(apiSpec, swaggerUiOptions));
}

router.use(function(req, res, next) {
  res.send({error: "NotFound"}).status(404);
});

export default router;
