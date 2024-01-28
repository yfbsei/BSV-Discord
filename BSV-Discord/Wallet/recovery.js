let bsv = require('bsv');

const recovery = (mnemonic) => {

  const seed = bsv.Bip39.fromString(mnemonic).toSeed();
  const bip32 = bsv.Bip32.Testnet.fromSeed(seed);

  // Extended private & public keys
  const hdPrivKey = bip32.toString(),
    hdPubKey = bip32.toPublic().toString();

  // derive the private key and public Key from an extended private key:
  const privKey = bip32.privKey.toString(),
    pubKey = bip32.pubKey.toString();

  // derive the address:
  const addressTestnet = new bsv.Address.Testnet(),
    address = addressTestnet.fromPubKey(bip32.pubKey).toString();

  return {
    mnemonic,
    hdPrivKey,
    hdPubKey,
    privKey,
    pubKey,
    address
  }

}

// recovery("old gown spray ball myself letter size original feel that amazing symptom");
