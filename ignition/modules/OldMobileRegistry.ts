import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("OldMobileRegistryModule", (m) => {
  const registry = m.contract("OldMobileRegistry");

  return { registry };
});
