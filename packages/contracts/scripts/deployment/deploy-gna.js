const { ethers } = require("hardhat");

// Mainnet addresses
const ENS_REGISTRY = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
const NAME_WRAPPER = "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  // Deploy GranularAssignmentController
  console.log("\nDeploying GranularAssignmentController...");
  const GranularAssignmentController = await ethers.getContractFactory("ENSNamingDelegateGranular");
  const granularController = await GranularAssignmentController.deploy();
  await granularController.waitForDeployment();
  const granularControllerAddress = await granularController.getAddress();
  
  console.log("GranularAssignmentController deployed to:", granularControllerAddress);

  // Deploy GranularResolver
  console.log("\nDeploying GranularResolver...");
  const GranularResolver = await ethers.getContractFactory("GranularResolver");
  const granularResolver = await GranularResolver.deploy(granularControllerAddress);
  await granularResolver.waitForDeployment();
  const granularResolverAddress = await granularResolver.getAddress();
  
  console.log("GranularResolver deployed to:", granularResolverAddress);

  // Verify deployment
  console.log("\nVerifying deployment...");
  
  // Check ENS Registry connection
  const ensRegistry = await ethers.getContractAt("IENSRegistry", ENS_REGISTRY);
  const registryOwner = await ensRegistry.owner(ethers.namehash("eth"));
  console.log("ENS Registry owner of .eth:", registryOwner);
  
  // Check NameWrapper connection
  const nameWrapper = await ethers.getContractAt("INameWrapper", NAME_WRAPPER);
  const nameWrapperAddress = await nameWrapper.getAddress();
  console.log("NameWrapper address:", nameWrapperAddress);
  
  // Test granular controller
  const testNode = ethers.namehash("test.eth");
  const hasPermission = await granularController.hasPermission(testNode, deployer.address, 1);
  console.log("Test permission check:", hasPermission);
  
  // Test granular resolver
  const isAuthorized = await granularResolver.isAuthorized(testNode, deployer.address, 1);
  console.log("Test authorization check:", isAuthorized);

  const network = await ethers.provider.getNetwork();
  console.log("\n=== Deployment Summary ===");
  console.log("Network:", network.name, "Chain ID:", network.chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("ENS Registry:", ENS_REGISTRY);
  console.log("NameWrapper:", NAME_WRAPPER);
  console.log("GranularAssignmentController:", granularControllerAddress);
  console.log("GranularResolver:", granularResolverAddress);
  
  console.log("\n=== Next Steps ===");
  console.log("1. Verify contracts on Etherscan");
  console.log("2. Set resolver for your domains:");
  console.log(`   ensRegistry.setResolver(node, "${granularResolverAddress}")`);
  console.log("3. Add delegates with specific permissions:");
  console.log(`   granularController.addDelegate(node, delegateAddress, permissions, expiresAt)`);
  console.log("4. Configure emergency controls and policies");
  
  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    ensRegistry: ENS_REGISTRY,
    nameWrapper: NAME_WRAPPER,
    granularController: granularControllerAddress,
    granularResolver: granularResolverAddress,
    timestamp: new Date().toISOString()
  };
  
  const fs = require('fs');
  const path = require('path');
  const deploymentPath = path.join(__dirname, '..', 'deployments', `${deploymentInfo.network}-${deploymentInfo.chainId}.json`);
  
  // Ensure deployments directory exists
  const deploymentsDir = path.dirname(deploymentPath);
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
