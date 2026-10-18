import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("OldMobileRegistry", async function () {
  const { viem } = await network.create();
  const [ownerClient, buyerClient] = await viem.getWalletClients();

  it("Should register a mobile device with unboxed=false", async function () {
    const registry = await viem.deployContract("OldMobileRegistry");
    const testImei = 123456789012345n;

    await registry.write.registerMobile([
      testImei,
      "Apple",
      "iPhone 15 Pro",
      "A17 Pro",
      8n,
      256n,
      2023n,
      false, // activateNow = false (sealed in box)
    ]);

    const mobileData = await registry.read.mobiles([testImei]);
    // mobileData: [imei, specs, currentOwner, registrationDate, firstUsedDate, isActivated, isRegistered]
    assert.equal(mobileData[0], testImei);
    assert.equal(mobileData[2].toLowerCase(), ownerClient.account.address.toLowerCase());
    assert.equal(mobileData[5], false); // isActivated = false
    assert.equal(mobileData[6], true); // isRegistered = true

    const [isActivated, firstUsed] = await registry.read.getActivationStatus([testImei]);
    assert.equal(isActivated, false);
    assert.equal(firstUsed, 0n);
  });

  it("Should activate the mobile device and record the firstUsed timestamp", async function () {
    const registry = await viem.deployContract("OldMobileRegistry");
    const testImei = 987654321098765n;

    await registry.write.registerMobile([
      testImei,
      "Samsung",
      "Galaxy S24 Ultra",
      "Snapdragon 8 Gen 3",
      12n,
      512n,
      2024n,
      false,
    ]);

    // Activate it now
    await registry.write.activateMobile([testImei]);

    const [isActivated, firstUsed] = await registry.read.getActivationStatus([testImei]);
    assert.equal(isActivated, true);
    assert.ok(firstUsed > 0n);
  });

  it("Should transfer ownership correctly to a buyer", async function () {
    const registry = await viem.deployContract("OldMobileRegistry");
    const testImei = 555555555555555n;

    await registry.write.registerMobile([
      testImei,
      "Google",
      "Pixel 9",
      "Tensor G4",
      12n,
      128n,
      2024n,
      true, // already activated
    ]);

    // Transfer ownership to buyerClient
    await registry.write.transferOwnership([testImei, buyerClient.account.address]);

    const mobileData = await registry.read.mobiles([testImei]);
    assert.equal(mobileData[2].toLowerCase(), buyerClient.account.address.toLowerCase());

    const history = await registry.read.getOwnershipHistory([testImei]);
    assert.equal(history.length, 2);
    assert.equal(history[0].toLowerCase(), ownerClient.account.address.toLowerCase());
    assert.equal(history[1].toLowerCase(), buyerClient.account.address.toLowerCase());
  });
});
