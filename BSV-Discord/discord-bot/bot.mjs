import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { Client, Intents, MessageEmbed } = require("discord.js")
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });

import { MongoClient } from 'mongodb';
const url = '';
const DBclient = new MongoClient(url);

const account = require('../Wallet/account');
import { getUser, buildTx, broadcast } from '../utility/transaction_handler.mjs'
import sendZNT from '../Token/sensible_contracts/sendZNT.mjs';

//------------

client.on("ready", async () => {
  await DBclient.connect();
  console.log(`Logged in as ${client.user.tag}!`)
})

const db = DBclient.db('discord'),
users = db.collection('users');


client.on("guildCreate", async (guild) => {  
  const 
  x = await guild.members.fetch().then(e => e).catch(console.error), // Get all ids from server
  m = x.map(x => x.user).map(x=> [x.id, `${x.username}#${x.discriminator}`] ); // Make array object

  const 
  ids = m.map(i => i[0]), // Search all ids from server 
  userList = await users.find( { _id: { $in: ids}} ).toArray(),
  alreadyExist = userList.map(x => x._id); // All existing ids in db

  const toAdd = m.filter(x => !alreadyExist.includes(x[0]) );  // Filter out existing ids

  if(toAdd.length > 0) {
  const add = toAdd.map(x => { 
    const { mnemonic, hdPrivKey, hdPubKey, privKey, pubKey, address } = account();
    return {
      _id: x[0], 
      user: x[1].replaceAll(" ", "").toLowerCase(),
      keys: {
        mnemonic: mnemonic,
        hdPrivKey: hdPrivKey,
        hdPubKey: hdPubKey,
        privKey: privKey,
        pubKey: pubKey,
        address: address
      },
      balance: [0.00000000, 0.00000000],
      bsvUtxo: [],
      zntUtxo: []
    } 
  })
  
  try {
    await users.insertMany(add);
 } catch (e) {
    console.log(e);
 }
  }
 
});

client.on('guildMemberAdd', async (member) => {
  const userList = await users.findOne( { _id: member.id}, {_id: 1} );

  if(userList === null) {
    const { mnemonic, hdPrivKey, hdPubKey, privKey, pubKey, address } = account();
    
    const insert = {
      _id: member.id, 
      user: `${member.user.username}#${member.user.discriminator}`.replaceAll(" ", "").toLowerCase(),
      keys: {
        mnemonic: mnemonic,
        hdPrivKey: hdPrivKey,
        hdPubKey: hdPubKey,
        privKey: privKey,
        pubKey: pubKey,
        address: address
      },
      balance: [0.00000000, 0.00000000],
      bsvUtxo: [],
      zntUtxo: []
    }
  
    try {
      await users.insertOne(insert);
   } catch (e) {
      console.log(e);
   }
   
    member.send(`https://discord.gg/2RthqCMk87`);
    member.send(`Testnet address linked with your discord account`)
    member.send(`https://test.whatsonchain.com/address/${address}`)
  }
  
});


client.on("messageCreate", async (msg) => {
// console.log(msg.member.id)

if (msg.content === '$help') {
    const exampleEmbed = new MessageEmbed()
        .setColor('#ffd046')
        .setTitle('Server Commands')
        .setDescription('Interact with the blockchain: ')
        .addFields(
            { name: "`$send <bsv|znt> @user(amount) user#0000(amount)`", value: 'Send BSV or ZNT to discord users' },
            { name: "`$balance <bsv|znt>`", value: 'View balance'},
            { name: "`$balance <bsv|znt> @user user#0000`", value: "View a discord users balance" },
            { name: "`$address`", value: "Address linked to this user" },
        )
        msg.channel.send({embeds: [exampleEmbed]})
}

  if(msg.content.includes('$send bsv')) {

    const 
    bTx = await getUser(msg, 'bsv', users), 
    tx = await buildTx(bTx[0].bsvUtxo, bTx[1].privKey, bTx[2]);

    if( tx !== undefined) {
      const id = await broadcast(tx[0], tx[1], tx[2], users),
      url = "https://test.whatsonchain.com/tx/".concat(id);
  
      msg.reply( url );  
    }
    
  }

  if(msg.content.includes('$send znt')) {

    const 
    bTx = await getUser(msg, 'znt', users), 
    { txid, senderBsvUtxo, receiversZntUtxo } = await sendZNT(bTx[0].bsvUtxo, bTx[1].privKey, bTx[1].address, bTx[2]);

    const url = "https://test.whatsonchain.com/tx/".concat(txid);

    msg.reply( url );      

     // Update sender BSV
     const newBsvBalance = senderBsvUtxo.map(x => x.satoshis).reduce((x,y) => x+y)
    await users.updateOne( {'keys.privKey': bTx[1].privKey}, {$set: {bsvUtxo: senderBsvUtxo, 'balance.0': newBsvBalance}} )
    .then( async () => {
      // Update sender & receivers ZNT
      for (const item of receiversZntUtxo) {
        const newZntBalance = item[1].map(x => parseInt(x.tokenAmount)).reduce((x, y) => x + y );
        await users.updateOne( {'keys.address': item[0]}, {$set: {zntUtxo: item[1], 'balance.1': newZntBalance}} )
      }     

    })

  }
  
})

client.login("")
