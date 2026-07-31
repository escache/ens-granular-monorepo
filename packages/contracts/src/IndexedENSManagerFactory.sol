// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IndexedENSManager.sol";
import "./IndexedGranularResolver.sol";
import "./interfaces/IIndexedENSDeployer.sol";

/**
 * @title IndexedENSManagerFactory
 * @dev Factory contract for deploying indexed ENS management systems
 * @notice Uses an external deployer to stay under the 24KB bytecode limit
 */
contract IndexedENSManagerFactory is Ownable, Pausable, ReentrancyGuard {
    
    struct Project {
        address manager;
        address resolver;
        address owner;
        string name;
        uint32 createdAt;
        bool isActive;
        uint8 domainCount;
        uint16 totalDelegates;
    }

    address public immutable deployer;

    mapping(string => Project) public projects;
    mapping(address => string) public managerToProject;
    mapping(address => string) public resolverToProject;
    string[] public projectNames;
    
    event ProjectCreated(
        string indexed projectName,
        address indexed owner,
        address indexed manager,
        address resolver
    );
    
    event ProjectOwnershipTransferred(
        string indexed projectName,
        address indexed previousOwner,
        address indexed newOwner
    );
    
    event ProjectDeactivated(string indexed projectName);
    event ProjectReactivated(string indexed projectName);
    
    event ManagerUpgraded(
        string indexed projectName,
        address indexed oldManager,
        address indexed newManager
    );
    
    event ResolverUpgraded(
        string indexed projectName,
        address indexed oldResolver,
        address indexed newResolver
    );

    modifier onlyProjectOwner(string memory projectName) {
        require(
            projects[projectName].owner == msg.sender,
            "Not project owner"
        );
        _;
    }

    modifier onlyValidProject(string memory projectName) {
        require(
            projects[projectName].isActive,
            "Project does not exist or is inactive"
        );
        _;
    }

    constructor(address _deployer) {
        require(_deployer != address(0), "Invalid deployer");
        deployer = _deployer;
    }

    function createProject(
        string calldata projectName,
        address owner
    ) external onlyOwner nonReentrant whenNotPaused returns (address manager, address resolver) {
        require(bytes(projectName).length > 0, "Project name cannot be empty");
        require(owner != address(0), "Owner cannot be zero address");
        require(projects[projectName].owner == address(0), "Project already exists");

        (manager, resolver) = IIndexedENSDeployer(deployer).deployProject(owner);
        
        projects[projectName] = Project({
            manager: manager,
            resolver: resolver,
            owner: owner,
            name: projectName,
            createdAt: uint32(block.timestamp),
            isActive: true,
            domainCount: 0,
            totalDelegates: 0
        });
        
        managerToProject[manager] = projectName;
        resolverToProject[resolver] = projectName;
        projectNames.push(projectName);
        
        emit ProjectCreated(projectName, owner, manager, resolver);
    }

    function transferProjectOwnership(
        string calldata projectName,
        address newOwner
    ) external onlyProjectOwner(projectName) onlyValidProject(projectName) {
        require(newOwner != address(0), "New owner cannot be zero address");

        Project storage project = projects[projectName];
        address previousOwner = project.owner;
        project.owner = newOwner;

        IndexedENSManager(project.manager).transferOwnership(newOwner);
        IndexedGranularResolver(project.resolver).transferOwnership(newOwner);

        emit ProjectOwnershipTransferred(projectName, previousOwner, newOwner);
    }

    function deactivateProject(string calldata projectName) external onlyProjectOwner(projectName) onlyValidProject(projectName) {
        projects[projectName].isActive = false;
        emit ProjectDeactivated(projectName);
    }

    function reactivateProject(string calldata projectName) external onlyProjectOwner(projectName) {
        require(projects[projectName].owner != address(0), "Project does not exist");
        projects[projectName].isActive = true;
        emit ProjectReactivated(projectName);
    }

    function upgradeManager(string calldata projectName) external onlyProjectOwner(projectName) onlyValidProject(projectName) returns (address newManager) {
        Project storage project = projects[projectName];
        address oldManager = project.manager;
        address owner = project.owner;
        
        (newManager, ) = IIndexedENSDeployer(deployer).deployProject(owner);
        project.manager = newManager;
        
        managerToProject[oldManager] = "";
        managerToProject[newManager] = projectName;
        
        emit ManagerUpgraded(projectName, oldManager, newManager);
    }

    function upgradeResolver(string calldata projectName) external onlyProjectOwner(projectName) onlyValidProject(projectName) returns (address newResolver) {
        Project storage project = projects[projectName];
        address oldResolver = project.resolver;
        address owner = project.owner;
        address manager = project.manager;
        
        IndexedGranularResolver newResolverContract = new IndexedGranularResolver(manager);
        newResolverContract.transferOwnership(owner);
        newResolver = address(newResolverContract);
        
        project.resolver = newResolver;
        
        resolverToProject[oldResolver] = "";
        resolverToProject[newResolver] = projectName;
        
        emit ResolverUpgraded(projectName, oldResolver, newResolver);
    }

    function getProject(string calldata projectName) external view returns (Project memory project) {
        return projects[projectName];
    }

    function getAllProjectNames() external view returns (string[] memory names) {
        return projectNames;
    }

    function getProjectCount() external view returns (uint256 count) {
        return projectNames.length;
    }

    function projectExists(string calldata projectName) external view returns (bool exists) {
        return projects[projectName].owner != address(0);
    }

    function getProjectByManager(address managerAddress) external view returns (string memory projectName) {
        return managerToProject[managerAddress];
    }

    function getProjectByResolver(address resolverAddress) external view returns (string memory projectName) {
        return resolverToProject[resolverAddress];
    }

    function updateProjectStats(string calldata projectName, uint8 domainCount, uint16 totalDelegates) external {
        require(projects[projectName].manager == msg.sender, "Only project manager can update stats");
        require(projects[projectName].isActive, "Project not active");
        
        projects[projectName].domainCount = domainCount;
        projects[projectName].totalDelegates = totalDelegates;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
