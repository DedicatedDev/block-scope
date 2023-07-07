/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type { Sweeper, SweeperInterface } from "../../contracts/Sweeper";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20[]",
        name: "tokens",
        type: "address[]",
      },
      {
        internalType: "address",
        name: "destination",
        type: "address",
      },
    ],
    name: "batchTransfer",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b506109de806100206000396000f3fe60806040526004361061001e5760003560e01c8063acc07b5514610023575b600080fd5b61003d600480360381019061003891906105fe565b61003f565b005b60005b82518110156102e05760008382815181106100605761005f61065a565b5b602002602001015173ffffffffffffffffffffffffffffffffffffffff166370a08231336040518263ffffffff1660e01b81526004016100a09190610698565b60206040518083038186803b1580156100b857600080fd5b505afa1580156100cc573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906100f091906106e9565b905060008483815181106101075761010661065a565b5b602002602001015173ffffffffffffffffffffffffffffffffffffffff1663dd62ed3e33306040518363ffffffff1660e01b8152600401610149929190610716565b60206040518083038186803b15801561016157600080fd5b505afa158015610175573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061019991906106e9565b90506101a6828230610335565b818110156101e9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101e0906107c2565b60405180910390fd5b8483815181106101fc576101fb61065a565b5b602002602001015173ffffffffffffffffffffffffffffffffffffffff166323b872dd3386856040518463ffffffff1660e01b8152600401610240939291906107f1565b602060405180830381600087803b15801561025a57600080fd5b505af192505050801561028b57506040513d601f19601f820116820180604052508101906102889190610860565b60015b6102ca576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102c1906108d9565b60405180910390fd5b50505080806102d890610928565b915050610042565b5060003414610331578073ffffffffffffffffffffffffffffffffffffffff166108fc349081150290604051600060405180830381858888f1935050505015801561032f573d6000803e3d6000fd5b505b5050565b6103cf83838360405160240161034d93929190610971565b6040516020818303038152906040527f5c96b331000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506103d4565b505050565b60006a636f6e736f6c652e6c6f679050600080835160208501845afa505050565b6000604051905090565b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6104578261040e565b810181811067ffffffffffffffff821117156104765761047561041f565b5b80604052505050565b60006104896103f5565b9050610495828261044e565b919050565b600067ffffffffffffffff8211156104b5576104b461041f565b5b602082029050602081019050919050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006104f6826104cb565b9050919050565b6000610508826104eb565b9050919050565b610518816104fd565b811461052357600080fd5b50565b6000813590506105358161050f565b92915050565b600061054e6105498461049a565b61047f565b90508083825260208201905060208402830185811115610571576105706104c6565b5b835b8181101561059a57806105868882610526565b845260208401935050602081019050610573565b5050509392505050565b600082601f8301126105b9576105b8610409565b5b81356105c984826020860161053b565b91505092915050565b6105db816104eb565b81146105e657600080fd5b50565b6000813590506105f8816105d2565b92915050565b60008060408385031215610615576106146103ff565b5b600083013567ffffffffffffffff81111561063357610632610404565b5b61063f858286016105a4565b9250506020610650858286016105e9565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b610692816104eb565b82525050565b60006020820190506106ad6000830184610689565b92915050565b6000819050919050565b6106c6816106b3565b81146106d157600080fd5b50565b6000815190506106e3816106bd565b92915050565b6000602082840312156106ff576106fe6103ff565b5b600061070d848285016106d4565b91505092915050565b600060408201905061072b6000830185610689565b6107386020830184610689565b9392505050565b600082825260208201905092915050565b7f5472616e7366657220616d6f756e74206578636565647320616c6c6f77616e6360008201527f6500000000000000000000000000000000000000000000000000000000000000602082015250565b60006107ac60218361073f565b91506107b782610750565b604082019050919050565b600060208201905081810360008301526107db8161079f565b9050919050565b6107eb816106b3565b82525050565b60006060820190506108066000830186610689565b6108136020830185610689565b61082060408301846107e2565b949350505050565b60008115159050919050565b61083d81610828565b811461084857600080fd5b50565b60008151905061085a81610834565b92915050565b600060208284031215610876576108756103ff565b5b60006108848482850161084b565b91505092915050565b7f5472616e73666572206661696c65640000000000000000000000000000000000600082015250565b60006108c3600f8361073f565b91506108ce8261088d565b602082019050919050565b600060208201905081810360008301526108f2816108b6565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610933826106b3565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff821415610966576109656108f9565b5b600182019050919050565b600060608201905061098660008301866107e2565b61099360208301856107e2565b6109a06040830184610689565b94935050505056fea2646970667358221220f4fdfdb35cbc3512e69c74b57253b6b6c30911c360dabf60c73efbec15dc5d0564736f6c63430008090033";

type SweeperConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: SweeperConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Sweeper__factory extends ContractFactory {
  constructor(...args: SweeperConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Sweeper> {
    return super.deploy(overrides || {}) as Promise<Sweeper>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Sweeper {
    return super.attach(address) as Sweeper;
  }
  override connect(signer: Signer): Sweeper__factory {
    return super.connect(signer) as Sweeper__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SweeperInterface {
    return new utils.Interface(_abi) as SweeperInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Sweeper {
    return new Contract(address, _abi, signerOrProvider) as Sweeper;
  }
}