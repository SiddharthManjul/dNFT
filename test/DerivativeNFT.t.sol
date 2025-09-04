// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/DerivativeNFT.sol";

contract DerivativeNFTTest is Test {
    DerivativeNFT public derivativeNFT;
    address public owner;
    address public user1;
    address public user2;
    address public baseNFTContract;

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        baseNFTContract = address(0x3);
        
        derivativeNFT = new DerivativeNFT("Test Derivative", "TDERIV");
    }

    function testMintDerivative() public {
        string memory name = "Test Derivative";
        string memory description = "A test derivative NFT";
        uint256 baseTokenId = 123;
        string memory imageURL = "ipfs://QmTest123";
        string memory tokenURI = "ipfs://QmTestMetadata123";

        uint256 tokenId = derivativeNFT.mintDerivative(
            user1,
            name,
            description,
            baseNFTContract,
            baseTokenId,
            imageURL,
            tokenURI
        );

        // Check NFT was minted correctly
        assertEq(derivativeNFT.ownerOf(tokenId), user1);
        assertEq(derivativeNFT.tokenURI(tokenId), tokenURI);
        assertEq(derivativeNFT.totalSupply(), 1);

        // Check derivative metadata
        DerivativeNFT.DerivativeMetadata memory metadata = derivativeNFT.getDerivativeMetadata(tokenId);
        assertEq(metadata.name, name);
        assertEq(metadata.description, description);
        assertEq(metadata.baseNFTAddress, baseNFTContract);
        assertEq(metadata.baseTokenId, baseTokenId);
        assertEq(metadata.imageURL, imageURL);
        assertEq(metadata.creator, user1);
        assertTrue(metadata.timestamp > 0);
    }

    function testGetDerivativesByBase() public {
        uint256 baseTokenId = 123;
        
        // Mint multiple derivatives from the same base
        uint256 tokenId1 = derivativeNFT.mintDerivative(
            user1,
            "Derivative 1",
            "First derivative",
            baseNFTContract,
            baseTokenId,
            "ipfs://QmTest1",
            "ipfs://QmMeta1"
        );

        uint256 tokenId2 = derivativeNFT.mintDerivative(
            user2,
            "Derivative 2", 
            "Second derivative",
            baseNFTContract,
            baseTokenId,
            "ipfs://QmTest2",
            "ipfs://QmMeta2"
        );

        // Test getting derivatives by base NFT
        uint256[] memory derivatives = derivativeNFT.getDerivativesByBase(baseNFTContract, baseTokenId);
        assertEq(derivatives.length, 2);
        assertEq(derivatives[0], tokenId1);
        assertEq(derivatives[1], tokenId2);
    }

    function testMultipleBasesTracking() public {
        // Test that derivatives from different base NFTs are tracked separately
        uint256 baseTokenId1 = 123;
        uint256 baseTokenId2 = 456;
        address baseContract2 = address(0x4);

        derivativeNFT.mintDerivative(
            user1,
            "Derivative A",
            "From base 1",
            baseNFTContract,
            baseTokenId1,
            "ipfs://QmTestA",
            "ipfs://QmMetaA"
        );

        derivativeNFT.mintDerivative(
            user1,
            "Derivative B",
            "From base 2",
            baseContract2,
            baseTokenId2,
            "ipfs://QmTestB",
            "ipfs://QmMetaB"
        );

        uint256[] memory derivatives1 = derivativeNFT.getDerivativesByBase(baseNFTContract, baseTokenId1);
        uint256[] memory derivatives2 = derivativeNFT.getDerivativesByBase(baseContract2, baseTokenId2);

        assertEq(derivatives1.length, 1);
        assertEq(derivatives2.length, 1);
    }

    function testEventEmission() public {
        string memory name = "Test Derivative";
        string memory description = "A test derivative NFT";
        uint256 baseTokenId = 123;
        string memory imageURL = "ipfs://QmTest123";
        string memory tokenURI = "ipfs://QmTestMetadata123";

        vm.expectEmit(true, true, true, true);
        emit DerivativeNFT.DerivativeMinted(0, user1, baseNFTContract, baseTokenId, tokenURI);

        derivativeNFT.mintDerivative(
            user1,
            name,
            description,
            baseNFTContract,
            baseTokenId,
            imageURL,
            tokenURI
        );
    }

    function testGetNonexistentToken() public {
        vm.expectRevert("DerivativeNFT: token does not exist");
        derivativeNFT.getDerivativeMetadata(999);
    }
}
