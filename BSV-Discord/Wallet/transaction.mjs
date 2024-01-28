import { createForge, toUTXO, getUTXO, casts } from 'txforge';
import nimble from '@runonbitcoin/nimble';

const buildTransaction = async (utxo, senderPrivKey, receiverAddressesAmount, allBalance = false) => {
 utxo = []

const privkey = nimble.PrivateKey.fromString(senderPrivKey),
changeaddress = privkey.toAddress().toString(); 

const { P2PKH, OpReturn } = casts

// Build 
const tx = createForge({
  inputs: [],
  outputs: [],
  change: { address: changeaddress },
})

if(utxo.length === 0) {
const wocUTXO = await fetch(`https://api.whatsonchain.com/v1/bsv/test/address/${privkey.toAddress().toString()}/unspent`)
.then(res => res.json()).then(x => x)
.catch(error => {
    console.log(error.cause);
    throw error;
});

wocUTXO.forEach(item => { // Inputs
  const wutxo = { "height": item.height, "tx_pos": item.tx_pos, "tx_hash": item.tx_hash, "value": item.value, "script": privkey.toAddress().toScript().toString() }
  tx.inputs.push( P2PKH.unlock(toUTXO(wutxo), { privkey }) )
 });

} else {  
  utxo.forEach(item => { // Inputs
    const utxo1 = { txid: item.txid, vout: item.vout, satoshis: item.satoshis, script: privkey.toAddress().toScript().toString() }
    tx.inputs.push( P2PKH.unlock(toUTXO(utxo1), { privkey }) )
   });
}

const totalInputAmount = tx.inputs.map(x => x.utxo.satoshis).reduce((x, y) => x+y, 0);

 receiverAddressesAmount.forEach(item => { // Outputs
  tx.outputs.push( P2PKH.lock(allBalance ? totalInputAmount - 1 : item.amount, { address: item.address }) )
 })

 const totalOutputAmount = tx.outputs.map(x => x.satoshis).reduce((x, y) => x+y, 1);

 console.log(totalInputAmount)
 console.log(totalOutputAmount)

  // Validate
  if( totalInputAmount < totalOutputAmount ) {
    throw "Not enough funds";
  }

 let forged = tx.toTx();

  if(forged.fee <= tx.calcRequiredFee()) {
  tx.outputs[tx.outputs.length-1].satoshis = tx.outputs[tx.outputs.length-1].satoshis - tx.calcRequiredFee();
  const tx2 = tx
  forged = tx2.toTx(); //re-sign
  }


let utxoOutput = []
for (let i = 0; i < forged.outputs.length; i++) {
  utxoOutput.push(getUTXO(forged, i))
}

// console.log(forged)

return { tx: forged.toHex(), utxo: utxoOutput.map(x => [x.script.toAddress().toString(), x]) }
}

// const { tx, utxo } = await buildTransaction([], "cUPaQd97VeWKZ4rWk3EpJBNmYhoAZRQZJHZdg4SRQTHmpoLzfCSB", [ {address: 'muHii3GCctF2to7p5MXGyg8i2FvYNh1z98', amount: 0} ]);

const broadcastt = async (txHex) => {

  const b = await fetch("https://api.whatsonchain.com/v1/bsv/test/tx/raw", {
    method: 'POST',
    body: JSON.stringify({ txhex: txHex })
  })
   
    const id = await b.json();
    return id;
}

// broadcastt(tx);

export { buildTransaction, broadcastt };
