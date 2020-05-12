export const createDbClient = () => {
  const AWS = require('aws-sdk');
  return new AWS.DynamoDB();
}
