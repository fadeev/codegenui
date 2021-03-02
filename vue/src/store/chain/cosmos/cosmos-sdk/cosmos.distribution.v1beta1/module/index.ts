import { coins, StdFee } from "@cosmjs/launchpad";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Registry, OfflineSigner, EncodeObject, DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { Api } from "./rest";
import { MsgWithdrawDelegatorReward } from "./types/cosmos/distribution/v1beta1/tx";
import { MsgFundCommunityPool } from "./types/cosmos/distribution/v1beta1/tx";
import { MsgWithdrawValidatorCommission } from "./types/cosmos/distribution/v1beta1/tx";
import { MsgSetWithdrawAddress } from "./types/cosmos/distribution/v1beta1/tx";


const types = [
  ["/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward", MsgWithdrawDelegatorReward],
  ["/cosmos.distribution.v1beta1.MsgFundCommunityPool", MsgFundCommunityPool],
  ["/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission", MsgWithdrawValidatorCommission],
  ["/cosmos.distribution.v1beta1.MsgSetWithdrawAddress", MsgSetWithdrawAddress],
  
];

const registry = new Registry(<any>types);

const defaultFee = {
  amount: [],
  gas: "200000",
};

interface TxClientOptions {
  addr: string
}

interface SignAndBroadcastOptions {
  fee: StdFee
}

const txClient = async (wallet: OfflineSigner, { addr: addr }: TxClientOptions = { addr: "http://localhost:26657" }) => {
  if (!wallet) throw new Error("wallet is required");

  const client = await SigningStargateClient.connectWithSigner(addr, wallet, { registry });
  const { address } = (await wallet.getAccounts())[0];

  return {
    signAndBroadcast: (msgs: EncodeObject[], { fee: fee }: SignAndBroadcastOptions = { fee: defaultFee }) => client.signAndBroadcast(address, msgs, fee),
    msgWithdrawDelegatorReward: (data: MsgWithdrawDelegatorReward): EncodeObject => ({ typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward", value: data }),
    msgFundCommunityPool: (data: MsgFundCommunityPool): EncodeObject => ({ typeUrl: "/cosmos.distribution.v1beta1.MsgFundCommunityPool", value: data }),
    msgWithdrawValidatorCommission: (data: MsgWithdrawValidatorCommission): EncodeObject => ({ typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission", value: data }),
    msgSetWithdrawAddress: (data: MsgSetWithdrawAddress): EncodeObject => ({ typeUrl: "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress", value: data }),
    
  };
};

interface QueryClientOptions {
  addr: string
}

const queryClient = async ({ addr: addr }: QueryClientOptions = { addr: "http://localhost:1317" }) => {
  return new Api({ baseUrl: addr });
};

export {
  txClient,
  queryClient,
};