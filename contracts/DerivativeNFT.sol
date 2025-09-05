// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import "lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";
/**
 * @title DerivativeNFT
 * @dev ERC721 contract for minting derivative NFTs with base NFT provenance tracking
 */
contract DerivativeNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    struct DerivativeMetadata {
        string name;
        string description;
        uint256 timestamp;
        address baseNFTAddress;
        uint256 baseTokenId;
        string imageURL;
        address creator;
    }

    // Mapping from token ID to derivative metadata
    mapping(uint256 => DerivativeMetadata) public derivatives;
    
    // Mapping from base NFT to derivative token IDs
    mapping(bytes32 => uint256[]) public baseToDerivatives;

    event DerivativeMinted(
        uint256 indexed tokenId,
        address indexed creator,
        address indexed baseNFTAddress,
        uint256 baseTokenId,
        string tokenURI
    );

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) Ownable(msg.sender) {}

    /**
     * @dev Mint a new derivative NFT
     * @param to Address to mint the NFT to
     * @param name_ Name of the derivative NFT
     * @param description_ Description of the derivative NFT
     * @param baseNFTAddress Address of the base NFT contract
     * @param baseTokenId Token ID of the base NFT
     * @param imageURL IPFS URL of the generated image
     * @param tokenURI_ Complete metadata URI (IPFS JSON)
     */
    function mintDerivative(
        address to,
        string memory name_,
        string memory description_,
        address baseNFTAddress,
        uint256 baseTokenId,
        string memory imageURL,
        string memory tokenURI_
    ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        // Store derivative metadata
        derivatives[tokenId] = DerivativeMetadata({
            name: name_,
            description: description_,
            timestamp: block.timestamp,
            baseNFTAddress: baseNFTAddress,
            baseTokenId: baseTokenId,
            imageURL: imageURL,
            creator: to
        });

        // Track derivatives by base NFT
        bytes32 baseKey = keccak256(abi.encodePacked(baseNFTAddress, baseTokenId));
        baseToDerivatives[baseKey].push(tokenId);

        // Mint the NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        emit DerivativeMinted(tokenId, to, baseNFTAddress, baseTokenId, tokenURI_);

        return tokenId;
    }

    /**
     * @dev Get all derivative token IDs for a base NFT
     * @param baseNFTAddress Address of the base NFT contract
     * @param baseTokenId Token ID of the base NFT
     */
    function getDerivativesByBase(
        address baseNFTAddress,
        uint256 baseTokenId
    ) public view returns (uint256[] memory) {
        bytes32 baseKey = keccak256(abi.encodePacked(baseNFTAddress, baseTokenId));
        return baseToDerivatives[baseKey];
    }

    /**
     * @dev Get derivative metadata for a token ID
     * @param tokenId Token ID to get metadata for
     */
    function getDerivativeMetadata(
        uint256 tokenId
    ) public view returns (DerivativeMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "DerivativeNFT: token does not exist");
        return derivatives[tokenId];
    }

    /**
     * @dev Get total number of derivatives minted
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }


    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
