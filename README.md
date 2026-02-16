# Web3春节联欢晚会2026 - 机甲马年纪念徽章

🐴🎊 **庆祝中华传统新年与Web3科技的完美融合**

## 项目简介

这是首届Web3春节联欢晚会的纪念徽章NFT项目，限量发行2026个动态数字藏品，见证Web3春节文化的历史时刻。

### 🎨 特色亮点

- **🎬 动态NFT**: 机甲马霓虹光效动画
- **🎁 免费获取**: 零成本mint，每个钱包限1个
- **⚡ BSC链**: 低gas费，环保高效
- **🏮 春节主题**: 传承中华文化，拥抱科技未来
- **💎 版税收益**: 5%交易分成支持创作者
- **🎊 未来权益**: 下一年春晚白名单资格

### 📊 项目参数

- **总发行量**: 2026个
- **公开发行**: 2000个
- **创作者预留**: 26个
- **每钱包限制**: 1个
- **Mint时间**: 2026年2月16日 20:26 (北京时间)
- **区块链**: BSC (Binance Smart Chain)
- **合约标准**: ERC-721 + EIP-2981 (版税)

## 技术栈

### 前端
- **React 18** + **TypeScript**
- **Vite** (构建工具)
- **Tailwind CSS** (样式框架)
- **Framer Motion** (动画库)
- **Wagmi** + **RainbowKit** (Web3连接)

### 智能合约
- **Solidity ^0.8.19**
- **OpenZeppelin** (安全框架)
- **Hardhat** (开发环境)

### 存储
- **Web3.Storage** (IPFS分布式存储)
- **BSC Testnet/Mainnet** 部署

## 快速开始

### 1. 安装依赖

```bash
cd web3-spring-festival-nft
npm install
```

### 2. 环境配置

创建 `.env.local` 文件：

```bash
# WalletConnect项目ID (从 https://cloud.walletconnect.com/ 获取)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# 合约地址 (部署后填入)
VITE_CONTRACT_ADDRESS_BSC=0x...
VITE_CONTRACT_ADDRESS_BSC_TESTNET=0x...

# Web3.Storage API Token
WEB3_STORAGE_TOKEN=your_web3_storage_token

# BSC私钥 (部署用)
PRIVATE_KEY=your_private_key
```

### 3. 本地开发

```bash
npm run dev
```

浏览器打开 `http://localhost:3000`

### 4. 构建部署

```bash
npm run build
npm run preview
```

## 智能合约部署

### 测试网部署

```bash
cd contracts
npx hardhat deploy --network bsc-testnet
```

### 主网部署

```bash
npx hardhat deploy --network bsc-mainnet
```

## 项目结构

```
web3-spring-festival-nft/
├── contracts/                    # 智能合约
│   ├── SpringFestivalBadge2026.sol
│   └── deploy/
├── src/                          # 前端源码
│   ├── components/               # React组件
│   │   ├── MintPage.tsx         # 主mint页面
│   │   ├── CountdownTimer.tsx   # 倒计时组件
│   │   └── NFTPreview.tsx       # NFT预览组件
│   ├── config/                  # 配置文件
│   │   └── wagmi.ts            # Web3配置
│   ├── App.tsx                  # 主应用
│   ├── main.tsx                 # 入口文件
│   └── index.css               # 全局样式
├── public/                      # 静态资源
├── package.json
└── README.md
```

## 部署清单

### 1. 前端部署 (Vercel)
- [ ] 连接GitHub仓库
- [ ] 设置环境变量
- [ ] 自动部署

### 2. 合约部署
- [ ] BSC测试网测试
- [ ] 主网部署
- [ ] 更新前端合约地址

### 3. NFT资源上传
- [ ] 动态视频压缩优化
- [ ] Web3.Storage上传
- [ ] metadata.json生成

### 4. 域名配置
- [ ] 自定义域名绑定
- [ ] SSL证书配置
- [ ] DNS解析设置

## 成本预算

| 项目 | 金额 | 说明 |
|------|------|------|
| 开发 | $0 | 自主开发 |
| BSC部署 | ~$20 | Gas费 |
| Web3.Storage | $0 | 免费5GB额度 |
| 域名 | $20/年 | .com域名 |
| **总计** | **$40** | 极致性价比 |

## 联系方式

- **创作者**: 几木 火星探测技术站
- **Telegram**: @jimu1921
- **项目愿景**: 每年春节发行纪念徽章，传承中华文化，拥抱Web3未来

---

### 🏮 传承中华文化 · 拥抱Web3未来 · 每年春节不见不散 🏮