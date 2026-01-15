import { createWalletClient, createPublicClient, http, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalancheFuji } from "viem/chains";
import dotenv from "dotenv";
import Artifact from "../artifacts/contracts/SimpleStorage.sol/SimpleStorage.json" with { type: "json" };

dotenv.config();

const privateKey = process.env.PRIVATE_KEY as `0x${string}`;

async function main() {
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not found in .env");
  }

  const account = privateKeyToAccount(privateKey);

  const walletClient = createWalletClient({
    account,
    chain: avalancheFuji,
    transport: http("https://api.avax-test.network/ext/bc/C/rpc"),
  });

  const publicClient = createPublicClient({
    chain: avalancheFuji,
    transport: http("https://api.avax-test.network/ext/bc/C/rpc"),
  });

  console.log("Deploying with account:", account.address);

  const hash = await walletClient.deployContract({
    abi: Artifact.abi,
    bytecode: Artifact.bytecode as `0x${string}`,
    args: [],
  });

  console.log("Deployment tx hash:", hash);

  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
  });

  console.log("✅ SimpleStorage deployed at:", receipt.contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
