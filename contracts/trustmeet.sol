// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TrustMeet {
    address public initiator;  // 合约发起者
    uint256 public depositAmount;  // 每个参与者的押金
    uint256 public meetTime;  // 见面时间戳
    string public meetLocation;  // 见面地点
    address[] public invited;  // 被邀请的参与者
    address[] public participants;  // 已支付押金并确认参与的参与者
    mapping(address => bool) public confirmedArrival;  // 记录每个参与者是否到达
    mapping(address => bool) public hasPaidDeposit;  // 记录参与者是否已支付押金
    uint256 public totalDeposits;  // 合约中存储的总押金
    bool public meetingConfirmed = false;  // 是否确认见面
    bool public meetingCanceled = false;  // 是否取消见面

    modifier onlyInitiator() {
        require(msg.sender == initiator, "Only initiator can perform this action");
        _;
    }

    modifier onlyBeforeMeetTime() {
        require(block.timestamp < meetTime, "Meeting time has passed");
        _;
    }

    modifier onlyAfterMeetTime() {
        require(block.timestamp >= meetTime, "Meeting has not yet occurred");
        _;
    }

    modifier onlyParticipant() {
        bool isParticipant = false;
        for (uint i = 0; i < participants.length; i++) {
            if (participants[i] == msg.sender) {
                isParticipant = true;
                break;
            }
        }
        require(isParticipant, "Only participants can confirm arrival");
        _;
    }

    // 构造函数：初始化合约发起者，设置见面时间和地点
    constructor(uint256 _depositAmount, uint256 _meetTime, string memory _meetLocation) {
        initiator = msg.sender;
        depositAmount = _depositAmount;
        meetTime = _meetTime;
        meetLocation = _meetLocation;
    }

    // 合约发起者邀请参与者
    function inviteParticipant(address participant) external onlyInitiator {
        invited.push(participant);
    }

    // 用户支付押金并加入会议
    function join() external payable onlyBeforeMeetTime {
        require(block.timestamp <= meetTime - 5 minutes, "Joining is not allowed 5 minutes before the meeting");
        require(!hasPaidDeposit[msg.sender], "You have already joined");
        
        // 检查是否是被邀请的参与者
        bool isInvited = false;
        for (uint i = 0; i < invited.length; i++) {
            if (invited[i] == msg.sender) {
                isInvited = true;
                break;
            }
        }
        require(isInvited, "You are not invited to this meeting");

        require(msg.value == depositAmount, "Deposit must be equal to the set amount");
        
        hasPaidDeposit[msg.sender] = true;
        participants.push(msg.sender);
        totalDeposits += msg.value;
    }

    // 参与者确认到达（必须在见面时间之前确认）
    function confirmArrival() external onlyBeforeMeetTime onlyParticipant {
        confirmedArrival[msg.sender] = true;
    }

    // 自动确认见面结束（见面时间到达后自动完成），并进行押金转账
    function confirmMeeting() external onlyAfterMeetTime onlyInitiator {
        require(!meetingConfirmed, "Meeting has already been confirmed");

        uint256 totalConfirmed = 0;

        // 统计已确认到达的参与者
        for (uint i = 0; i < participants.length; i++) {
            if (confirmedArrival[participants[i]]) {
                totalConfirmed++;
            }
        }

        require(totalConfirmed > 0, "At least one participant must confirm arrival");

        uint256 rewardPerConfirmed = totalDeposits / totalConfirmed;

        // 将所有参与者的押金平分给已到场的参与者
        for (uint i = 0; i < participants.length; i++) {
            if (confirmedArrival[participants[i]] && hasPaidDeposit[participants[i]]) {
                uint256 reward = rewardPerConfirmed;

                // 转账奖励
                payable(participants[i]).transfer(reward);
            }
        }

        // 见面确认后不再允许变更
        meetingConfirmed = true;
    }

    // 发起者取消会议（只能在见面时间之前取消）
    function cancelMeeting() external onlyInitiator onlyBeforeMeetTime {
        require(!meetingCanceled, "Meeting has already been canceled");

        uint256 amountPerParticipant = totalDeposits / participants.length;

        // 退还每个参与者的押金
        for (uint i = 0; i < participants.length; i++) {
            if (hasPaidDeposit[participants[i]]) {
                payable(participants[i]).transfer(amountPerParticipant);
            }
        }

        meetingCanceled = true;
    }

    // 查看参与者的押金
    function getDepositAmount() external view returns (uint256) {
        return depositAmount;
    }

    // 获取所有参与者的地址
    function getParticipants() external view returns (address[] memory) {
        return participants;
    }

    // 获取所有被邀请的参与者
    function getInvited() external view returns (address[] memory) {
        return invited;
    }

    // 获取会议详情：时间和地点
    function getMeetingDetails() external view returns (uint256, string memory) {
        return (meetTime, meetLocation);
    }
}
