let bsv = require('bsv');

const account = () => {
  // const mnemonic = bsv.Bip39.fromRandom().toString();
  // const seed = bsv.Bip39.fromString(mnemonic).toSeed(); // Can be used to recover 

  const seed = Buffer.from('094f968375825eeb9d155170368f6bb711776511cb64eb2018b4136e15dc3faaf1c017f89af242a7dc17fbad854a3c64e4e7328747594191c1849cb8ba95d7da', 'hex')
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
    // mnemonic,
    hdPrivKey,
    hdPubKey,
    privKey,
    pubKey,
    address
  }
}

account()

module.exports = account;
