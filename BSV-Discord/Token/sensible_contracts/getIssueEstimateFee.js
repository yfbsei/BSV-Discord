const { SensibleFT } = require("sensible-sdk");

// Private Key: cUPaQd97VeWKZ4rWk3EpJBNmYhoAZRQZJHZdg4SRQTHmpoLzfCSB 
// Public Key: 025cfc825924d5250abd8aa9ebe4975bd1de36a8dc7c0d6a248727b1a6da48023a
// Address: muHii3GCctF2to7p5MXGyg8i2FvYNh1z98

// txid: f332721c046588a59783f61e9e6dd6fd054a07f57937284e810e3660345f47e9 
// genesis: b26110e1ce82f42fef3c2c5bb6c761aa8a760620 
// codehash: 777e4dd291059c9f7a0fd563f7204576dcceb791 
// sensibleId: e9475f3460360e814e283779f5074a05fdd66d9e1ef68397a58865041c7232f300000000

(async () => {
    const { signers, signerSelecteds } = await SensibleFT.selectSigners();

    const ft = new SensibleFT({
      network: "testnet", //mainnet or testnet
      purse: "cUPaQd97VeWKZ4rWk3EpJBNmYhoAZRQZJHZdg4SRQTHmpoLzfCSB", //the wif of a bsv address to offer transaction fees
      feeb: 0.5,
      signers,
      signerSelecteds,
    });

    let estimateFee = await ft.getIssueEstimateFee({
        sensibleId: 'e9475f3460360e814e283779f5074a05fdd66d9e1ef68397a58865041c7232f300000000',
        genesisPublicKey: '025cfc825924d5250abd8aa9ebe4975bd1de36a8dc7c0d6a248727b1a6da48023a',
        allowIncreaseIssues: true,
      });
      
      console.log(estimateFee);

})();