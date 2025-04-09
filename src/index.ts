import { ethers } from "ethers";
import { ContractABI, ContractAddress } from "./contract"; // 导入合约的 ABI 和地址

// 合约交互示例
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(ContractAddress, ContractABI, signer);

async function createMeeting() {
    const meetingDetails = {
        depositAmount: ethers.utils.parseEther("0.1"), // 例如：每人 0.1 ETH
        meetTime: Math.floor(Date.now() / 1000) + 3600, // 设置 1 小时后为见面时间
        meetLocation: "123 Meeting St.",
    };
    
    try {
        await contract.createMeeting(meetingDetails.depositAmount, meetingDetails.meetTime, meetingDetails.meetLocation);
        console.log("Meeting created!");
    } catch (error) {
        console.error("Error creating meeting", error);
    }
}

async function joinMeeting() {
    const depositAmount = ethers.utils.parseEther("0.1");
    
    try {
        await contract.join({ value: depositAmount });
        console.log("Joined meeting!");
    } catch (error) {
        console.error("Error joining meeting", error);
    }
}

document.getElementById("createMeetingBtn")?.addEventListener("click", createMeeting);
document.getElementById("joinMeetingBtn")?.addEventListener("click", joinMeeting);
