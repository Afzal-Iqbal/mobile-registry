import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

const CONTRACT_ADDRESS = "0x1010d972950ff38849277b9c072151dfef37aabe";

const ABI = [
  {
    inputs: [{ internalType: "address", name: "_owner", type: "address" }],
    name: "getMobilesByOwner",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

async function main() {
  console.log("🔍 Checking deployed contract on Ethereum Sepolia...");
  console.log(`Contract Address: ${CONTRACT_ADDRESS}`);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
  });

  const blockNumber = await publicClient.getBlockNumber();
  console.log(`Current Sepolia Block Number: ${blockNumber}`);

  const bytecode = await publicClient.getBytecode({ address: CONTRACT_ADDRESS });
  if (bytecode && bytecode.length > 2) {
    console.log(`✅ Contract bytecode confirmed on Sepolia! (${bytecode.length / 2 - 1} bytes)`);
  } else {
    console.log("❌ No bytecode found at this address.");
  }

  // Read mobiles owned by the deployer
  const testAddress = "0x1010d972950ff38849277b9c072151dfef37aabe";
  const mobiles = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getMobilesByOwner",
    args: [testAddress],
  });

  console.log(`✅ Successfully queried smart contract view function! Result:`, mobiles);
  console.log("\n🚀 Sepolia contract is LIVE, responsive, and ready for end-to-end testing!");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
