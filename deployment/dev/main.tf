terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }


  # backend "s3" {
  #   bucket = "syrf-puppeteer-server-terraform-state"
  #   key    = "global/s3/terraform.tfstate"
  #   region = "us-east-1"

  #   dynamodb_table = "puppeteer-server-terraform-state-locking"
  #   encrypt        = true
  # }


}
