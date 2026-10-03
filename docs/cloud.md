# Cloud

Loft is a free, self-hosted drive. Object bytes live in S3 (or a local disk
for development). The Mac File Provider asks the storage API for **aligned
byte ranges**. Share links are HMAC-signed. Deletes stay in trash for 30 days.

```mermaid
flowchart LR
  finder[Finder]
  fp[File Provider]
  api[Storage API]
  s3[S3]
  alb[ALB]
  finder --> fp --> api --> s3
  web[Web /s /r]
  web --> api
  alb --> api
```

## Storage API

`apps/api` is a Bun server:

| Method | Path | Auth | Role |
| --- | --- | --- | --- |
| GET | `/health` | no | liveness |
| GET | `/v1/me` | bearer | account email and usage |
| GET | `/v1/files` | bearer | list (`?trash=1` for trash) |
| GET | `/v1/files/:id/content` | bearer | body, honors `Range` |
| PUT | `/v1/files/:id/content` | bearer | upload |
| POST | `/v1/files/:id/keep` | bearer | keep on this Mac |
| GET | `/v1/files/:id/share` | bearer | signed `/s/:id?exp&sig` |
| DELETE | `/v1/files/:id` | bearer | trash (30 days) |
| POST | `/v1/files/:id/restore` | bearer | restore |
| GET | `/s/:id` | sig query | share bytes |
| POST | `/v1/trash/purge` | bearer | drop trash older than 30 days |

```bash
bun --filter @loft/api dev
```

PUT content honors `If-Match` (etag) and `Content-Range` for resume. Optional
`LOFT_BPS` caps download speed. Extra bearers go in `LOFT_TOKENS`. Pass
`kms_key_arn` to Terraform for SSE-KMS instead of AES256.

## AWS

`infra/aws` is Terraform: a private bucket, CloudFront for ranged GET, an IAM
task role, ECR, and an optional ECS Fargate service behind an ALB. Desired
count starts at 0 until you push an image:

```bash
cd infra/aws
terraform init
terraform apply
docker build -f apps/api/Dockerfile -t "$(terraform output -raw ecr_repository):latest" ../..
terraform apply -var api_desired_count=1
```

Set `loft_token` in Terraform; it does not mint access keys. Point the Mac app
at `LOFT_API` = the ALB URL.

Helumi’s own stack is Cloudflare. Loft’s equivalent is S3 plus this API. The
Mac still needs a **signed** File Provider appex before Finder shows the
domain next to Macintosh HD; unsigned local builds keep the Loft volume
fallback.
