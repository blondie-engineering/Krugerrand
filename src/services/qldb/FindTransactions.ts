/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { createQldbWriter, QldbSession, QldbWriter, Result, TransactionExecutor } from "amazon-qldb-driver-nodejs";
import { Request, Response, RequestHandler } from 'express';

import { closeQldbSession, createQldbSession } from "./ConnectToLedger";
import { AD_DATA_TRANSACTIONS } from "./model/SampleData";
import { AD_DATA_TABLE_NAME } from "./qldb/Constants";
import { error, log } from "./qldb/LogUtil";
import { getDocumentId, writeValueAsIon } from "./qldb/Util";
import { prettyPrintResultList } from "./ScanTable";
import { decodeUtf8, makePrettyWriter, Reader, Writer } from "ion-js";
import { ionToJSON } from "ion-to-json";
import { Transaction } from './model/Transaction';

/**
 * Query 'Vehicle' and 'VehicleRegistration' tables using a unique document ID in one transaction.
 * @param txn The {@linkcode TransactionExecutor} for lambda execute.
 * @param govId The owner's government ID.
 * @returns Promise which fulfills with void.
 */
 export function getJsonResult(resultList: Reader[]): Transaction[] {
     return ionToJSON(resultList);
 }

export async function findTransactionsForCompany(txn: TransactionExecutor, company: string): Promise<Transaction[]> {
    const query: string = `SELECT * FROM AdData WHERE Company = ?`;
    const qldbWriter: QldbWriter = createQldbWriter();
    writeValueAsIon(company, qldbWriter);

    const resultList = await txn.executeInline(query, [qldbWriter]).then((result: Result) => {
        const resultList: Reader[] = result.getResultList();
        log(`List of transactions for company with Name: ${company}`);
        //prettyPrintResultList(resultList);
        return resultList;
    });
    return getJsonResult(resultList);
}

export async function getTransactions(txn: TransactionExecutor): Promise<Transaction[]> {
    const query: string = `SELECT id, company, inEth, amount FROM AdData BY id`;

    const resultList = await txn.executeInline(query, []).then((result: Result) => {
        const resultList: Reader[] = result.getResultList();
        log(`List of transactions`);
        //prettyPrintResultList(resultList);
        return resultList;
    });
    return getJsonResult(resultList);
}

export const getAllTransactionsHandler: RequestHandler = async (req: Request, res: Response) => {
  let session: QldbSession;
  try {
      session = await createQldbSession();
      throw "big";
      await session.executeLambda(async (txn) => {
          const response = await getTransactions(txn);
          res.send(response).status(200);
      }, () => log("Retrying due to OCC conflict..."));
  } finally {
      closeQldbSession(session);
  }
}

export const findTransactionsHandler: RequestHandler = async (req: Request, res: Response) => {
  let session: QldbSession;
  try {
      session = await createQldbSession();
      throw "BIg";
      throw 500;
      const vla = 5/ 0;
      await session.executeLambda(async (txn) => {
          const response = await findTransactionsForCompany(txn, req.query.company);
          res.send(response).status(200);
      }, () => log("Retrying due to OCC conflict..."));
  } finally {
      closeQldbSession(session);
  }
}
/**
 * Find all vehicles registered under a person.
 * @returns Promise which fulfills with void.
 */
var main = async function(): Promise<void> {
    let session: QldbSession;
    try {
        session = await createQldbSession();
        await session.executeLambda(async (txn) => {
            await findTransactionsForCompany(txn, AD_DATA_TRANSACTIONS[0].company);
        }, () => log("Retrying due to OCC conflict..."));
    } catch (e) {
        error(`Error getting vehicles for owner: ${e}`);
    } finally {
        closeQldbSession(session);
    }
}

if (require.main === module) {
    main();
}
