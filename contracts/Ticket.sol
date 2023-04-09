// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Ticket {

    // To receive Ether
    event Received(address, uint);
    receive() external payable {
       emit Received(msg.sender, msg.value);
    }

    // To check balance of wallet
    function getBalance(address wallet) public view returns(uint256) {
        return wallet.balance;
    }

 

    // Transfer ERC20 tokens
    function transferToken(address tokenAddress, address recipient, uint256 amount) public {
        IERC20(tokenAddress).transfer(recipient, amount);
    }

}















// function clear() public {
//     // these clear the arrays completely
//     delete pairsOfFlags;
//     delete aLotOfIntegers;
//     // identical effect here
//     pairsOfFlags = new bool[2][](0);
// }