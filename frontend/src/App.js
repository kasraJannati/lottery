import React, { useEffect, useState } from 'react';
import './App.css';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client'
// ABIs
import TicketABIs from './abis/Ticket.json'

function App() {

  const [account, setAccount] = useState({
    address: null,
  });
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(null);
  const ticketCost = 4700000000000000; //Wei ~ 0.00047 Ether ~ 1 Cad
  // The url option in the create function should point to the IPFS node endpoint, which is typically http://127.0.0.1:5001 if you are running an IPFS daemon locally.
  const ipfs = create({
    url: 'http://127.0.0.1:5001'
  })
  const { Buffer } = require('buffer');

  // Connect to blockchain
  const connectBlockchain = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    // Check network
    // const network = await provider.getNetwork();
    // Connect to smart contracts 
    const contract = new ethers.Contract('0x5FbDB2315678afecb367f032d93F642f64180aa3', TicketABIs, provider )
    setContract(contract)
  }

  // To connect to metamask
  const connectToWallet = async () => {
    const accounts = await window.ethereum.request({method:'eth_requestAccounts'});
    const account = ethers.utils.getAddress(accounts[0]);
    setAccount({address: account});
  }

  // To check balance of wallet
  const checkBalance = async () => {
    const signer = await provider.getSigner()
    const balance = await contract.connect(signer).getBalance('0x5FbDB2315678afecb367f032d93F642f64180aa3');
     // TODO: uncomment if balance unit is Eth not Wei
    //  const balanceInEth = ethers.utils.formatEther(balance)
    console.log(balance.toString())
  }

  const IPFS = async () => {
    // Get CID from DB
    const cid_db = await fetch('http://localhost:3001/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .catch(error => {
        console.error('Error:', error);
      });
    console.log(cid_db[0].cid ,'cid_db ')
    // Get data from IPFS
    // Get the file from IPFS and read its content as a buffer
    const chunks = [];
    for await (const chunk of ipfs.cat(cid_db[0].cid)) {
      chunks.push(chunk);
    }
    // Concatenate the chunks and convert to a string
    const data = Buffer.concat(chunks).toString();
    // Parse the string to a JavaScript array
    const walletAddresses = JSON.parse(data);
    // Add address into array
    if(!walletAddresses.includes(account.address)) {
      console.log('if!')
      walletAddresses.push(account.address)
      // Add array to IPFS
      const buffer = Buffer.from(JSON.stringify(walletAddresses));
      const { cid } = await ipfs.add(buffer)
      // Record CID to DB
      fetch('http://localhost:3001/cid', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cid: cid.toString() })
      })
        .then(response => response.json())
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }

  // To buy ticket
  const buyTicket = async () => {
    const signer = await provider.getSigner()
    // const balance = await contract.connect(signer).getBalance(account.address);
    // const balanceWei = balance.toString();
    const balance = await provider.getBalance(account.address);
    const balanceWei = balance.toString();
    if(balanceWei <=  ticketCost) {
      setError("You don't have Balance!")
    }
    else{
      // TODO: check array 
      try {
        const transactionRequest = {
          to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
          value: ticketCost
        }
        const receipt = await signer.sendTransaction(transactionRequest);
        // Your event handling code here, connect event from solidity to js
        contract.on('Received', async (from, value) => {
          try {
            if(receipt && value === ticketCost && from === account.address ) {
              console.log('Go to IPFS!')
              await IPFS();
            }
            else{
              setError('The transaction failed!')
            }
          } catch (err) {
            setError(err.message + ' The transaction failed!')
          }
        });
      } catch (err) {
        setError(err.message + ' The transaction failed!')
      }
    }
  }

  useEffect(()=> {
    connectBlockchain();
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <section>
          {account.address ? (<div>Your wallet address is: {account.address.slice(0,6)+'...' + account.address.slice(38, 42)}</div>) : (<button onClick={connectToWallet}>Connect to wallet</button>) }
        </section>

        {account.address && <section><button onClick={buyTicket}>Buy ticket</button></section>}

        <section>
          {account.address &&  <button onClick={checkBalance}>Check Balance</button>}
        </section>

        {error && <section>{error}</section>}

      </header>
    </div>
  );
}

export default App;
