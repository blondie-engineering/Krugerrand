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

import {
  createQldbWriter, QldbSession, QldbWriter, TransactionExecutor
} from 'amazon-qldb-driver-nodejs';
import { QLDB } from 'aws-sdk';
import {
  Digest, GetDigestResponse, GetRevisionRequest, GetRevisionResponse, ValueHolder
} from 'aws-sdk/clients/qldb';
import { makeReader, Reader, toBase64 } from 'ion-js';

import { Request, Response, RequestHandler } from 'express';
import { closeQldbSession, createQldbSession } from './ConnectToLedger';
import { getDigestResult } from './GetDigest';
import { AD_DATA_TRANSACTIONS } from './model/SampleData';
import { blockAddressToValueHolder, getMetadataId } from './qldb/BlockAddress';
import { LEDGER_NAME } from './qldb/Constants';
import { error, log } from './qldb/LogUtil';
import { getFieldValue, valueHolderToString, writeValueAsIon } from './qldb/Util';
import { flipRandomBit, verifyDocument } from './qldb/Verifier';

/**
 * Get the revision data object for a specified document ID and block address.
 * Also returns a proof of the specified revision for verification.
 * @param ledgerName Name of the ledger containing the document to query.
 * @param documentId Unique ID for the document to be verified, contained in the committed view of the document.
 * @param blockAddress The location of the block to request.
 * @param digestTipAddress The latest block location covered by the digest.
 * @param qldbClient The QLDB control plane client to use.
 * @returns Promise which fulfills with a GetRevisionResponse.
 */
async function getRevision(
  ledgerName: string,
  documentId: string,
  blockAddress: ValueHolder,
  digestTipAddress: ValueHolder,
  qldbClient: QLDB
): Promise<GetRevisionResponse> {
  const request: GetRevisionRequest = {
    Name: ledgerName,
    BlockAddress: blockAddress,
    DocumentId: documentId,
    DigestTipAddress: digestTipAddress
  };
  const result: GetRevisionResponse = await qldbClient.getRevision(request).promise();
  return result;
}

/**
 * Query the table metadata for a particular vehicle for verification.
 * @param txn The {@linkcode TransactionExecutor} for lambda execute.
 * @param vin VIN to query the table metadata of a specific registration with.
 * @returns Promise which fulfills with a list of Readers that contains the results of the query.
 */
export async function lookupRegistrationForCompany(txn: TransactionExecutor, id: string): Promise<Reader[]> {
  log(`Querying the 'AdData' table for id: ${id}...`);
  let resultList: Reader[];
  const query: string = 'SELECT blockAddress, metadata.id FROM _ql_committed_AdData WHERE metadata.id = ?';

  const qldbWriter: QldbWriter = createQldbWriter();
  writeValueAsIon(id, qldbWriter);

  await txn.executeInline(query, [qldbWriter]).then((result) => {
    resultList = result.getResultList();
  });
  if (!resultList.length) {
    throw 'No such row';
  }
  return resultList;
}

/**
 * Verify each version of the registration for the given VIN.
 * @param txn The {@linkcode TransactionExecutor} for lambda execute.
 * @param ledgerName The ledger to get the digest from.
 * @param vin VIN to query the revision history of a specific registration with.
 * @param qldbClient The QLDB control plane client to use.
 * @returns Promise which fulfills with void.
 * @throws Error: When verification fails.
 */
export async function verifyRegistration(
  txn: TransactionExecutor,
  ledgerName: string,
  id: string,
  qldbClient: QLDB
): Promise<Boolean> {
  log(`Let's verify the adData with id = ${id}, in ledger = ${ledgerName}.`);
  const digest: GetDigestResponse = await getDigestResult(ledgerName, qldbClient);
  const digestBytes: Digest = digest.Digest;
  const digestTipAddress: ValueHolder = digest.DigestTipAddress;

  log(
    `Got a ledger digest: digest tip address = \n${valueHolderToString(digestTipAddress)},
        digest = \n${toBase64(<Uint8Array> digestBytes)}.`
  );
  log(`Querying the Adata form = ${id} to verify each version of the adData...`);
  const resultList: Reader[] = await lookupRegistrationForCompany(txn, id);
  log('Getting a proof for the document.');

  for (const result of resultList) {
    const blockAddress: ValueHolder = blockAddressToValueHolder(result);
    const documentId: string = getMetadataId(result);

    const revisionResponse: GetRevisionResponse = await getRevision(
      ledgerName,
      documentId,
      blockAddress,
      digestTipAddress,
      qldbClient
    );

    const revision: string = revisionResponse.Revision.IonText;
    const revisionReader: Reader = makeReader(revision);

    const documentHash: Uint8Array = getFieldValue(revisionReader, ['hash']);
    const proof: ValueHolder = revisionResponse.Proof;
    log(`Got back a proof: ${valueHolderToString(proof)}.`);

    const verified: boolean = verifyDocument(documentHash, digestBytes, proof);
    return verified;
    // if (!verified) {
    //    throw new Error("Document revision is not verified.");
    // } else {
    //     log("Success! The document is verified.");
    // }
    // const alteredDocumentHash: Uint8Array = flipRandomBit(documentHash);
    //
    // log(
    //     `Flipping one bit in the document's hash and assert that the document is NOT verified.
    //     The altered document hash is: ${toBase64(alteredDocumentHash)}`
    // );
    // verified = verifyDocument(alteredDocumentHash, digestBytes, proof);
    //
    // if (verified) {
    //     throw new Error("Expected altered document hash to not be verified against digest.");
    // } else {
    //     log("Success! As expected flipping a bit in the document hash causes verification to fail.");
    // }
    // log(`Finished verifying the registration with VIN = ${company} in ledger = ${ledgerName}.`);
  }
}

export const verifyTransactionHandler: RequestHandler = async (req: Request, res: Response) => {
  let session: QldbSession;
  try {
    const qldbClient: QLDB = new QLDB();
    session = await createQldbSession();

    await session.executeLambda(async (txn) => {
      const isVerified = await verifyRegistration(txn, LEDGER_NAME, req.query.id, qldbClient);
      res.setHeader('Content-Type', 'application/json');
      res.json({
        message: isVerified ? 'Verified' : 'Hacked'
      }).status(200);
    });
  } catch (err) {
    res.sendStatus(err.statusCode);
  } finally {
    closeQldbSession(session);
  }
};

/**
 * Verify the integrity of a document revision in a QLDB ledger.
 * @returns Promise which fulfills with void.
 */
const main = async function (): Promise<void> {
  let session: QldbSession;
  try {
    const qldbClient: QLDB = new QLDB();
    session = await createQldbSession();

    const registration = AD_DATA_TRANSACTIONS[0];
    const { company } = registration;

    await session.executeLambda(async (txn) => {
      await verifyRegistration(txn, LEDGER_NAME, company, qldbClient);
    });
  } catch (e) {
    error(`Unable to verify revision: ${e}`);
  } finally {
    closeQldbSession(session);
  }
};

if (require.main === module) {
  main();
}
