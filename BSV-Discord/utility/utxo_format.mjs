import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { PrivateKey } = require('@runonbitcoin/nimble');

const sensibleToSimpleUtxo = ( privKey, utxo = [] ) => {
    const privkey = PrivateKey.fromString(privKey);

   return utxo.map(u => { 
        return {
            txid: u.txId,
            vout: u.outputIndex,
            satoshis: u.satoshis,
            script: privkey.toAddress().toScript().toString()
        }
    })
} 

const simpleUtxoToSensible = ( privKey, utxo = [] ) => {
    const privkey = PrivateKey.fromString(privKey);

    return utxo.map(u => {
        return {
            txId: u.txid,
            outputIndex: u.vout,
            satoshis: u.satoshis,
            address: privkey.toAddress().toScript().toString()
        }
    })
}

export { sensibleToSimpleUtxo, simpleUtxoToSensible }