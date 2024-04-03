// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract MyERC721Token is ERC721Enumerable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    uint256 public constant MAX_SUPPLY = 1000;
    uint256 public constant TOKEN_PRICE = 0.01 ether;
    uint256 public constant SET_PRICE = 0.05 ether;
    uint256 public constant MAX_MINT_PER_TX = 3;
    uint256 public constant SET_SIZE = 6;

    mapping(address => bool) public hasMintedSet;
    mapping(bytes => bool) private usedSignatures;

    event SetMinted(uint256 startIndex, address minter);

    constructor() ERC721("MyERC721Token", "MTK") {}

    function mint(uint256 numberOfTokens) public payable {
        require(numberOfTokens <= MAX_MINT_PER_TX, "Cannot mint that many at once.");
        require(totalSupply() + numberOfTokens <= MAX_SUPPLY, "Exceeds maximum supply.");
        require(TOKEN_PRICE * numberOfTokens == msg.value, "Ether value sent is not correct.");
        
        mintNum(numberOfTokens);
    }

    function signedMint(uint256 numberOfTokens, bytes32 messageHash, bytes memory signature) public { // dev: not the best way to verify sinature, 
        require(numberOfTokens <= MAX_MINT_PER_TX, "Cannot mint that many at once.");                   //      but i couldn't find a bug, sorry :) 
        require(totalSupply() + numberOfTokens <= MAX_SUPPLY, "Exceeds maximum supply.");
        require(!usedSignatures[signature], "Signature already used.");
        
        require(messageHash.recover(signature) == msg.sender, "Invalid signature.");

        usedSignatures[signature] = true;
        
        mintNum(numberOfTokens);
    }

    function mintSet() public payable {
        require(!hasMintedSet[msg.sender], "Address has already minted a set.");
        require(totalSupply() + SET_SIZE <= MAX_SUPPLY, "Exceeds maximum supply.");
        require(SET_PRICE == msg.value, "Ether value sent is not correct.");
        
        mintNum(SET_SIZE);

        hasMintedSet[msg.sender] = true;
        
        emit SetMinted(totalSupply(), msg.sender); // dev: last 6 nfts are minted by mintSet()
    }

    function mintNum(uint256 _num) internal {
        uint256 startIndex = totalSupply();
        for (uint256 i = 0; i < _num; i++) {
            _safeMint(msg.sender, startIndex + i);
        }
    }
}