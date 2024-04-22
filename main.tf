terraform {
 required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 4.16"
    }
 }

 required_version = ">= 1.2.0"
}

# Fournisseur AWS
provider "aws" {
 region = var.region
}

# Variables
variable "region" {
 description = "The AWS region to deploy into"
 default     = "us-west-2"
}

variable "docker_image_name" {
 description = "Your Docker name image"
 type        = string
}

variable "docker_username" {
 description = "Your Docker Hub username"
 type        = string
}

variable "docker_token" {
 description = "Your Docker Hub token"
 type        = string
 sensitive   = true
}

variable "ami" {
 description = "The AMI ID for the EC2 instance"
 type        = string
 default     = "ami-830c94e3" # Exemple d'AMI, veuillez la remplacer par l'AMI appropriée pour votre région
}

# Ressources
resource "aws_instance" "app_server" {
 ami           = var.ami
 instance_type = "t2.micro"

 user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y docker
              systemctl enable docker
              systemctl start docker
              echo '${var.docker_token}' | docker login -u '${var.docker_username}' --password-stdin
              docker pull ${var.docker_image_name}
              docker run -d -p 80:80 ${var.docker_image_name}
              EOF

 tags = {
    Name = "app_server-instance"
 }
}

# Sorties
output "instance_ip" {
 value = aws_instance.app_server.public_ip
}
