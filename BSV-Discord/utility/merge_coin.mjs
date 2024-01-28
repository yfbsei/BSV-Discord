import { createRequire } from 'module';
import { buildTransaction, broadcastt } from "../Wallet/transaction.mjs";
import { API_NET, SensibleApi } from "sensible-sdk";
import { sensibleToSimpleUtxo, simpleUtxoToSensible } from "../utility/utxo_format.mjs";

const require = createRequire(import.meta.url);
const { PrivateKey } = require('@runonbitcoin/nimble');
const sensibleApi = new SensibleApi(API_NET.TEST);


const mergeBSV = async ( senderPrivKey, bsvUtxo = [] ) => { 
    const selfAddress = PrivateKey.fromString(senderPrivKey).toAddress().toString();

    const { tx, utxo } = await buildTransaction(bsvUtxo, senderPrivKey, [ [ selfAddress, 0 ] ], true);
    
    try {
        await broadcastt(tx);        
    } catch (error) {
        throw error;
    }

    return {
        simpleUtxo: utxo,
        sensibleUtxo: simpleUtxoToSensible(senderPrivKey, utxo)
    }
}


const mergeZNT = async ( senderPrivKey, bsvUtxo = [], ft ) => {
    const selfAddress = PrivateKey.fromString(senderPrivKey).toAddress().toString();

    if (bsvUtxo.length === 0) {
        bsvUtxo = await sensibleApi.getUnspents(selfAddress);
    }
    
    if (bsvUtxo.length > 3) {
         let { sensibleUtxo } = await mergeBSV(senderPrivKey, senderAddress, bsvUtxo); 
         bsvUtxo = sensibleUtxo; 
    }
    else {
        bsvUtxo = simpleUtxoToSensible(senderPrivKey, bsvUtxo);
    }

    bsvUtxo.forEach(v => { v.wif = senderPrivKey; }) // Add key

    const zntutxoTEMP = await sensibleApi.getFungibleTokenUnspents("777e4dd291059c9f7a0fd563f7204576dcceb791","b26110e1ce82f42fef3c2c5bb6c761aa8a760620", selfAddress);

    if(bsvUtxo.length > 0 && bsvUtxo.length < 4 && zntutxoTEMP.length > 19) {
        await ft.merge({
            genesis: "b26110e1ce82f42fef3c2c5bb6c761aa8a760620",
            codehash: "777e4dd291059c9f7a0fd563f7204576dcceb791",
            ownerWif: senderPrivKey,
            utxos: bsvUtxo,
            changeAddress: selfAddress
        });
    }
    
    if(zntutxoTEMP.length === 0 || bsvUtxo.length === 0) { throw "Not enough funds - Sensible contract"; }

    const bsvSensibleUtxo = await sensibleApi.getUnspents(selfAddress);
    const zntSensibleUtxo = await sensibleApi.getFungibleTokenUnspents("777e4dd291059c9f7a0fd563f7204576dcceb791","b26110e1ce82f42fef3c2c5bb6c761aa8a760620", selfAddress);

    return {
        bsvSensibleUtxo: bsvSensibleUtxo,
        zntSensibleUtxo: zntSensibleUtxo,
        bsvSimpleUtxo: sensibleToSimpleUtxo(senderPrivKey, bsvSensibleUtxo),
        zntSimpleUtxo: sensibleToSimpleUtxo(senderPrivKey, zntSensibleUtxo)
    }
}



export { mergeBSV, mergeZNT }
