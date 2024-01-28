import { buildTransaction, broadcastt } from '../Wallet/transaction.mjs';


const filterDuplicates = (arr) => {
  const 
  y = arr.map(x => x[0]).filter((item, index, arr) => index !== arr.indexOf(item)), // Remove duplicate username or id
  v = arr.filter(i => y.indexOf(i[0]) !== -1).sort().map(x => x[1]).map((x,i,a) => [x, a[i+1]]).filter((x,i) => i % 2 === 0 ).map(x => x.reduce((pre, current) => pre + current)); // Merge duplicate's amounts
  return y.map((x,i) => [x, v[i]]).concat(arr.filter(x => !y.includes(x[0]))); // Filtered
}

const getUser = async (msg, type = 'bsv', users) => {
    const 
    strToArr = msg.content.slice(10).replaceAll(" ", "").split(")").filter(x => x !== "").map(x => x.replaceAll("<", "").replaceAll("@", "").replaceAll(">","").split("(")).map(x => [ x[0], parseFloat(x[1]) ] ),
    nan = strToArr.filter(x => isNaN(x[1]));

    if(strToArr.length > 0 && nan.length === 0) {

      // Filter duplicates 
      const filteredArray = filterDuplicates(strToArr);

      // Convert username to id
     const 
     user = filteredArray.filter(x => isNaN(Math.floor(x[0]))),
     searcuserid = user.map(x => x[0].toLowerCase()),
     utoi = await users.find( { user: { $in: searcuserid }}, {projection: { _id: 1 }} ).toArray(),
     searchUnFiltered = utoi.map((x, i) => [x._id, user[i][1]]).concat(filteredArray.filter(x => !isNaN(Math.floor(x[0]))));

     // Filter duplicates 
     const searchFiltered = filterDuplicates(searchUnFiltered);

     // Search the ids
     const 
     idsToSearch = searchFiltered.map(x => x[0]).concat([msg.member.id]),
     userList = await users.find( { _id: { $in: idsToSearch }}, {projection: { _id: 1, keys: 1, bsvUtxo: 1, zntUtxo: 1 }} ).toArray();

      //
      const 
      sender = userList.filter(x => x._id === msg.member.id)[0],
      receivers = userList.filter(x => x._id !== msg.member.id).map((x, i) => { 
        return {
        address: x.keys.address, 
        amount: type === 'bsv' ? Math.floor(searchFiltered[i][1]*Math.pow(10,8)) : Math.floor(searchFiltered[i][1])
      }
      });

      return [ {bsvUtxo: sender.bsvUtxo, zntUtxo: sender.zntUtxo}, {privKey: sender.keys.privKey, address: sender.keys.address}, receivers ]

    }
}

const buildTx = async ( utxo1, privKey, receivers ) => {
  
  try {
    const { tx, utxo } = await buildTransaction(utxo1, privKey, receivers);
    return [tx, utxo, privKey];

  } catch (error) {
    console.log(error)
  }

}

const broadcast = async (txHex, utxo, privKey, users) => {

  try {
    const id = await broadcastt(txHex);

    // Update sender
    await users.updateOne( {'keys.privKey': privKey}, {$set: {bsvUtxo: [], 'balance.0': 0}} )
    .then(async () => { // Update receivers     
      for (const item of utxo) {
        await users.updateOne( {'keys.address': item[0]}, {$push: {bsvUtxo: item[1]}, $inc: {'balance.0': item[1].satoshis}} );       
      }
    })

    return id;

  } catch (error) {
    console.log(error)
  }
} 
    

export { getUser, buildTx, broadcast };