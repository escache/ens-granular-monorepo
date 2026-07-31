// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IndexedENSManager.sol";
import "./IndexedGranularResolver.sol";

/**
 * @title IndexedENSDeployer
 * @dev External deployer to keep IndexedENSManagerFactory bytecode under the 24KB limit
 */
contract IndexedENSDeployer {
    function deployProject(address owner) external returns (address manager, address resolver) {
        require(owner != address(0), "Owner cannot be zero");

        IndexedENSManager newManager = new IndexedENSManager();
        newManager.transferOwnership(owner);
        manager = address(newManager);

        IndexedGranularResolver newResolver = new IndexedGranularResolver(manager);
        newResolver.transferOwnership(owner);
        resolver = address(newResolver);
    }
}
