import { Request, Response, RequestHandler } from 'express';
import { createDbClient } from './CreateDbClient';

const TABLE_NAME = 'Statistics';
const params = {
  TableName: 'Statistics',
  Item: {
    storage: { S: 'put' },
    operation_type: { S: 'qldb' },
    time: { S: '100' }
  }
};


export const insertStatistic: RequestHandler = async (req: Request, res: Response) => {
  try {
    const dbClient = createDbClient();
    const { storage } = req.body;
    const { operation_type } = req.body;
    const operation_time = req.body.operation_time.toString();
    const time = new Date().getTime().toString();
    const params = {
      TableName: TABLE_NAME,
      Item: {
        storage: { S: storage },
        operation_type: { S: operation_type },
        operation_time: { N: operation_time },
        time: { N: time }
      }
    };
    dbClient.putItem(params, (err: any, data: any) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send('OK');
      }
    });
  } catch (e) {
    res.sendStatus(e.statusCode || 500);
  }
};
