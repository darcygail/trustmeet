let provider;
let signer;
let contract;
let meetingContract;
let meetingAddress;
let contractABI = [
    // 添加你的合约ABI
];

async function init() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        document.getElementById("status").textContent = "状态：已连接";
    } else {
        alert("请安装 MetaMask");
    }
}

async function createMeeting() {
    const depositAmount = ethers.utils.parseEther(document.getElementById("depositAmount").value);
    const meetingTime = new Date(document.getElementById("meetingTime").value).getTime() / 1000; // 转换为UNIX时间戳
    const meetingLocation = document.getElementById("meetingLocation").value;

    try {
        const factory = new ethers.ContractFactory(contractABI, bytecode, signer);
        meetingContract = await factory.deploy(depositAmount, meetingTime, meetingLocation);
        await meetingContract.deployed();
        meetingAddress = meetingContract.address;

        document.getElementById("inviteButton").disabled = false;
        document.getElementById("joinButton").disabled = false;
        alert("见面合约已创建成功！");
    } catch (error) {
        console.error(error);
        alert("创建合约失败！");
    }
}

async function inviteFriend() {
    const friendAddress = document.getElementById("inviteAddress").value;
    try {
        await meetingContract.invite(friendAddress);
        alert("邀请已发送！");
    } catch (error) {
        console.error(error);
        alert("邀请失败！");
    }
}

async function joinMeeting() {
    const depositAmount = ethers.utils.parseEther(document.getElementById("depositAmount").value);

    try {
        const tx = await meetingContract.join({ value: depositAmount });
        await tx.wait();
        alert("成功加入见面！");
    } catch (error) {
        console.error(error);
        alert("加入见面失败！");
    }
}

async function viewMeetingStatus() {
    try {
        const status = await meetingContract.getMeetingStatus();
        alert("当前状态：" + status);
    } catch (error) {
        console.error(error);
        alert("获取状态失败！");
    }
}

document.getElementById("createMeetingButton").addEventListener("click", createMeeting);
document.getElementById("inviteButton").addEventListener("click", inviteFriend);
document.getElementById("joinButton").addEventListener("click", joinMeeting);
document.getElementById("viewButton").addEventListener("click", viewMeetingStatus);

window.onload = init;
