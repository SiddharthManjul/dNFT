// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";
/**
 * @title NFTMarketplace
 * @dev Marketplace for buying and selling NFTs with provenance tracking
 */
contract NFTMarketplace is ReentrancyGuard, Ownable {
    uint256 private _listingIdCounter;

    constructor() Ownable(msg.sender) {}

    struct Listing {
        uint256 listingId;
        address nftContract;
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
        uint256 timestamp;
        address baseNFTAddress; // For provenance tracking
        uint256 baseTokenId;    // For provenance tracking
    }

    // Mapping from listing ID to listing details
    mapping(uint256 => Listing) public listings;
    
    // Mapping from NFT contract + token ID to listing ID
    mapping(bytes32 => uint256) public nftToListing;
    
    // Array of all listing IDs for enumeration
    uint256[] public allListings;
    
    // Marketplace fee (in basis points, e.g., 250 = 2.5%)
    uint256 public marketplaceFee = 250;
    uint256 private constant FEES_DENOMINATOR = 10000;

    event NFTListed(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price,
        address baseNFTAddress,
        uint256 baseTokenId
    );

    event NFTSold(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    event ListingCancelled(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller
    );

    /**
     * @dev List an NFT for sale
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to list
     * @param price Price in wei
     * @param baseNFTAddress Address of base NFT for provenance (0x0 if not derivative)
     * @param baseTokenId Token ID of base NFT for provenance (0 if not derivative)
     */
    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        address baseNFTAddress,
        uint256 baseTokenId
    ) external nonReentrant {
        require(price > 0, "Price must be greater than 0");
        require(
            IERC721(nftContract).ownerOf(tokenId) == msg.sender,
            "You don't own this NFT"
        );
        require(
            IERC721(nftContract).isApprovedForAll(msg.sender, address(this)) ||
            IERC721(nftContract).getApproved(tokenId) == address(this),
            "Marketplace not approved to transfer NFT"
        );

        bytes32 nftKey = keccak256(abi.encodePacked(nftContract, tokenId));
        require(nftToListing[nftKey] == 0, "NFT already listed");

        uint256 listingId = _listingIdCounter;
        _listingIdCounter++;

        listings[listingId] = Listing({
            listingId: listingId,
            nftContract: nftContract,
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true,
            timestamp: block.timestamp,
            baseNFTAddress: baseNFTAddress,
            baseTokenId: baseTokenId
        });

        nftToListing[nftKey] = listingId;
        allListings.push(listingId);

        emit NFTListed(
            listingId,
            nftContract,
            tokenId,
            msg.sender,
            price,
            baseNFTAddress,
            baseTokenId
        );
    }

    /**
     * @dev Buy an NFT from the marketplace
     * @param listingId ID of the listing to purchase
     */
    function buyNFT(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing is not active");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy your own NFT");

        // Verify the seller still owns the NFT
        require(
            IERC721(listing.nftContract).ownerOf(listing.tokenId) == listing.seller,
            "Seller no longer owns the NFT"
        );

        // Calculate fees
        uint256 marketplaceFeeAmount = (listing.price * marketplaceFee) / FEES_DENOMINATOR;
        uint256 sellerProceeds = listing.price - marketplaceFeeAmount;

        // Mark listing as inactive
        listing.active = false;
        bytes32 nftKey = keccak256(abi.encodePacked(listing.nftContract, listing.tokenId));
        delete nftToListing[nftKey];

        // Transfer NFT to buyer
        IERC721(listing.nftContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );

        // Transfer payments
        if (sellerProceeds > 0) {
            payable(listing.seller).transfer(sellerProceeds);
        }
        
        // Refund excess payment
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }

        emit NFTSold(
            listingId,
            listing.nftContract,
            listing.tokenId,
            listing.seller,
            msg.sender,
            listing.price
        );
    }

    /**
     * @dev Cancel a listing
     * @param listingId ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing is not active");
        require(listing.seller == msg.sender || owner() == msg.sender, "Not authorized");

        listing.active = false;
        bytes32 nftKey = keccak256(abi.encodePacked(listing.nftContract, listing.tokenId));
        delete nftToListing[nftKey];

        emit ListingCancelled(
            listingId,
            listing.nftContract,
            listing.tokenId,
            listing.seller
        );
    }

    /**
     * @dev Get all active listings
     */
    function getActiveListings() external view returns (Listing[] memory) {
        uint256 activeCount = 0;
        
        // Count active listings
        for (uint256 i = 0; i < allListings.length; i++) {
            if (listings[allListings[i]].active) {
                activeCount++;
            }
        }

        // Create array of active listings
        Listing[] memory activeListings = new Listing[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < allListings.length; i++) {
            if (listings[allListings[i]].active) {
                activeListings[currentIndex] = listings[allListings[i]];
                currentIndex++;
            }
        }

        return activeListings;
    }

    /**
     * @dev Get listings by seller
     * @param seller Address of the seller
     */
    function getListingsBySeller(address seller) external view returns (Listing[] memory) {
        uint256 sellerCount = 0;
        
        // Count seller listings
        for (uint256 i = 0; i < allListings.length; i++) {
            if (listings[allListings[i]].seller == seller) {
                sellerCount++;
            }
        }

        // Create array of seller listings
        Listing[] memory sellerListings = new Listing[](sellerCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < allListings.length; i++) {
            if (listings[allListings[i]].seller == seller) {
                sellerListings[currentIndex] = listings[allListings[i]];
                currentIndex++;
            }
        }

        return sellerListings;
    }

    /**
     * @dev Update marketplace fee (only owner)
     * @param newFee New fee in basis points
     */
    function updateMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        marketplaceFee = newFee;
    }

    /**
     * @dev Withdraw marketplace fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Get total number of listings
     */
    function getTotalListings() external view returns (uint256) {
        return allListings.length;
    }
}
