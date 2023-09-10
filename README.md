# BlockScope

# Architecture

The TokenSweeper application is a distributed application (Dapp) designed to facilitate the sweeping of ERC20 tokens and Ether from multiple source addresses to a single destination address. The architecture of the application is structured around the concept of Sweepers - entities responsible for executing the sweeping operation for different types of assets.

## Algorithm

This section outlines the algorithm and the design choices made to implement the multi-address, multi-token sweeping operation.

### Blockchain

The first step in the sweeping operation involves the use of a smart contract, written in Solidity, that enables batch transfers of multiple tokens to a single destination address. This `batchTransfer` function is designed to process multiple tokens owned by an account in a single transaction.

However, the Ethereum Virtual Machine (EVM) has certain limitations that prevent it from processing massive batches in one go. This issue was mitigated by estimating the gas required for the transaction on the Dapp side and adjusting the batch size accordingly.

### Dapp

The design of the Dapp revolves around two types of Sweepers: `TokenSweeper` and `EtherSweeper`. Each Sweeper is responsible for sweeping a specific type of asset - ERC20 tokens and Ether respectively.

This design choice of having distinct Sweepers for each type of asset is deliberate. It isolates the logic for each asset type, leading to a cleaner and more maintainable codebase. It also provides an extendable code structure that can easily accommodate more asset types in the future.

Each Sweeper type implements a common `Sweeper` interface. This ensures consistency and predictability across different types of Sweepers.

For interaction with the Ethereum network, the application uses the ethers.js library. Command line argument parsing is handled by the yargs library, facilitating user interaction with the application.

## Project Structure

```bash
.
├── package.json                 # Package dependencies and scripts
├── packages/                    # Source code
│   ├── app/                     # Main application
│   │   ├── src/                 # Source code for the app
│   │   │   ├── sweeper/         # Sweeper classes
│   │   │   │   ├── base/        # Base class for sweepers
│   │   │   │   ├── interface/   # Interfaces for sweepers
│   │   │   │   ├── models/      # Models for sweepers
│   │   │   │   └── services/    # Sweeper services
│   │   │   │       ├── ether_sweeper.ts   # Ether sweeper service
│   │   │   │       └── token_sweeper.ts   # Token sweeper service
│   │   │   └── index.ts         # Exports the sweepers
│   │   ├── test/                # Test files
│   │   ├── .env                 # Environment variables for app
│   │   └── README.md            # Documentation for app
│   └── blockchain/              # Hardhat structure
│   ├── contracts-typechain      # Peer-peer dependency to sync contract types with dapp and hardhat.
│   └── package.json         # Package dependencies and scripts for blockchain
└── README.md                    # Project-wide documentation

```

# Environment Setup

Before running the application, make sure to setup the environment variables. Please refer to the `.env.example` files provided in this repository for guidance on setting up your own `.env` file.

## Dapp

- `ERC20_TOKENS`: This represents a list of ERC20 tokens owned by the accounts. Provide a list of ERC20 token addresses.
- `MAINNET_URL`: This is the RPC endpoint URL of your Ethereum blockchain. You will provide a link to the Ethereum node you want to connect to (Infura, Alchemy, etc).
- `DESTINATION`: This is the destination Ethereum address where all the tokens and Ether will be swept to. Provide a valid Ethereum address.
- `PRIVATE_KEYS`: This is a list of private keys corresponding to the Ethereum accounts you want to sweep from.
- `PRIVATE_TEST_KEYS`: These are testing account private keys used for integration tests.

## Blockchain

- `MAINNET_URL`: This is required for forking tests and represents the main Ethereum network RPC URL.
- `TESTNET_URL`: This is required for forking tests and represents the test Ethereum network RPC URL.
- `PRIVATE_KEY`: This is required for deploying contracts. It is the private key of the Ethereum account that will be used to deploy the contracts.

Please note, when running tests locally, you can use one of the Hardhat suggested accounts. However, when deploying to a testnet, it's recommended to use a separate account to avoid potential security issues.

# Testing

This application provides several scripts in the `package.json` file to facilitate testing and deployment.

## Smart Contract

To test and deploy the smart contract, use the following scripts:

- Build the smart contract:  
  `yarn:hh:build`

- Run tests on the smart contract:  
  `yarn:hh:test`

- Deploy the smart contract to a local network:  
  `yarn:hh:deploy:local`

- Deploy the smart contract to the Goerli testnet:  
  `yarn:hh:deploy:goerli`

## Dapp

To test the Dapp, follow these steps:

1. Start the Hardhat local node:  
   `yarn:hh:node`

2. In a separate terminal, run the test script:  
   `yarn:sweep:test`

# Running the Application

The application can be run in three modes:

- Sweep only ERC20 tokens:  
  `yarn sweep:token:erc20`

- Sweep all assets (ERC20 tokens and Ether):  
  `yarn sweep:token:all`

- Sweep only Ether:  
  `yarn sweep:ether`

## Disclaimer

This project is primarily intended as a demonstration or test project and as such, it does not implement complex test cases for the dapp or smart contract. It is primarily intended to illustrate the principle of how to resolve the specific problem at hand - sweeping tokens from multiple accounts to a single destination.

In a production environment, additional architectural considerations may be required, including the potential for upgradable smart contracts, comprehensive test coverage, and codebase refactoring. These elements, however, are beyond the scope of this test project and are not its main focus.

In its current form, the dapp is a simple command line interface application, designed merely to present the principle of operation. In a real-world scenario, it could be evolved into a REST API or a library, depending on the specific business requirements of the use case.
