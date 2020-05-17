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
import { AD_DATA_TABLE_NAME } from "./qldb/Constants";
import { prettyPrintResultList } from "./ScanTable";
import { error, log } from "./qldb/LogUtil";
import { getDocumentId, writeValueAsIon } from "./qldb/Util";
import { ionToJSON } from "ion-to-json";

/**
 * Find previous primary owners for the given VIN in a single transaction.
 * @param txn The {@linkcode TransactionExecutor} for lambda execute.
 * @param vin The VIN to find previous primary owners for.
 * @returns Promise which fulfills with void.
 */
async function previousPrimaryOwners(txn: TransactionExecutor, id: string): Promise<string> {
    const todaysDate: Date = new Date();
    const threeMonthsAgo: Date = new Date(todaysDate);
    threeMonthsAgo.setMonth(todaysDate.getMonth() - 3);

    const query: string =
        `SELECT data.inEth, data.amount, data.company, data.ethAddress, metadata.version FROM history ` +
        `(${AD_DATA_TABLE_NAME}, \`${threeMonthsAgo.toISOString()}\`, \`${todaysDate.toISOString()}\`) ` +
        `AS h WHERE h.metadata.id = ?`;

    const qldbWriter: QldbWriter = createQldbWriter();
    writeValueAsIon(id, qldbWriter);

    return await txn.executeInline(query, [qldbWriter]).then((result: Result) => {
        log(`Querying the 'AdData' table's history using id: ${id}.`);
        const resultList: Reader[] = result.getResultList();
        return ionToJSON(resultList);
    });
}

export const queryHistoryHandler: RequestHandler = async (req: Request, res: Response) => {
  let session: QldbSession;
  try {
      session = await createQldbSession();
      await session.executeLambda(async (txn) => {
          const result = await previousPrimaryOwners(txn, req.query.id);
          res.send(result).status(200);
      }, () => log("Retrying due to OCC conflict..."));
  } catch(err) {
      res.sendStatus(err.statusCode || 500);
  } finally {
      closeQldbSession(session);
  }
}

/**
 * Query a table's history for a particular set of documents.
 * @returns Promise which fulfills with void.
 */
var main = async function(): Promise<void> {
    let session: QldbSession;
    try {
        session = await createQldbSession();
        const company: string = AD_DATA_TRANSACTIONS[0].company;
        await session.executeLambda(async (txn) => {
            await previousPrimaryOwners(txn, company);
        }, () => log("Retrying due to OCC conflict..."));
    } catch (e) {
        error(`Unable to query history to find previous owners: ${e}`);
    } finally {
        closeQldbSession(session);
    }
}

if (require.main === module) {
    main();
}
