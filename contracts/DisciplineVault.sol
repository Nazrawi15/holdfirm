// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IYoVault {
    function deposit(uint256 assets, address receiver) external returns (uint256);
    function redeem(uint256 shares, address receiver, address owner) external returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function convertToAssets(uint256 shares) external view returns (uint256);
}

contract DisciplineVault {

    IERC20 public immutable usdc;
    IYoVault public immutable yoVault;

    uint256 public constant LOCK_PERIOD = 30 days;
    uint256 public constant PENALTY_PERCENT = 5;
    uint256 public constant PRECISION = 1e18;

    struct UserInfo {
        uint256 shares;
        uint256 depositTime;
        uint256 rewardDebt;
    }

    mapping(address => UserInfo) public users;
    address[] public depositors;
    mapping(address => bool) public isDepositor;

    uint256 public totalShares;
    uint256 public accRewardPerShare;
    uint256 public pendingRewards;

    event Deposited(address indexed user, uint256 usdcAmount, uint256 shares);
    event Withdrawn(address indexed user, uint256 usdcAmount, bool early);
    event PenaltyDistributed(uint256 amount);

    constructor(address _usdc, address _yoVault) {
        usdc = IERC20(_usdc);
        yoVault = IYoVault(_yoVault);
    }

    function deposit(uint256 usdcAmount) external {
        require(usdcAmount > 0, "Amount must be > 0");

        // Transfer USDC from user
        usdc.transferFrom(msg.sender, address(this), usdcAmount);

        // Approve YO vault and deposit
        usdc.approve(address(yoVault), usdcAmount);
        uint256 sharesReceived = yoVault.deposit(usdcAmount, address(this));

        // Settle pending rewards before updating
        _settleRewards(msg.sender);

        // Update user info
        users[msg.sender].shares += sharesReceived;
        users[msg.sender].depositTime = block.timestamp;
        users[msg.sender].rewardDebt = (users[msg.sender].shares * accRewardPerShare) / PRECISION;

        totalShares += sharesReceived;

        // Track depositor
        if (!isDepositor[msg.sender]) {
            depositors.push(msg.sender);
            isDepositor[msg.sender] = true;
        }

        emit Deposited(msg.sender, usdcAmount, sharesReceived);
    }

    function withdraw(uint256 shareAmount) external {
        UserInfo storage user = users[msg.sender];
        require(user.shares >= shareAmount, "Insufficient shares");

        // Settle pending rewards first
        _settleRewards(msg.sender);

        bool isEarly = block.timestamp < user.depositTime + LOCK_PERIOD;
        uint256 sharesToRedeem = shareAmount;
        uint256 penaltyShares = 0;

        if (isEarly) {
            penaltyShares = (shareAmount * PENALTY_PERCENT) / 100;
            sharesToRedeem = shareAmount - penaltyShares;

            // Distribute penalty to remaining stakers
            if (totalShares > shareAmount && penaltyShares > 0) {
                accRewardPerShare += (penaltyShares * PRECISION) / (totalShares - shareAmount);
                emit PenaltyDistributed(penaltyShares);
            }
        }

        // Update state
        user.shares -= shareAmount;
        totalShares -= shareAmount;
        user.rewardDebt = (user.shares * accRewardPerShare) / PRECISION;

        // Redeem from YO vault
        yoVault.redeem(sharesToRedeem, msg.sender, address(this));

        emit Withdrawn(msg.sender, sharesToRedeem, isEarly);
    }

    function claimRewards() external {
        _settleRewards(msg.sender);
        users[msg.sender].rewardDebt = (users[msg.sender].shares * accRewardPerShare) / PRECISION;
    }

    function _settleRewards(address userAddr) internal {
        UserInfo storage user = users[userAddr];
        if (user.shares > 0) {
            uint256 pending = (user.shares * accRewardPerShare) / PRECISION - user.rewardDebt;
            if (pending > 0) {
                // Redeem pending reward shares from YO vault to user
                yoVault.redeem(pending, userAddr, address(this));
            }
        }
    }

    function getUserShares(address userAddr) external view returns (uint256) {
        return users[userAddr].shares;
    }

    function getPendingReward(address userAddr) external view returns (uint256) {
        UserInfo storage user = users[userAddr];
        if (user.shares == 0) return 0;
        return (user.shares * accRewardPerShare) / PRECISION - user.rewardDebt;
    }

    function isLocked(address userAddr) external view returns (bool) {
        return block.timestamp < users[userAddr].depositTime + LOCK_PERIOD;
    }

    function getTimeRemaining(address userAddr) external view returns (uint256) {
        uint256 unlockTime = users[userAddr].depositTime + LOCK_PERIOD;
        if (block.timestamp >= unlockTime) return 0;
        return unlockTime - block.timestamp;
    }

    function getDepositorCount() external view returns (uint256) {
        return depositors.length;
    }
}