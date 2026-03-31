const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying Factory with the account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  // Deploy Factory
  console.log("\nDeploying ENSNamingDelegateFactory...");
  const Factory = await ethers.getContractFactory("ENSNamingDelegateFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  
  console.log("Factory deployed to:", factoryAddress);

  // Create a test project
  console.log("\nCreating test project...");
  const tx = await factory.createProject("test-project", deployer.address);
  await tx.wait();
  
  const project = await factory.getProject("test-project");
  console.log("\n=== Test Project Created ===");
  console.log("Basic Delegate:", project.basicDelegate);
  console.log("Granular Delegate:", project.granularDelegate);
  console.log("Owner:", project.owner);

  const network = await ethers.provider.getNetwork();
  console.log("\n=== Factory Deployment Summary ===");
  console.log("Network:", network.name, "Chain ID:", network.chainId.toString());
  console.log("Factory:", factoryAddress);
  console.log("Test Project Basic Delegate:", project.basicDelegate);
  console.log("Test Project Granular Delegate:", project.granularDelegate);

  // Save deployment info
  const fs = require('fs');
  const path = require('path');
  
  const deploymentPath = path.join(__dirname, '..', 'deployments', `factory-${network.chainId}.json`);
  const deploymentsDir = path.dirname(deploymentPath);
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    factory: factoryAddress,
    testProject: {
      name: "test-project",
      basicDelegate: project.basicDelegate,
      granularDelegate: project.granularDelegate,
      owner: project.owner
    },
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

