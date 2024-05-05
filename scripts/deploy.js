async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const wethAddress = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"; // WETH address on SEPOLIA

  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(wethAddress);

  console.log("Vault deployed to:", vault);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
