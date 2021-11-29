resource "aws_alb" "puppeteer_server_load_balancer" {
  name               = "Puppeteer-Service-Node-LB"
  load_balancer_type = "application"
  subnets            = ["subnet-0b991066a3689c0a9", "subnet-0e8bf2fe60aa75a1d", "subnet-03edca35c8e6d824b"]
  security_groups    = [aws_security_group.puppeteer_server_lb_security_group.id]
}

resource "aws_security_group" "puppeteer_server_lb_security_group" {
  vpc_id = var.vpc_id
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

resource "aws_lb_target_group" "puppeteer_server_target_group" {
  name        = "puppeteer-server-target-group"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id
  health_check {
    matcher  = "200,301,302"
    path     = "/"
    timeout  = 30
    interval = 60
  }
}

resource "aws_lb_listener" "puppeteer_server_listener" {
  load_balancer_arn = aws_alb.puppeteer_server_load_balancer.arn
  port              = "80"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.puppeteer_server_target_group.arn
  }
}