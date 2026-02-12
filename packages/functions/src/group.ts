import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from "aws-lambda";
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
      TableName: Table.Groups.tableName,
      Key: {
        id: key,
      },
    });

    const data = await documentClient.send(command);

    return {
      statusCode: 200,
      body: data.Item
        ? JSON.stringify(data.Item)
        : JSON.stringify("Error: Group not found"),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
}

export const createHandler: APIGatewayProxyHandlerV2 = async (event) => {
  const body = JSON.parse(event.body || "{}");

  try {
    const command = new PutCommand({
      TableName: Table.Groups.tableName,
      Item: body,
    });

    const createResult = await documentClient.send(command);

    return {
      statusCode: 200,
      body: createResult
        ? JSON.stringify(createResult)
        : JSON.stringify("Error: Group not created"),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
}

export const updateHandler: APIGatewayProxyHandlerV2 = async (event) => {
  const body = JSON.parse(event.body || "{}");

  try {
    const params = {
      TableName: Table.Groups.tableName,
      Key: { id: body.id },
      UpdateExpression:
        "SET title = :title, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":title": body.title,
        ":updatedAt": new Date().toISOString(),
      },
    };

    const command = new UpdateCommand(params);

    const updateResult = await documentClient.send(command);

    return {
      statusCode: 200,
      body: updateResult
        ? JSON.stringify(updateResult)
        : JSON.stringify("Error: Group not updated"),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
}

export const listHandler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const command = new ScanCommand({
      TableName: Table.Groups.tableName,
    });

    const data = await documentClient.send(command);

    return {
      statusCode: 200,
      body: data.Items
        ? JSON.stringify(data.Items)
        : JSON.stringify("Error: Users not listed"),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};

export const deleteHandler: APIGatewayProxyHandlerV2 = async (event) => {
  const body = JSON.parse(event.body || "{}");

  try {
    const command = new DeleteCommand({
      TableName: Table.Groups.tableName,
      Key: {
        id: body.id,
      },
    });

    const data = await documentClient.send(command);
    return {
      statusCode: 200,
      body: data
        ? JSON.stringify(data)
        : JSON.stringify("Error: Group not deleted"),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
}