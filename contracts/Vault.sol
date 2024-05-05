// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IWETH {
  function deposit() external payable;
  function withdraw(uint wad) external;
}

contract Vault is ReentrancyGuard {
  using SafeERC20 for IERC20;

  IWETH public immutable weth;
  mapping(address => uint256) public ethBalances;
  mapping(address => mapping(address => uint256)) public tokenBalances;

  constructor(address _weth) {
    weth = IWETH(_weth);
  }

  receive() external payable {
    depositETH();
  }

  function depositETH() public payable {
    ethBalances[msg.sender] += msg.value;
  }

  function withdrawETH(uint256 amount) public nonReentrant {
    require(ethBalances[msg.sender] >= amount, "Insufficient balance");
    ethBalances[msg.sender] -= amount;
    (bool sent, ) = msg.sender.call{value: amount}("");
    require(sent, "Failed to send ETH");
  }

  function depositToken(address token, uint256 amount) public {
    IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    tokenBalances[token][msg.sender] += amount;
  }

  function withdrawToken(address token, uint256 amount) public nonReentrant {
    require(tokenBalances[token][msg.sender] >= amount, "Insufficient balance");
    tokenBalances[token][msg.sender] -= amount;
    IERC20(token).safeTransfer(msg.sender, amount);
  }

  function wrapETH(uint256 amount) public nonReentrant {
    require(ethBalances[msg.sender] >= amount, "Insufficient ETH balance");
    ethBalances[msg.sender] -= amount;
    weth.deposit{value: amount}();
    tokenBalances[address(weth)][msg.sender] += amount;
  }

  function unwrapWETH(uint256 amount) public nonReentrant {
    require(tokenBalances[address(weth)][msg.sender] >= amount, "Insufficient WETH balance");
    tokenBalances[address(weth)][msg.sender] -= amount;
    weth.withdraw(amount);
    (bool sent, ) = msg.sender.call{value: amount}("");
    require(sent, "Failed to send ETH");
  }
}
