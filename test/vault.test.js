const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Vault", function () {
  let Vault, vault, WETH, weth, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    // Deploy a mock WETH contract
    WETH = await ethers.getContractFactory("WETH");
    weth = await WETH.deploy();

    // Deploy the Vault contract
    Vault = await ethers.getContractFactory("Vault");
    vault = await Vault.deploy(weth.address);
  });

  describe("ETH functionalities", function () {
    it("should deposit and withdraw ETH correctly", async function () {
      const depositAmount = ethers.parseEther("1.0");
      await owner.sendTransaction({ to: vault.target, value: depositAmount });
      expect(await ethers.provider.getBalance(vault.target)).to.equal(depositAmount);

      await vault.connect(owner).withdrawETH(depositAmount);
      expect(await ethers.provider.getBalance(vault.target)).to.equal(0);
    });

    it("should allow wrapping and unwrapping ETH", async function () {
      const wrapAmount = ethers.parseEther("1.0");
      await owner.sendTransaction({ to: vault.target, value: wrapAmount });
      await vault.connect(owner).wrapETH(wrapAmount);

      expect(await weth.balanceOf(owner.address)).to.equal(wrapAmount);
      await vault.connect(owner).unwrapWETH(wrapAmount);
      expect(await weth.balanceOf(owner.address)).to.equal(0);
    });
  });

  describe("ERC20 functionalities", function () {
    let token, initialSupply;

    beforeEach(async function () {
      const Token = await ethers.getContractFactory("Token");
      token = await Token.deploy();
      initialSupply = await token.totalSupply();
      await token.transfer(addr1.address, initialSupply);
    });

    it("should deposit and withdraw tokens correctly", async function () {
      const depositAmount = ethers.parseUnits("100", 18);
      await token.connect(addr1).approve(vault.target, depositAmount);
      await vault.connect(addr1).depositToken(token.address, depositAmount);

      expect(await token.balanceOf(vault.target)).to.equal(depositAmount);
      await vault.connect(addr1).withdrawToken(token.address, depositAmount);
      expect(await token.balanceOf(vault.target)).to.equal(0);
    });
  });
});
