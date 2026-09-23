/* eslint-disable */
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

async function test() {
  const s3 = new S3Client({
    region: "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    }
  });
  
  try {
    console.log("Putting object...");
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: "test.txt",
      Body: "hello world",
      ContentType: "text/plain"
    }));
    console.log("Object uploaded!");
    
    // Test what the URL looks like
    const url1 = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/test.txt`;
    console.log("Possible URL 1:", url1);
    
    const url2 = process.env.S3_ENDPOINT.replace("https://", `https://${process.env.S3_BUCKET}.`) + "/test.txt";
    console.log("Possible URL 2:", url2);
    
  } catch(e) {
    console.error(e);
  }
}
test();
