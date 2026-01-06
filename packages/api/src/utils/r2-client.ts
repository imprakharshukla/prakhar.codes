import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as getSignedUrlS3 } from "@aws-sdk/s3-request-presigner";

// Initialize S3Client for Cloudflare R2
const getR2Client = () => {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpoint =
    process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing R2 credentials. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY"
    );
  }

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

export interface R2Object {
  key: string;
  lastModified: Date;
  size: number;
}

/**
 * List all objects in the R2 bucket
 */
export async function listAllObjects(): Promise<R2Object[]> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("Missing R2_BUCKET_NAME environment variable");
  }

  const objects: R2Object[] = [];
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      ContinuationToken: continuationToken,
    });

    const response = await client.send(command);

    if (response.Contents) {
      for (const object of response.Contents) {
        if (object.Key && object.LastModified && object.Size !== undefined) {
          objects.push({
            key: object.Key,
            lastModified: object.LastModified,
            size: object.Size,
          });
        }
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return objects;
}

/**
 * Get object content from R2 bucket as a string (for text files)
 */
export async function getObjectContent(key: string): Promise<string> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("Missing R2_BUCKET_NAME environment variable");
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await client.send(command);

  if (!response.Body) {
    throw new Error(`No content found for object: ${key}`);
  }

  // Convert stream to string
  const chunks: Uint8Array[] = [];
  const reader = response.Body.transformToWebStream().getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  const buffer = Buffer.concat(chunks);
  return buffer.toString("utf-8");
}

/**
 * Get object content from R2 bucket as a Buffer (for binary files like PDFs)
 */
export async function getObjectContentAsBuffer(key: string): Promise<Buffer> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("Missing R2_BUCKET_NAME environment variable");
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await client.send(command);

  if (!response.Body) {
    throw new Error(`No content found for object: ${key}`);
  }

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  const reader = response.Body.transformToWebStream().getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

/**
 * List objects filtered by pathPrefix
 */
export async function listObjectsByPrefix(
  pathPrefix: string
): Promise<R2Object[]> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("Missing R2_BUCKET_NAME environment variable");
  }

  const objects: R2Object[] = [];
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: `${pathPrefix}/`,
      ContinuationToken: continuationToken,
    });

    const response = await client.send(command);

    if (response.Contents) {
      for (const object of response.Contents) {
        if (object.Key && object.LastModified && object.Size !== undefined) {
          objects.push({
            key: object.Key,
            lastModified: object.LastModified,
            size: object.Size,
          });
        }
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return objects;
}

/**
 * Upload a file to R2 bucket
 */
export async function uploadFile(
  pathPrefix: string,
  fileName: string,
  content: Buffer | Uint8Array | string,
  contentType?: string
): Promise<{ key: string; success: boolean }> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("Missing R2_BUCKET_NAME environment variable");
  }

  const key = `${pathPrefix}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: typeof content === "string" ? Buffer.from(content, "utf-8") : content,
    ContentType: contentType || "text/plain",
  });

  await client.send(command);

  return { key, success: true };
}

/**
 * Extract category from storage key path
 */
export function extractCategoryFromKey(
  key: string
): "hr" | "engineering" | "product" | "other" {
  const lowerKey = key.toLowerCase();

  if (lowerKey.startsWith("hr/") || lowerKey.includes("/hr/")) {
    return "hr";
  }
  if (
    lowerKey.startsWith("engineering/") ||
    lowerKey.includes("/engineering/")
  ) {
    return "engineering";
  }
  if (lowerKey.startsWith("product/") || lowerKey.includes("/product/")) {
    return "product";
  }

  return "other";
}

/**
 * Generate a signed URL for an R2 object
 */
export async function getSignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("Missing R2_BUCKET_NAME environment variable");
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return getSignedUrlS3(client, command, { expiresIn });
}
