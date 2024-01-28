import { SensibleFT, API_NET, SensibleApi } from "sensible-sdk"; 
import { mergeZNT } from "../../utility/merge_coin.mjs";
import { sensibleToSimpleUtxo } from "../../utility/utxo_format.mjs";

const sensibleApi = new SensibleApi(API_NET.TEST);

const sendZNT = async ( bsvUtxo = [], senderPrivKey, senderAddress, receivers ) => { // TODO validate amount !input < output
    const { signers, signerSelecteds } = await SensibleFT.selectSigners();

    const ft = new SensibleFT({
      network: "testnet", //mainnet or testnet
      feeb: 0.05,
      signers,
      signerSelecteds,
    });

    
    const { bsvSensibleUtxo, zntSensibleUtxo } = await mergeZNT(senderPrivKey, bsvUtxo, ft);

    bsvSensibleUtxo.forEach(v => { v.wif = senderPrivKey; }) // add key
    zntSensibleUtxo.forEach(v => { v.wif = senderPrivKey; }) // add key

    let { txid } = await ft.transfer({
        codehash: '777e4dd291059c9f7a0fd563f7204576dcceb791',
        genesis: 'b26110e1ce82f42fef3c2c5bb6c761aa8a760620',
        receivers: receivers,
        senderWif: senderPrivKey,
        ftUtxos: zntSensibleUtxo, // Not more than 20
        ftChangeAddress: senderAddress,
        utxos: bsvSensibleUtxo, // Not more than 3
        changeAddress: senderAddress
      });

    // Utxo for receivers 
    const senderBsvUtxo = await sensibleApi.getUnspents(senderAddress);
    const zntUtxo = [
      [senderAddress, await sensibleApi.getFungibleTokenUnspents("777e4dd291059c9f7a0fd563f7204576dcceb791","b26110e1ce82f42fef3c2c5bb6c761aa8a760620", senderAddress)]
    ];

    for (const x of receivers) {
      const y = await sensibleApi.getFungibleTokenUnspents("777e4dd291059c9f7a0fd563f7204576dcceb791","b26110e1ce82f42fef3c2c5bb6c761aa8a760620", x.address);
      zntUtxo.push( [x.address, y] );
    }

    return {
      txid: txid,
      senderBsvUtxo: sensibleToSimpleUtxo(senderPrivKey, senderBsvUtxo),
      receiversZntUtxo: zntUtxo
    }

};

// const x = await sendZNT([], 'cUPaQd97VeWKZ4rWk3EpJBNmYhoAZRQZJHZdg4SRQTHmpoLzfCSB', 'muHii3GCctF2to7p5MXGyg8i2FvYNh1z98', [ {address: "msnk9m84xzPdnxPgNtuGuEsfAVNzWBGoEa", amount: "1000"} ] )
// console.log( x );

export default sendZNT;
