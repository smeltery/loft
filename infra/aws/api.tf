data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_ecr_repository" "api" {
  name = "${var.name}-api"
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/loft/${var.name}"
  retention_in_days = 14
}

resource "aws_iam_role" "exec" {
  name = "${var.name}-api-exec"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "exec" {
  role       = aws_iam_role.exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "task" {
  name               = "${var.name}-api-task"
  assume_role_policy = aws_iam_role.exec.assume_role_policy
}

resource "aws_iam_role_policy" "task" {
  name   = "${var.name}-api-s3"
  role   = aws_iam_role.task.id
  policy = data.aws_iam_policy_document.api.json
}

resource "aws_security_group" "alb" {
  name   = "${var.name}-api-alb"
  vpc_id = data.aws_vpc.default.id
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "api" {
  name   = "${var.name}-api"
  vpc_id = data.aws_vpc.default.id
  ingress {
    from_port       = 8787
    to_port         = 8787
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "api" {
  name               = "${var.name}-api"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = data.aws_subnets.default.ids
}

resource "aws_lb_target_group" "api" {
  name        = "${var.name}-api"
  port        = 8787
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "ip"
  health_check { path = "/health" }
}

resource "aws_lb_listener" "api" {
  load_balancer_arn = aws_lb.api.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

resource "aws_ecs_cluster" "api" {
  name = "${var.name}-api"
}

resource "aws_ecs_task_definition" "api" {
  family                   = "${var.name}-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.exec.arn
  task_role_arn            = aws_iam_role.task.arn
  container_definitions = jsonencode([{
    name         = "api"
    image        = "${aws_ecr_repository.api.repository_url}:${var.api_image_tag}"
    essential    = true
    portMappings = [{ containerPort = 8787, protocol = "tcp" }]
    environment = [
      { name = "PORT", value = "8787" },
      { name = "LOFT_BUCKET", value = aws_s3_bucket.drive.bucket },
      { name = "AWS_REGION", value = var.region },
      { name = "LOFT_TOKEN", value = var.loft_token },
      { name = "LOFT_ORIGIN", value = "http://${aws_lb.api.dns_name}" },
      { name = "LOFT_WEB", value = var.loft_web },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.api.name
        awslogs-region        = var.region
        awslogs-stream-prefix = "api"
      }
    }
  }])
}

resource "aws_ecs_service" "api" {
  name            = "${var.name}-api"
  cluster         = aws_ecs_cluster.api.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.api_desired_count
  launch_type     = "FARGATE"
  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.api.id]
    assign_public_ip = true
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 8787
  }
  depends_on = [aws_lb_listener.api]
}

variable "api_image_tag" {
  type    = string
  default = "latest"
}

variable "api_desired_count" {
  type    = number
  default = 0
}

variable "loft_token" {
  type      = string
  sensitive = true
  default   = "dev"
}

variable "loft_web" {
  type    = string
  default = "http://127.0.0.1:3000"
}

output "api_url" {
  value = "http://${aws_lb.api.dns_name}"
}

output "ecr_repository" {
  value = aws_ecr_repository.api.repository_url
}
