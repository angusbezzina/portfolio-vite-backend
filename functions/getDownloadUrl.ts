import type { APIGatewayProxyHandler } from "aws-lambda";

export const getDownloadUrl: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  const { body } = event;
  const response = JSON.parse(body ?? "");
  const { url } = response;
  const headers = {
    "access-control-allow-methods": "OPTIONS,POST",
    "access-control-allow-origin": "*",
    "content-type": "application/json",
  };

  return {
    statusCode: 200,
    body: JSON.stringify({
      body: JSON.stringify({ url }),
      headers: headers,
    }),
  };
};
