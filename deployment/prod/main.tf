terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }


   backend "s3" {
     bucket = "syrf-puppeteer-prod-server-terraform-state"
     key    = "global/s3/terraform.tfstate"
     region = "us-east-2"
     dynamodb_table = "puppeteer-server-tf-state-locking"
     encrypt        = true
   }


}
