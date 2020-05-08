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
import { Reader } from "ion-js";
import { Request, Response, RequestHandler } from 'express';
import { closeQldbSession, createQldbSession } from "./ConnectToLedger";
import { AD_DATA_TRANSACTIONS } from "./model/SampleData";
import {
    AD_DATA_TABLE_NAME
} from "./qldb/Constants";
import { error, log } from "./qldb/LogUtil";
import { getFieldValue, writeValueAsIon } from "./qldb/Util";
import { updateTransactionAmountForCompany } from './AddAmountToTransaction';
/**
 * Insert the given list of documents into a table in a single transaction.
 * @param txn The {@linkcode TransactionExecutor} for lambda execute.
 * @param tableName Name of the table to insert documents into.
 * @param documents List of documents to insert.
 * @returns Promise which fulfills with a {@linkcode Result} object.
 */

function buildTransacton(company: string, amount: number): object[] {
  const response = [];
  response.push({
    "company": company,
    "amount": amount,
    "inEth": false
  });
  return response;
}

async function companyAlreadyExists(txn: TransactionExecutor, company: string): Promise<boolean> {
    const query: string = "SELECT * FROM AdData WHERE Company = ?";
    const documentsWriter: QldbWriter = createQldbWriter();
    writeValueAsIon(company, documentsWriter);

    let companyAlreadyExists: boolean = true;
    await txn.executeInline(query, [documentsWriter]).then((result: Result) => {
        const resultList = result.getResultList();
        if (resultList.length === 0) {
            companyAlreadyExists = false;
        }
    });
    return companyAlreadyExists;
}

export async function insertDocument(
    txn: TransactionExecutor,
    tableName: string,
    documents: object[]
): Promise<Result> {
    const statement: string = `INSERT INTO ${tableName} ?`;
    const documentsWriter: QldbWriter = createQldbWriter();
    writeValueAsIon(documents, documentsWriter);
    let result: Result = await txn.executeInline(statement, [documentsWriter]);
    return result;
}

/**
 * Handle the insertion of documents and updating PersonIds all in a single transaction.
 * @param txn The {@linkcode TransactionExecutor} for lambda execute.
 * @returns Promise which fulfills with void.
 */
async function updateAndInsertDocuments(txn: TransactionExecutor, campaigns: object[]): Promise<void> {
    log("Inserting multiple documents into the remaining tables...");
    await Promise.all([
        insertDocument(txn, AD_DATA_TABLE_NAME, campaigns)
    ]);
}

export const insertDocumentHandler: RequestHandler = async (req: Request, res: Response) => {
  let session: QldbSession;
  const campaigns = req.body.campaigns;
  try {
      session = await createQldbSession();
      await session.executeLambda(async (txn) => {
          await updateAndInsertDocuments(txn, campaigns);
      }, () => log("Retrying due to OCC conflict..."));
      res.send({
        message: "Successful Document Insertion"
      }).status(200);
  } catch(err) {
      res.sendStatus(err.statusCode);
  } finally {
      closeQldbSession(session);
  }
}

export const insertTransactionHandler: RequestHandler = async (req: Request, res: Response) => {
  let session: QldbSession;
  const company: string = req.body.company;
  const amount: number = req.body.amount;
  try {
      session = await createQldbSession();
      await session.executeLambda(async (txn) => {
        if(await companyAlreadyExists(txn, company)) {
          updateTransactionAmountForCompany(txn, req.body.company, req.body.amount);
        } else {
          await Promise.all([
              insertDocument(txn, AD_DATA_TABLE_NAME, buildTransacton(company, amount))
          ]);
        }
      }, () => log("Retrying due to OCC conflict..."));
      res.send({
        message: "Successful Document Insertion"
      }).status(200);
  } catch(err) {
      res.sendStatus(err.statusCode);
  } finally {
      closeQldbSession(session);
  }
}

/**
 * Insert documents into a table in a QLDB ledger.
 * @returns Promise which fulfills with void.
 */
var main = async function(): Promise<void> {
    let session: QldbSession;
    try {
        session = await createQldbSession();
        await session.executeLambda(async (txn) => {
            await updateAndInsertDocuments(txn, []);
        }, () => log("Retrying due to OCC conflict..."));
    } catch (e) {
        error(`Unable to insert documents: ${e}`);
    } finally {
        closeQldbSession(session);
    }
}

if (require.main === module) {
    main();
}
