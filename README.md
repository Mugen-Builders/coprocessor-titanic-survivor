# Titanic Survivor Prediction - Cartesi Coprocessor

This repo contains an end-to-end template demonstrating a Titanic survivor prediction model running on Cartesi Co-processor's stack. The backend of the Coprocessor dApp is implemented in Python, utilizing `m2cgen` to generate a machine-learning model for predicting passenger survival based on historical data.

The UI template is implemented with NextJS and Rainbowkit with Viem.

## How does it work?
A user can connect their wallet to the frontend and submit passenger details for survival prediction. The frontend sends a transaction to the `SurvivorCaller` contract, which then interacts with the co-processor to evaluate the passenger's survival probability. The co-processor processes the request using the deployed Python model and returns the result to the on-chain contract, which is then displayed on the UI.

A data flow diagram is provided below to illustrate the flow of data between the frontend, the on-chain contract, and the co-processor.


## Project Structure

- `backend-cartesi-survivor-py/` - Backend implementation in Python, using `m2cgen` for model inference.
- `contracts/` - Smart contract (`SurvivorCaller`) handling requests to the co-processor.
- `ui-coprocessor-template/` - Frontend React application for user interaction and prediction results.

## Setup Instructions for Devnet

### 1. Run Cartesi-Coprocessor Devnet Environment

Before running the dApp, you need to have the Coprocessor devnet environment running. It will spin up a local operator in devnet mode that will host the dApp backend.

Refer to [mugen-docs](https://docs.mugen.builders/cartesi-co-processor-tutorial/introduction) to understand the components and setup the environment

```bash
cartesi-coprocessor start-devnet
```
> To stop and clean up the environment later, use: `cartesi-coprocessor stop-devnet`

### 2. Build and Deploy Backend Cartesi Machine

Navigate to `backend-cartesi-survivor-py/` and run the following command to  deploy the backend.

```bash
cartesi-coprocessor publish --network devnet
```

Get the task issuer and machine hash
```bash
cartesi-coprocessor address-book
```

### 3. Deploy SurvivorCaller Smart Contract

To deploy the contract, cd into the `contracts/src` folder and run the following command:
```bash
cartesi-coprocessor deploy --contract-name SurvivorCaller --network devnet --constructor-args <task_issuer> <machine_hash>
```

### 4. Run Frontend Application

Update the variable `CONTRACT_ADDRESS` on app/page.js

Navigate to the frontend `survivor-ui` folder

```bash
npm install
nom run dev
```

The frontend will be available at http://localhost:3000
