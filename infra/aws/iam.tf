data "aws_iam_policy_document" "api" {
  statement {
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
    ]
    resources = [
      aws_s3_bucket.drive.arn,
      "${aws_s3_bucket.drive.arn}/*",
    ]
  }
}

resource "aws_iam_user" "api" {
  name = "${var.name}-api"
}

resource "aws_iam_user_policy" "api" {
  name   = "${var.name}-api"
  user   = aws_iam_user.api.name
  policy = data.aws_iam_policy_document.api.json
}

output "bucket" {
  value = aws_s3_bucket.drive.bucket
}

output "cloudfront_domain" {
  value = aws_cloudfront_distribution.drive.domain_name
}

output "api_user" {
  value = aws_iam_user.api.name
}

output "env" {
  value = <<-EOT
    LOFT_BUCKET=${aws_s3_bucket.drive.bucket}
    AWS_REGION=${var.region}
    LOFT_TOKEN=<same as terraform loft_token>
    LOFT_ORIGIN=http://${aws_lb.api.dns_name}
    docker build -f apps/api/Dockerfile -t ${aws_ecr_repository.api.repository_url}:latest .
    aws ecr get-login-password | docker login --username AWS --password-stdin ${aws_ecr_repository.api.repository_url}
    docker push ${aws_ecr_repository.api.repository_url}:latest
    terraform apply -var api_desired_count=1
  EOT
}
