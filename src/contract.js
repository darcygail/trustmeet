export const ContractAddress = "0xYourContractAddress"; // 你的合约地址
export const ContractABI = [
    // 合约 ABI
    {
        "inputs": [
            { "internalType": "uint256", "name": "depositAmount", "type": "uint256" },
            { "internalType": "uint256", "name": "meetTime", "type": "uint256" },
            { "internalType": "string", "name": "meetLocation", "type": "string" }
        ],
        "name": "createMeeting",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "join",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
];
