import { Request, Response, RequestHandler } from 'express';
import { createDbClient } from './CreateDbClient';

const TABLE_NAME = 'Statistics';
var params = {
  TableName: 'Statistics',
  Item: {
    'storage' : {S: 'put'},
    'operation_type' : {S: 'qldb'},
    'time': {S: '100'}
  }
};



export const getStatistics: RequestHandler = async (req: Request, res: Response) => {
  try {
    const dbClient = createDbClient();
    const params = {
      TableName: TABLE_NAME
    };
    dbClient.scan(params, function(err: any, data: any) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(data);
      }
    });
  } catch (e) {
    res.status(500).send(e);
  }
}
