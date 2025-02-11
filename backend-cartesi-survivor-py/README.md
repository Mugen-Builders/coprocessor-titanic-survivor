# Simple Counter Backend - Python DApp Template

This is a template for Python Cartesi DApps. It uses node to execute the backend application. This backend is meant to be run by the operator in the Eigenlayer network.

The application entrypoint is the `dapp.py` file.

## Steps to run locally
### Install cartesi-coprocessor cli 
```
cargo install cartesi-coprocessor
```

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

