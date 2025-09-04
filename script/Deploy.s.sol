// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/DerivativeNFT.sol";
import "../contracts/NFTMarketplace.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy DerivativeNFT contract
        DerivativeNFT derivativeNFT = new DerivativeNFT(
            "Vials Derivative NFT",
            "VDERIV"
        );

        // Deploy NFTMarketplace contract
        NFTMarketplace marketplace = new NFTMarketplace();

        vm.stopBroadcast();

        // Log deployed addresses
        console.log("=== Deployment Successful ===");
        console.log("DerivativeNFT deployed to:", address(derivativeNFT));
        console.log("NFTMarketplace deployed to:", address(marketplace));
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        
        // Save addresses to a file for frontend configuration
        string memory addresses = string(
            abi.encodePacked(
                "export const DERIVATIVE_NFT_ADDRESS = '", 
                vm.toString(address(derivativeNFT)), 
                "';\n",
                "export const MARKETPLACE_ADDRESS = '", 
                vm.toString(address(marketplace)), 
                "';\n",
                "export const NETWORK = 'arbitrum-sepolia';\n"
            )
        );
        
        vm.writeFile("frontend/lib/contracts.ts", addresses);
        console.log("Contract addresses saved to frontend/lib/contracts.ts");
    }
}
