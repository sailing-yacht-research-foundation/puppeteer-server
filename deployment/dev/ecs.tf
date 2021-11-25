resource "aws_ecs_cluster" "puppeteer_server_cluster" {
  name = "Puppeteer-Server-Cluster"
}

resource "aws_cloudwatch_log_group" "puppeteer_server_cw_log_group" {
  name = "PuppeteerServer-log"

  retention_in_days = 7

  lifecycle {
    create_before_destroy = true
    prevent_destroy       = false
  }
}

resource "aws_ecs_service" "puppeteer_server_service" {
  name            = "Puppeteer-Server-Service"
  cluster         = aws_ecs_cluster.puppeteer_server_cluster.id
  task_definition = aws_ecs_task_definition.puppeteer_server_task.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  load_balancer {
    target_group_arn = aws_lb_target_group.puppeteer_server_target_group.arn
    container_name   = aws_ecs_task_definition.puppeteer_server_task.family
    container_port   = var.app_container_port
  }

  network_configuration {
    subnets          = ["subnet-0a7debe784cdde60f"]
    assign_public_ip = true
    security_groups  = [aws_security_group.service_security_group.id]
  }
}

resource "aws_ecs_task_definition" "puppeteer_server_task" {
  family                   = "puppeteer-server-task"
  container_definitions    = <<DEFINITION
  [
    {
      "name": "puppeteer-server-task",
      "image": "${aws_ecr_repository.puppeteer_server_ecr.repository_url}",
      "essential": true,
      "portMappings": [
        {
          "containerPort": ${var.app_container_port},
          "hostPort": 3000
        }
      ],
      "environmentFiles": [
               {
                   "value": "arn:aws:s3:::syrf-dev-env-variables/puppeteer-service.env",
                   "type": "s3"
               }
           ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${aws_cloudwatch_log_group.puppeteer_server_cw_log_group.id}",
          "awslogs-region": "${var.aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "memory": 2048,
      "cpu": 1024
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  memory                   = 2048 # Need to be at least 2x the size of cpu, I encountered error when setting this to 1024
  cpu                      = 1024
  execution_role_arn       = var.iam_ecsTaskExecution_role  #Here's the role arn specified
}

resource "aws_security_group" "service_security_group" {
  vpc_id = var.vpc_id
  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [aws_security_group.puppeteer_server_lb_security_group.id]
  }

  ingress {
    from_port   = 61613
    to_port     = 61613
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5432
    to_port     = 5432
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

# Note: Removing below codes because it keeps failing on my side because of access issue, can reopen this if necessary
# Probably we can re-use ecsTaskExecutionRole so not too much role is created, since right now every terraform project has their own task roles
# resource "aws_iam_role" "ecsTaskExecutionRole" {
#   name               = "ecsTaskExecutionRole-PuppeteerServer"
#   assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
# }
#
# data "aws_iam_policy_document" "assume_role_policy" {
#   statement {
#     actions = ["sts:AssumeRole"]
#
#     principals {
#       type        = "Service"
#       identifiers = ["ecs-tasks.amazonaws.com"]
#     }
#   }
# }
#
# resource "aws_iam_role_policy_attachment" "ecsTaskExecutionRole_policy" {
#   role       = aws_iam_role.ecsTaskExecutionRole.name
#   policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
# }
