import { PublicKey } from "@solana/web3.js";
import { struct, bool, u64, publicKey } from "@coral-xyz/borsh";
import { BN } from "@coral-xyz/anchor";

export class GlobalAccount {
  public discriminator: BN;
  public initialized: boolean = false;
  public authority: PublicKey;
  public feeRecipient: PublicKey;
  public initialVirtualTokenReserves: BN;
  public initialVirtualSolReserves: BN;
  public initialRealTokenReserves: BN;
  public tokenTotalSupply: BN;
  public feeBasisPoints: BN;

  constructor(
    discriminator: BN,
    initialized: boolean,
    authority: PublicKey,
    feeRecipient: PublicKey,
    initialVirtualTokenReserves: BN,
    initialVirtualSolReserves: BN,
    initialRealTokenReserves: BN,
    tokenTotalSupply: BN,
    feeBasisPoints: BN
  ) {
    this.discriminator = discriminator;
    this.initialized = initialized;
    this.authority = authority;
    this.feeRecipient = feeRecipient;
    this.initialVirtualTokenReserves = initialVirtualTokenReserves;
    this.initialVirtualSolReserves = initialVirtualSolReserves;
    this.initialRealTokenReserves = initialRealTokenReserves;
    this.tokenTotalSupply = tokenTotalSupply;
    this.feeBasisPoints = feeBasisPoints;
  }

  getInitialBuyPrice(amount: BN): BN {
    if (amount.lte(new BN(0))) {
      return new BN(0);
    }

    // Calculate n = virtualSolReserves * virtualTokenReserves
    const n = this.initialVirtualSolReserves.mul(this.initialVirtualTokenReserves);

    // Calculate i = virtualSolReserves + amount
    const i = this.initialVirtualSolReserves.add(amount);

    const r = n.div(i).muln(1);

    // Calculate s = virtualTokenReserves - r
    const s = this.initialVirtualTokenReserves.sub(r);

    // Return the minimum between s and realTokenReserves
    return BN.min(s, this.initialRealTokenReserves);
  }

  public static fromBuffer(buffer: Buffer): GlobalAccount {
    const structure = struct([
      u64("discriminator"),
      bool("initialized"),
      publicKey("authority"),
      publicKey("feeRecipient"),
      u64("initialVirtualTokenReserves"),
      u64("initialVirtualSolReserves"),
      u64("initialRealTokenReserves"),
      u64("tokenTotalSupply"),
      u64("feeBasisPoints"),
    ]);

    let value = structure.decode(buffer);
    return new GlobalAccount(
      new BN(value.discriminator.toString()),
      value.initialized,
      value.authority,
      value.feeRecipient,
      new BN(value.initialVirtualTokenReserves.toString()),
      new BN(value.initialVirtualSolReserves.toString()),
      new BN(value.initialRealTokenReserves.toString()),
      new BN(value.tokenTotalSupply.toString()),
      new BN(value.feeBasisPoints.toString())
    );
  }
}