resource "aws_ecr_repository" "puppeteer_server_ecr" {
  name = "puppeteer-server"
}


data "aws_ecr_image" "puppeteer_server" {
  repository_name = "puppeteer-server"
  image_tag       = "latest"
}