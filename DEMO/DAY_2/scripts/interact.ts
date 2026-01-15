import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalancheFuji } from "viem/chains";
import dotenv from "dotenv";
import Artifact from "../artifacts/contracts/SimpleStorage.sol/SimpleStorage.json" with { type: "json" };

dotenv.config();

const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
const contractAddress = "0xe2eee60bcf496711646a3d43daa80e5892371ec4"; // Deployed address

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

  console.log("🔍 Validating contract at:", contractAddress);

  // 1. Read initial value & message
  console.log("Reading state...");
  const initialValue = await publicClient.readContract({
    address: contractAddress,
    abi: Artifact.abi,
    functionName: "getValue",
  }) as bigint;
  const initialMessage = await publicClient.readContract({
    address: contractAddress,
    abi: Artifact.abi,
    functionName: "message",
  }) as string;
  
  console.log("Current Value:", initialValue.toString());
  console.log("Current Message:", initialMessage);

  // 2. Set new value (should succeed if owner)
  const newValue = initialValue + 1n;
  console.log(`Setting new value to ${newValue}...`);
  const hash1 = await walletClient.writeContract({
    address: contractAddress,
    abi: Artifact.abi,
    functionName: "setValue",
    args: [newValue],
  });
  console.log("Value Tx Hash:", hash1);
  await publicClient.waitForTransactionReceipt({ hash: hash1 });

  // 3. Set new message
  const newMessage = "Hello Avalanche Day 2!";
  console.log(`Setting message to '${newMessage}'...`);
  const hash2 = await walletClient.writeContract({
    address: contractAddress,
    abi: Artifact.abi,
    functionName: "setMessage",
    args: [newMessage],
  });
  console.log("Message Tx Hash:", hash2);
  await publicClient.waitForTransactionReceipt({ hash: hash2 });

  // 4. Verify updates
  console.log("Verifying updates...");
  const updatedValue = await publicClient.readContract({
    address: contractAddress,
    abi: Artifact.abi,
    functionName: "getValue",
  }) as bigint;
  const updatedMessage = await publicClient.readContract({
    address: contractAddress,
    abi: Artifact.abi,
    functionName: "message",
  }) as string;

  console.log("Updated Value:", updatedValue.toString());
  console.log("Updated Message:", updatedMessage);

  if (updatedValue === newValue && updatedMessage === newMessage) {
    console.log("✅ Validation SUCCEEDED! Ownership & State features working.");
  } else {
    console.error("❌ Validation FAILED! State did not update correctly.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
