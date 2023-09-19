import { Signer, Contract, Provider } from "koilib";
import abi from "../build/bulls-abi.json";
import koinosConfig from "../koinos.config.js";

const [inputNetworkName] = process.argv.slice(2);

async function main() {
  const networkName = inputNetworkName || "harbinger";
  const network = koinosConfig.networks[networkName];
  if (!network) throw new Error(`network ${networkName} not found`);
  const provider = new Provider(network.rpcNodes);
  const contractAccount = Signer.fromWif(network.accounts.contract.privateKey);
  contractAccount.provider = provider;

  const contract = new Contract({
    signer: contractAccount,
    provider,
    abi,
    options: {
      payer: network.accounts.manaSharer.id,
      rcLimit: "10000000000",
    },
  });

  const { receipt, transaction } = await contract.functions.mint({
    token_id: "0x01",
    to: contractAccount.address,
  });
  console.log("Transaction submitted. Receipt: ");
  console.log(receipt);
  const { blockNumber } = await transaction.wait("byBlock", 60000);
  console.log(
    `Transaction mined in block number ${blockNumber} (${networkName})`
  );
}

main()
  .then(() => {})
  .catch((error) => console.error(error));
