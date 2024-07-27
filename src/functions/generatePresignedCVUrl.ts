import S3 from "aws-sdk/clients/s3";
import type { APIGatewayProxyHandler } from "aws-lambda";

const s3 = new S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
});

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  const { body } = event;
  const response = JSON.parse(body ?? "");
  const { path, filename } = response;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: path,
    Expires: 60, // URL expiry time
    ResponseContentDisposition: `attachment; filename="${filename}"`, // Force download
  };

  try {
    const url = await s3.getSignedUrlPromise("getObject", params);
    return {
      statusCode: 200,
      headers: {
        "access-control-allow-origin": "*", // Enable CORS for all origins
        "access-control-allow-credentials": true,
        "access-control-allow-methods": "OPTIONS,POST",
        "content-type": "application/json",
      },
      body: JSON.stringify({ url }),
    };
  } catch (err) {
    console.error("Error generating pre-signed URL for CV:", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Error generating pre-signed URL for CV" }),
    };
  }
};
