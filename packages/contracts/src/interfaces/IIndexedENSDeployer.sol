// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IIndexedENSDeployer {
    function deployProject(address owner) external returns (address manager, address resolver);
}
