// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/NFTMarketplace.sol";
import "../contracts/DerivativeNFT.sol";

contract NFTMarketplaceTest is Test {
    NFTMarketplace public marketplace;
    DerivativeNFT public nftContract;
    address public owner;
    address public seller;
    address public buyer;
    address public baseNFTContract;

    uint256 public constant LISTING_PRICE = 1 ether;
    uint256 public constant BASE_TOKEN_ID = 123;

    function setUp() public {
        owner = address(this);
        seller = address(0x1);
        buyer = address(0x2);
        baseNFTContract = address(0x3);

        marketplace = new NFTMarketplace();
        nftContract = new DerivativeNFT("Test NFT", "TNFT");

        // Give some ETH to buyer
        vm.deal(buyer, 10 ether);
        vm.deal(seller, 1 ether);
    }

    function testListNFT() public {
        // Mint NFT to seller
        uint256 tokenId = nftContract.mintDerivative(
            seller,
            "Test NFT",
            "A test NFT",
            baseNFTContract,
            BASE_TOKEN_ID,
            "ipfs://test",
            "ipfs://metadata"
        );

        // Approve marketplace
        vm.prank(seller);
        nftContract.approve(address(marketplace), tokenId);

        // List NFT
        vm.prank(seller);
        marketplace.listNFT(
            address(nftContract),
            tokenId,
            LISTING_PRICE,
            baseNFTContract,
            BASE_TOKEN_ID
        );

        // Check listing details
        NFTMarketplace.Listing memory listing = marketplace.listings(0);
        assertEq(listing.nftContract, address(nftContract));
        assertEq(listing.tokenId, tokenId);
        assertEq(listing.seller, seller);
        assertEq(listing.price, LISTING_PRICE);
        assertTrue(listing.active);
        assertEq(listing.baseNFTAddress, baseNFTContract);
        assertEq(listing.baseTokenId, BASE_TOKEN_ID);
    }

    function testBuyNFT() public {
        // Setup: List an NFT
        uint256 tokenId = nftContract.mintDerivative(
            seller,
            "Test NFT",
            "A test NFT",
            baseNFTContract,
            BASE_TOKEN_ID,
            "ipfs://test",
            "ipfs://metadata"
        );

        vm.prank(seller);
        nftContract.approve(address(marketplace), tokenId);

        vm.prank(seller);
        marketplace.listNFT(
            address(nftContract),
            tokenId,
            LISTING_PRICE,
            baseNFTContract,
            BASE_TOKEN_ID
        );

        uint256 sellerBalanceBefore = seller.balance;
        uint256 buyerBalanceBefore = buyer.balance;

        // Buy the NFT
        vm.prank(buyer);
        marketplace.buyNFT{value: LISTING_PRICE}(0);

        // Check ownership transferred
        assertEq(nftContract.ownerOf(tokenId), buyer);

        // Check listing is inactive
        NFTMarketplace.Listing memory listing = marketplace.listings(0);
        assertFalse(listing.active);

        // Check payments (seller gets 97.5%, marketplace gets 2.5%)
        uint256 expectedMarketplaceFee = (LISTING_PRICE * 250) / 10000; // 2.5%
        uint256 expectedSellerProceeds = LISTING_PRICE - expectedMarketplaceFee;
        
        assertEq(seller.balance, sellerBalanceBefore + expectedSellerProceeds);
        assertEq(buyer.balance, buyerBalanceBefore - LISTING_PRICE);
    }

    function testCancelListing() public {
        // Setup: List an NFT
        uint256 tokenId = nftContract.mintDerivative(
            seller,
            "Test NFT",
            "A test NFT",
            baseNFTContract,
            BASE_TOKEN_ID,
            "ipfs://test",
            "ipfs://metadata"
        );

        vm.prank(seller);
        nftContract.approve(address(marketplace), tokenId);

        vm.prank(seller);
        marketplace.listNFT(
            address(nftContract),
            tokenId,
            LISTING_PRICE,
            baseNFTContract,
            BASE_TOKEN_ID
        );

        // Cancel listing
        vm.prank(seller);
        marketplace.cancelListing(0);

        // Check listing is inactive
        NFTMarketplace.Listing memory listing = marketplace.listings(0);
        assertFalse(listing.active);

        // NFT should still be with seller
        assertEq(nftContract.ownerOf(tokenId), seller);
    }

    function testGetActiveListings() public {
        // Create multiple listings
        uint256 tokenId1 = nftContract.mintDerivative(
            seller,
            "NFT 1",
            "First NFT",
            baseNFTContract,
            BASE_TOKEN_ID,
            "ipfs://test1",
            "ipfs://metadata1"
        );

        uint256 tokenId2 = nftContract.mintDerivative(
            seller,
            "NFT 2",
            "Second NFT",
            baseNFTContract,
            BASE_TOKEN_ID + 1,
            "ipfs://test2",
            "ipfs://metadata2"
        );

        vm.startPrank(seller);
        nftContract.approve(address(marketplace), tokenId1);
        nftContract.approve(address(marketplace), tokenId2);

        marketplace.listNFT(address(nftContract), tokenId1, LISTING_PRICE, baseNFTContract, BASE_TOKEN_ID);
        marketplace.listNFT(address(nftContract), tokenId2, LISTING_PRICE * 2, baseNFTContract, BASE_TOKEN_ID + 1);
        vm.stopPrank();

        // Get active listings
        NFTMarketplace.Listing[] memory activeListings = marketplace.getActiveListings();
        assertEq(activeListings.length, 2);
        assertEq(activeListings[0].tokenId, tokenId1);
        assertEq(activeListings[1].tokenId, tokenId2);
    }

    function testFailListNFTNotOwned() public {
        uint256 tokenId = nftContract.mintDerivative(
            seller,
            "Test NFT",
            "A test NFT",
            baseNFTContract,
            BASE_TOKEN_ID,
            "ipfs://test",
            "ipfs://metadata"
        );

        // Try to list NFT as non-owner
        vm.prank(buyer);
        marketplace.listNFT(
            address(nftContract),
            tokenId,
            LISTING_PRICE,
            baseNFTContract,
            BASE_TOKEN_ID
        );
    }

    function testFailBuyNFTInsufficientPayment() public {
        uint256 tokenId = nftContract.mintDerivative(
            seller,
            "Test NFT",
            "A test NFT",
            baseNFTContract,
            BASE_TOKEN_ID,
            "ipfs://test",
            "ipfs://metadata"
        );

        vm.prank(seller);
        nftContract.approve(address(marketplace), tokenId);

        vm.prank(seller);
        marketplace.listNFT(
            address(nftContract),
            tokenId,
            LISTING_PRICE,
            baseNFTContract,
            BASE_TOKEN_ID
        );

        // Try to buy with insufficient payment
        vm.prank(buyer);
        marketplace.buyNFT{value: LISTING_PRICE - 1}(0);
    }

    function testFailSellerBuyOwnNFT() public {
        uint256 tokenId = nftContract.mintDerivative(
            seller,
            "Test NFT",
            "A test NFT",
            baseNFTContract,
            BASE_TOKEN_ID,
            "ipfs://test",
            "ipfs://metadata"
        );

        vm.prank(seller);
        nftContract.approve(address(marketplace), tokenId);

        vm.prank(seller);
        marketplace.listNFT(
            address(nftContract),
            tokenId,
            LISTING_PRICE,
            baseNFTContract,
            BASE_TOKEN_ID
        );

        // Seller tries to buy their own NFT
        vm.prank(seller);
        marketplace.buyNFT{value: LISTING_PRICE}(0);
    }

    function testUpdateMarketplaceFee() public {
        uint256 newFee = 500; // 5%
        marketplace.updateMarketplaceFee(newFee);
        assertEq(marketplace.marketplaceFee(), newFee);
    }

    function testFailUpdateMarketplaceFeeExceedsLimit() public {
        uint256 newFee = 1100; // 11% - should fail
        marketplace.updateMarketplaceFee(newFee);
    }

    function testWithdrawFees() public {
        // Setup: Complete a sale to generate fees
        uint256 tokenId = nftContract.mintDerivative(
            seller,
            "Test NFT",
            "A test NFT",
            baseNFTContract,
            BASE_TOKEN_ID,
            "ipfs://test",
            "ipfs://metadata"
        );

        vm.prank(seller);
        nftContract.approve(address(marketplace), tokenId);

        vm.prank(seller);
        marketplace.listNFT(
            address(nftContract),
            tokenId,
            LISTING_PRICE,
            baseNFTContract,
            BASE_TOKEN_ID
        );

        vm.prank(buyer);
        marketplace.buyNFT{value: LISTING_PRICE}(0);

        uint256 ownerBalanceBefore = owner.balance;
        marketplace.withdrawFees();
        
        uint256 expectedFees = (LISTING_PRICE * 250) / 10000;
        assertEq(owner.balance, ownerBalanceBefore + expectedFees);
    }
}
