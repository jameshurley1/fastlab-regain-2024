import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Table } from "sst/node/table";

const client = new DynamoDBClient();
const documentClient = DynamoDBDocumentClient.from(client);

export const getHandler: APIGatewayProxyHandlerV2 = async (event) => {
  const key = event?.pathParameters?.id || "";

  try {
    const command = new GetCommand({
      TableName: Table.Stats.tableName,
      Key: {
        id: key,
      },
    });

    const data = await documentClient.send(command);

    return {
      statusCode: 200,
      body: data.Item
        ? JSON.stringify(data.Item)
        : JSON.stringify("Error: Stat not found"),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};

export const createHandler: APIGatewayProxyHandlerV2 = async (event) => {
  const body = JSON.parse(event.body || "{}");

  try {
    const command = new PutCommand({
      TableName: Table.Stats.tableName,
      Item: body,
    });

    await documentClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify(body),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};

export const updateHandler: APIGatewayProxyHandlerV2 = async (event) => {
  const body = JSON.parse(event.body || "{}");

  try {
    const params = {
      TableName: Table.Stats.tableName,
      Key: { id: body.id },
      UpdateExpression:
        "SET userId = :userId, exerciseId = :exerciseId, pain = :pain, complexity = :complexity, comments = :comments, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":userId": body.userId,
        ":exerciseId": body.exerciseId,
        ":pain": body.pain,
        ":complexity": body.complexity,
        ":comments": body.comments,
        ":updatedAt": new Date().toISOString(),
      },
    };

    const command = new UpdateCommand(params);

    await documentClient.send(command); // UpdateCommand does not return data

    return {
      statusCode: 200,
      body: JSON.stringify(body),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};

export const listHandler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const command = new ScanCommand({
      TableName: Table.Stats.tableName,
    });

    const data = await documentClient.send(command);

    return {
      statusCode: 200,
      body: data.Items
        ? JSON.stringify(data.Items)
        : JSON.stringify("Error: Stats not listed"),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};

export const deleteHandler: APIGatewayProxyHandlerV2 = async (event) => {
  const key = event?.pathParameters?.id || "";

  try {
    const command = new DeleteCommand({
      TableName: Table.Stats.tableName,
      Key: {
        id: key,
      },
    });

    await documentClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify("Stat deleted"),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};