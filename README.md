# Serverless Portfolio Backend

This repo has been setup to handle the backend actions I need to keep my portfolio operational. You can find the repo for the frontend [here](https://github.com/angusbezzina/portfolio-vite).

**NOTE:**
I use a [Zapier](https://zapier.com/) integration as a way to notify me once a submission has been added to my AirTable.

### Project Setup

Install node modules with `npm i`.

Install the Serverless CLI with `npm i serverless -g`.

Login to Serverless with `serverless login`.

**NOTE** If testing the `createAirTableRecord` function, you will need to create your own AirTable table and enter the details in an `.env` file as shown in the example included in this repo.

### Local Development

Run the command `npm run dev`.

**NOTE** This uses `serverless offline` under the hood to emulates AWS λ and API Gateway actions locally.

### Deploying

Run the command `npm run deploy`.

**NOTE** This uses `serverless deploy` under the hood to deploy the provisioned services.
