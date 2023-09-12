import {
  appendFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
} from "fs";

import { ethers, upgrades } from "hardhat";
export const ERC20_MINT_AMOUNT = 100000000;

import {
  BlockScopePayment,
  BlockScopeToken,
  BlockScopeVesting,
} from "../../contracts-typechain/typechain/contracts";

export const saveDeployedAddress = async (
  sweeper: string,
  tokens: string[]
) => {
  const settingInfo: {
    sweeperAddress: string;
    erc20Tokens: string[];
  } = {
    sweeperAddress: "",
    erc20Tokens: [],
  };
  settingInfo.sweeperAddress = sweeper;
  settingInfo.erc20Tokens = tokens;

  const settingsPath = "../contracts-typechain/settings";
  if (!existsSync(settingsPath)) {
    mkdirSync(settingsPath, { recursive: true });
  } else {
    const rawData = readFileSync(`${settingsPath}/settings.json`);
    const data = JSON.parse(rawData.toString());
  }
  const json = JSON.stringify(settingInfo);
  writeFileSync(`${settingsPath}/settings.json`, json, "utf-8");
};

export const Utils = {
  prepareTest: async function () {
    //import users
    const [owner, admin, daoTreasury, user] = await ethers.getSigners();
    //deploy contracts

    const scopeTokenFactory = await ethers.getContractFactory(
      "BlockScopeToken"
    );
    const scopeToken = await scopeTokenFactory.deploy(
      "BlockScope Token",
      "Scope",
      admin.address
    );
    await scopeToken.deployed();

    const scopeVestingFactory = await ethers.getContractFactory(
      "BlockScopeVesting"
    );
    const scopeVesting = await scopeVestingFactory.deploy(scopeToken.address);
    await scopeVesting.deployed();

    const scopePaymentFactory = await ethers.getContractFactory(
      "BlockScopePayment"
    );

    const tiers = [
      { name: "free", price: 10 },
      { name: "tier1", price: 20 },
      { name: "tier2", price: 30 },
    ];
    const scopePayment = await upgrades.deployProxy(
      scopePaymentFactory,
      [admin.address, daoTreasury.address, tiers],
      {
        kind: "uups",
      }
    );

    await scopeToken
      .connect(owner)
      .approve(scopePayment.address, ERC20_MINT_AMOUNT);
    await scopeToken
      .connect(owner)
      .approve(scopeVesting.address, ERC20_MINT_AMOUNT);

    return {
      scopeToken: scopeToken as BlockScopeToken,
      scopeVesting: scopeVesting as BlockScopeVesting,
      scopePayment: scopePayment as BlockScopePayment,
      admin,
      daoTreasury,
      user,
    };
  },
};

export function generateRandomString(length: number) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
