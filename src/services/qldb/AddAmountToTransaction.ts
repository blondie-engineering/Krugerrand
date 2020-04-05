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

import { closeQldbSession, createQldbSession } from "./ConnectToLedger";
import { AD_DATA_TRANSACTIONS } from "./model/SampleData";
import { AD_DATA_TABLE_NAME } from "./qldb/Constants";
import { error, log } from "./qldb/LogUtil";
import { getDocumentId, getFieldValue, writeValueAsIon } from "./qldb/Util";
import { Request, Response, RequestHandler } from 'express';
/**
 * Query a driver's information using the given ID.
 * @param txn The {@linkcode TransactionExecutor} for lambda execute.
 * @param documentId The unique ID of a document in the Person table.
 * @returns Promise which fulfills with a Reader containing the person.
 */




export async function updateTransactionAmountForCompany(txn: TransactionExecutor, company: string, amount: number): Promise<void> {

    const statement: string = `UPDATE AdData SET amount = amount + ${amount} WHERE Company = ?`;

    const writer: QldbWriter = createQldbWriter();
    writeValueAsIon(company, writer);

    log(`Updating the inEth status for company name: ${company}...`);
    await txn.executeInline(statement, [writer]).then((result: Result) => {
        const resultList: Reader[] = result.getResultList();
        if (resultList.length === 0) {
            throw new Error("Unable to update company status, could not find company.");
        }
        log(`Successfully updated transaction with company ${company} to new amount.`);
    });
}

export const updateTransactionAmountForCompanyHandler: RequestHandler = async (req: Request, res: Response) => {
  let session: QldbSession;
  try {
      session = await createQldbSession();
      const company: string = req.query.company
      const amount: number = req.query.amount;
      await session.executeLambda(async (txn) => {
          await updateTransactionAmountForCompany(txn, company, amount);
      }, () => log("Retrying due to OCC conflict..."));
      res.send({ message: "Successfully updated amount"}).status(200);
  } finally {
      closeQldbSession(session);
  }
}