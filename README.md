# Serverless FAVORITE BOOKS app

A simple FAVORITE BOOKS application using AWS Lambda and Serverless framework.

## Functionality of the application

This application will allow creating/removing/updating/fetching BOOK items.
A BOOK item consists in having mandatory a name and an author, and optionally a review-url link, where yuor favorite book is best-described and well reviewed.
Each BOOK item, also, can optionally have an attachment image, like a snapshot of the book cover.
Each user only has access to BOOK items that he/she has created.

## Prerequisites

### Node.js and NPM

Before getting started, make sure Node.js is downloaded and installed. The latest version of Node.js can be downloaded from [nodejs.org](https://nodejs.com/en/download) and it's recommended to use the LTS version.

### Serverless Framework

Serverless Framework is used to build and deploy the application. Instructions for installing Serverless Framework can be found [here](https://serverless.com/framework/docs/getting-started/).

### Auth0

Auth0 is used for authentication and an Auth0 application should be created with asymmetrically encrypted keys (RS256).

## Getting started

### Backend

* The backend is deployed on AWS using serverless framework.

1. cd to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Build and deploy to AWS: `sls deploy -v`

### Frontend

* To run the client application, run the following commands:

1. cd to the client folder: `cd client`
2. Install dependencies: `npm install`
3. Run the client application: `npm run start`
4. Access http://localhost:3000 in your browser
5. Use the Auth0 authentication provider to login in the application

### Postman collection

A Postman collection is available in the root folder of the project `postman_collection.json`, as an alternative way to test the API.