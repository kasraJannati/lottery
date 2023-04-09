// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
// const hre = require("hardhat");

// const create = require("ipfs-http-client")
import hre from "hardhat";
import { create } from 'ipfs-http-client'


async function main() {
  // Setup account
  const [deployer] = await ethers.getSigners();

  // Deploy Ticket
  const Ticket = await hre.ethers.getContractFactory("Ticket");
  const ticket = await Ticket.deploy();
  await ticket.deployed();
  console.log('Deploy Ticket contract at: ', ticket.address); //0xa513E6E4b8f2a923D98304ec87F64353C4D5C853


  const walletAddress = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9' // #19
  const checkBalance = async (address) => {
    try {
      return await ticket.getBalance(walletAddress);
    } catch {
      return 'Something is wrong!'
    }
  }
  console.log('balance:', await checkBalance(walletAddress));


  const checkArray = async () => {
    try {
      return await ticket.addAddressToArray('0xa513E6E4b8f2a923D98304ec87F64353C4D5C853');
    } catch {
      return 'Something is wrong!'
    }
  }
  // await checkArray();
  // console.log(await ticket.getLengthAddressesList(),'kasra');
  // console.log(await ticket.getIteminArray(0),'reza')
  // console.log(await ticket.getArray())

  // const ipfs = await create()
  const ipfs = await create({
    url: 'http://127.0.0.1:5001'
  })
  
  // call Core API methods
  // const { cid } = await ipfs.add(Buffer.from('Hello world!'))
  // console.log(cid) //CID(QmQzCQn4puG4qu8PVysxZmscmQ5vT1ZXpqo7f58Uh9QfyY)


  // Get data from IPFS
  const data = await ipfs.cat('QmQzCQn4puG4qu8PVysxZmscmQ5vT1ZXpqo7f58Uh9QfyY')

  const chunks = []
  for await (const item of data) {
    chunks.push(item)
  } 
  const content = Buffer.concat(chunks)
  console.log(content.toString())


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
