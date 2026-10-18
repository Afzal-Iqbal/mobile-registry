import { network } from "hardhat";

async function main() {
  const { viem } = await network.create();
  const [walletClient] = await viem.getWalletClients();

  console.log(`Deploying OldMobileRegistry from: ${walletClient.account.address}`);

  const registry = await viem.deployContract("OldMobileRegistry");
  console.log(`✅ OldMobileRegistry deployed to: ${registry.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
