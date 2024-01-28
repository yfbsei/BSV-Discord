let bsv = require('bsv');

const addressTestnet = new bsv.Address.Testnet();

const addAccount = (exPrivKey, path = "m/5'/2/8") => {

  // Import parent bip32
  const parentBip32 = bsv.Bip32.Testnet.fromString(exPrivKey);

  // Child bip32
  const childBip32 = parentBip32.derive(path);

  // derive the private key and public Key from an child extended private key:
  const privKey = childBip32.privKey.toString(),
    pubKey = childBip32.pubKey.toString();

  // derive the address:
  const address = addressTestnet.fromPubKey(childBip32.pubKey).toString();

  return {
    childBip32,
    privKey,
    pubKey,
    address
  }
}

const addPublicAccount = (exPubKey, path = "m/5/2/8") => {

  // Import parent public bip32
  const parentPublicBip32 = bsv.Bip32.Testnet.fromString(exPubKey);

  // Child public bip32
  const childPublicBip32 = parentPublicBip32.derive(path);

  // derive the public Key from an child extended private key:
  const pubKey = childPublicBip32.pubKey.toString();

  // derive the address:
  const address = addressTestnet.fromPubKey(childPublicBip32.pubKey).toString();

  return {
    childPublicBip32,
    pubKey,
    address
  }

}

// addAccount("tprv8ZgxMBicQKsPeXUDQuPrgoHvqMh8F2dWbxZg9kQSvht6K2Qu8oKM3Rj15sgkkj7PJiJv3JeZuv6rA9zaCyWKXfVXPZkbqphoD5AckYRbvuB");

// addPublicAccount("tpubD6NzVbkrYhZ4XzW1JZ4T6Cx3QPD4QMpRBGATSGSkLygV9WffmC8wDvLsG1ZBMPYBRQubhZQYe11CoeVXpUuL1JYvGnaRbFbGepGmmcSRwao");
