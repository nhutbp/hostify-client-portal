import { getEnv } from '../../common/env.server'

export function getS3Config() {
  const endpoint = getEnv('S3_ENDPOINT') ?? 'https://s3.cloud.cmctelecom.vn'
  return {
    endpoint,
    bucket: getEnv('S3_BUCKET') ?? 'oneship',
    region: getEnv('S3_REGION') ?? 'ap-southeast-1',
    accessKeyId: getEnv('S3_ACCESS_KEY_ID'),
    secretAccessKey: getEnv('S3_SECRET_ACCESS_KEY'),
    forcePathStyle: getEnv('S3_FORCE_PATH_STYLE') !== 'false',
  }
}
