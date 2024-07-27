import Airtable from "airtable";
import type { APIGatewayProxyHandler } from "aws-lambda";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  const AIRTABLE = {
    API_KEY: process.env.AIRTABLE_API_KEY || "",
    BASE: process.env.AIRTABLE_BASE || "",
    TABLE: process.env.AIRTABLE_TABLE || "",
  };
  const base = new Airtable({ apiKey: AIRTABLE.API_KEY }).base(AIRTABLE.BASE);
  const { body } = event;
  const response = JSON.parse(body ?? "");
  const { name, email, message, language } = response;
  const headers = {
    "access-control-allow-methods": "OPTIONS,POST",
    "access-control-allow-origin": "*",
    "content-type": "application/json",
  };

  try {
    await base(AIRTABLE.TABLE).create({
      Email: email,
      Message: message,
      Name: name,
      Language: language,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error(error);

    return {
      headers,
      statusCode: 400,
      body: JSON.stringify({ success: false }),
    };
  }
};
