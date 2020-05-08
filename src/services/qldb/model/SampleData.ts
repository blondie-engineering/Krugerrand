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

import { Decimal } from "ion-js";
import { Transaction } from "./Transaction";

const EMPTY_SECONDARY_OWNERS: object[] = [];
export const AD_DATA_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    company: "PwC",
    amount: 6000,
    inEth: false
  },
  {
    id: "2",
    company: "AdForm",
    amount: 7000,
    inEth: false
  },
  {
    id: "3",
    company: "Google",
    amount: 3000,
    inEth: false
  },
  {
    id: "4",
    company: "Revolut",
    amount: 9000,
    inEth: false
  },
  {
    id: "5",
    company: "Bending Spoons",
    amount: 6000,
    inEth: false
  }
];
