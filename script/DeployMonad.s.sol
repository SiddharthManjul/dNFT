// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/DerivativeNFT.sol";
import "../contracts/NFTMarketplace.sol";

contract DeployMonadScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy DerivativeNFT contract
        DerivativeNFT derivativeNFT = new DerivativeNFT(
            "Vials Derivative NFT - Monad",
            "VDERIV-MON"
        );

        // Deploy NFTMarketplace contract
        NFTMarketplace marketplace = new NFTMarketplace();

        vm.stopBroadcast();

        // Log deployed addresses
        console.log("=== Monad Testnet Deployment Successful ===");
        console.log("DerivativeNFT deployed to:", address(derivativeNFT));
        console.log("NFTMarketplace deployed to:", address(marketplace));
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        
        // Save addresses to environment variables format
        console.log("");
        console.log("Add these to your .env.local:");
        console.log("NEXT_PUBLIC_MONAD_DERIVATIVE_NFT_ADDRESS=", vm.toString(address(derivativeNFT)));
        console.log("NEXT_PUBLIC_MONAD_MARKETPLACE_ADDRESS=", vm.toString(address(marketplace)));
    }
}
