import type { APIGatewayProxyHandler } from "aws-lambda";

export const hello: APIGatewayProxyHandler = async (event, _context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello from TypeScript!",
      input: event,
    }),
  };
};
