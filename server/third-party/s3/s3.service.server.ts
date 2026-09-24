import { CopyObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { createAppError } from '../../common/app-error.server'
import { createId } from '../../common/id.server'
import { S3_ERROR_CODES } from './s3.errors'
import { getS3Config } from './s3.config.server'

const MAX_FILE_SIZE = 2 * 1024 * 1024
const IMAGE_CONTENT_TYPES = new Set(['image/jpeg', 'image/png'])

type S3Config = {
  endpoint: string
  bucket: string
  region: string
  accessKeyId?: string
  secretAccessKey?: string
  forcePathStyle: boolean
}

function createClient(config: S3Config) {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials: config.accessKeyId && config.secretAccessKey
      ? { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey }
      : undefined,
  })
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-')
}

export async function uploadFile(input: {
  data: string
  fileName: string
  contentType: string
  folder: string
  maxSize?: number
  config?: S3Config
}) {
  if (!input.data) {
    throw createAppError({
      message: 'Chưa có dữ liệu file để upload',
      errorCode: S3_ERROR_CODES.FILE_REQUIRED,
      statusCode: 400,
    })
  }
  const buffer = Buffer.from(input.data, 'base64')
  if (buffer.length > (input.maxSize ?? MAX_FILE_SIZE)) {
    const maxSize = input.maxSize ?? MAX_FILE_SIZE
    throw createAppError({
      message: `File không được vượt quá ${Math.round(maxSize / 1024 / 1024)} MB`,
      errorCode: S3_ERROR_CODES.FILE_TOO_LARGE,
      statusCode: 400,
    })
  }

  const config = input.config ?? getS3Config()
  if (!config.accessKeyId || !config.secretAccessKey) {
    throw createAppError({
      message: 'Chưa cấu hình thông tin kết nối S3',
      errorCode: S3_ERROR_CODES.UPLOAD_FAILED,
      statusCode: 500,
    })
  }

  const key = `${input.folder.replace(/^\/+|\/+$/g, '')}/${createId()}-${sanitizeFileName(input.fileName)}`

  try {
    const client = createClient(config)
    await new Upload({
      client,
      params: {
        Bucket: config.bucket,
        Key: key,
        Body: buffer,
        ContentType: input.contentType,
        ACL: 'public-read',
      },
    }).done()

    return {
      key,
      url: `${config.endpoint.replace(/\/$/, '')}/${config.bucket}/${key}`,
    }
  } catch {
    throw createAppError({
      message: 'Upload file lên S3 thất bại',
      errorCode: S3_ERROR_CODES.UPLOAD_FAILED,
      statusCode: 502,
    })
  }
}

export async function moveFile(input: { fromKey: string; toKey: string; config: S3Config }) {
  const client = createClient(input.config)
  await client.send(new CopyObjectCommand({
    Bucket: input.config.bucket,
    CopySource: `${input.config.bucket}/${input.fromKey}`,
    Key: input.toKey,
  }))
  await client.send(new DeleteObjectCommand({ Bucket: input.config.bucket, Key: input.fromKey }))
}

export async function deleteFile(input: { key: string; config: S3Config }) {
  const client = createClient(input.config)
  await client.send(new DeleteObjectCommand({ Bucket: input.config.bucket, Key: input.key }))
}

export async function uploadImage(input: {
  data: string
  fileName: string
  contentType: 'image/jpeg' | 'image/png'
  folder: string
}) {
  if (!IMAGE_CONTENT_TYPES.has(input.contentType)) {
    throw createAppError({
      message: 'Định dạng file không được hỗ trợ',
      errorCode: S3_ERROR_CODES.INVALID_TYPE,
      statusCode: 400,
    })
  }
  return uploadFile(input)
}
