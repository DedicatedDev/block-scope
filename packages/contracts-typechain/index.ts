export * from "./typechain";
import SweeperABIJson from "./abi/contracts/Sweeper.sol/Sweeper.json";
import ERC20ABIJson from "./abi/contracts/MockErc20Token.sol/MockErc20Token.json";

export const SweeperABI = SweeperABIJson;
export const ERC20ABI = ERC20ABIJson;

import * as contractSettings from "./settings/settings.json";
export const Settings = contractSettings;
