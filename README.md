# HubSpot Integration with NestJS

This assignment integrates HubSpot CRM with a NestJS backend to manage contacts and deals. It includes email notifications using Nodemailer and Mailtrap.

# Setup Instructions

## Prerequisites

Node.js (v22.14.0)

npm 

A HubSpot API Key

Mailtrap or another SMTP email provider

## Installation

Clone the repository:

git clone https://github.com/your-repo.git

cd your-repo

Install dependencies:

npm install

Configure environment variables:

Create a .env file in the root directory and set the following:

HUBSPOT_API_KEY=your_hubspot_api_key

SMTP_HOST=smtp.mailtrap.io

SMTP_PORT=2525

SMTP_EMAIL=your_smtp_email

SMTP_PASSWORD=your_smtp_password

Start the application:

npm run start

## Assumptions made

HubSpot API key & SMTP credentials are stored securely in environment variables.

You can only just get the contacts added in January 2025.

Mailtrap is used for email testing.

## Example Output

Total contacts processed: 4

Deals Updated: 4

New Deals Created: 0

## For testing after running the project make a GET request to:

http://localhost:3000/hubspot/process/contacts
