import { HardhatUserConfig } from "hardhat/config";
import { configDotenv } from "dotenv"
import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';
import "@nomicfoundation/hardhat-verify";
import "hardhat-gas-reporter";
import "@solidstate/hardhat-accounts"
import "./task"

configDotenv()

const {
  TEST_RPC_NODE,
  PROD_RPC_NODE,
  TEST_PRIVATE_KEY,
  PROD_PRIVATE_KEY,
  REPORT_GAS,
  MNEMONIC,
  ETH_SCAN_API_KEY,
} = process.env

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    ethMainnet: {
      url: PROD_RPC_NODE,
      accounts: [PROD_PRIVATE_KEY ?? ''],
      gasMultiplier: 1.1,
      chainId: 1
    },
    sepolia: {
      url: TEST_RPC_NODE,
      accounts: [TEST_PRIVATE_KEY ?? ''],
      gasMultiplier: 1.1,
      chainId: 11155111
    },
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: false,
        runs: 200
      }
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
      mainnet: ETH_SCAN_API_KEY!,
      sepolia: ETH_SCAN_API_KEY!,
    }
  },
  gasReporter: {
    currency: 'USD',
    token: 'ETH',
    gasPrice: 21,
    enabled: REPORT_GAS === 'true' ? true : false
  }
};

export default config;
