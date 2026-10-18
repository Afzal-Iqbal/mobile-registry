export interface MobileSpecs {
  brand: string;
  model: string;
  chipset: string;
  ramSizeGB: bigint;
  storageGB: bigint;
  manufacturingYear: bigint;
}

export interface MobileRecord {
  imei: bigint;
  specs: MobileSpecs;
  currentOwner: `0x${string}`;
  ownershipHistory: `0x${string}`[];
  registrationDate: bigint;
  firstUsedDate: bigint;
  isActivated: boolean;
  isRegistered: boolean;
}
