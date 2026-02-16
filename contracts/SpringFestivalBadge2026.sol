// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SpringFestivalBadge2026 is ERC721, ERC721Royalty, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // 合约配置
    uint256 public constant MAX_SUPPLY = 2026;
    uint256 public constant RESERVED_SUPPLY = 26; // 预留给创作者
    uint256 public constant PUBLIC_SUPPLY = 2000; // 公开发售
    uint256 public constant MAX_PER_WALLET = 1; // 每个钱包限制
    
    // 时间配置 (2026年2月16日 20:26 北京时间 = UTC+8)
    // UTC时间: 2026年2月16日 12:26
    uint256 public constant MINT_START_TIME = 1771244760; // Unix timestamp

    // 结束时间：农历正月十六 0点（北京时间）
    // UTC时间: 2026年3月3日 16:00
    uint256 public constant MINT_END_TIME = 1772553600; // Unix timestamp
    
    // 基础URI
    string private _baseTokenURI;
    
    // 用户mint记录
    mapping(address => uint256) public userMintCount;
    
    // 事件
    event MintStarted(uint256 timestamp);
    event ReservedMint(address to, uint256 tokenId);
    event PublicMint(address to, uint256 tokenId);
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        address royaltyReceiver
    ) ERC721(name, symbol) {
        _baseTokenURI = baseURI;
        
        // 设置5%版税
        _setDefaultRoyalty(royaltyReceiver, 500); // 500 = 5%
        
        // 预mint 26个给创作者
        _mintReserved(msg.sender, RESERVED_SUPPLY);
    }
    
    /**
     * @dev 预留mint（仅创作者）
     */
    function _mintReserved(address to, uint256 amount) private {
        require(amount <= RESERVED_SUPPLY, "Exceeds reserved supply");
        
        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            _safeMint(to, tokenId);
            
            emit ReservedMint(to, tokenId);
        }
    }
    
    /**
     * @dev 公开mint函数
     */
    function publicMint() external payable {
        require(block.timestamp >= MINT_START_TIME, "Mint not started yet");
        require(block.timestamp < MINT_END_TIME, "Mint ended");
        require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply reached");
        require(userMintCount[msg.sender] < MAX_PER_WALLET, "Max per wallet reached");
        require(msg.value == 0, "This is a free mint"); // 免费mint
        
        // 检查公开供应量
        uint256 publicMinted = _tokenIdCounter.current() - RESERVED_SUPPLY;
        require(publicMinted < PUBLIC_SUPPLY, "Public supply exhausted");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        userMintCount[msg.sender]++;
        
        _safeMint(msg.sender, tokenId);
        
        emit PublicMint(msg.sender, tokenId);
    }
    
    /**
     * @dev 批量mint（仅owner，紧急使用）
     */
    function batchMint(address[] calldata recipients) external onlyOwner {
        for (uint256 i = 0; i < recipients.length; i++) {
            if (_tokenIdCounter.current() < MAX_SUPPLY) {
                uint256 tokenId = _tokenIdCounter.current();
                _tokenIdCounter.increment();
                _safeMint(recipients[i], tokenId);
            }
        }
    }
    
    /**
     * @dev 获取已mint数量
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev 获取剩余可mint数量
     */
    function remainingSupply() public view returns (uint256) {
        if (_tokenIdCounter.current() >= MAX_SUPPLY) {
            return 0;
        }
        return MAX_SUPPLY - _tokenIdCounter.current();
    }
    
    /**
     * @dev 检查mint是否已开始
     */
    function isMintStarted() public view returns (bool) {
        return block.timestamp >= MINT_START_TIME;
    }
    
    /**
     * @dev 获取mint开始时间
     */
    function getMintStartTime() public pure returns (uint256) {
        return MINT_START_TIME;
    }

    function getMintEndTime() public pure returns (uint256) {
        return MINT_END_TIME;
    }
    
    /**
     * @dev 设置基础URI
     */
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev 返回token URI
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 
            ? string(abi.encodePacked(baseURI, Strings.toString(tokenId), ".json"))
            : "";
    }
    
    /**
     * @dev 内部基础URI函数
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev 紧急提取函数（虽然是免费mint，但以防万一）
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // 重写接口支持
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721Royalty) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721Royalty) {
        super._burn(tokenId);
    }
}