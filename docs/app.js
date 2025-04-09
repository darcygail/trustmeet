let web3;
let contract;
let contractInstance;
let userAccount;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
    const accounts = await web3.eth.getAccounts();
    userAccount = accounts[0];
  } else {
    alert("请安装 MetaMask 扩展");
  }
});

async function deployContract() {
  const res = await fetch("../contracts/trustmeet.json");
  const data = await res.json();
  contract = new web3.eth.Contract(data.abi);

  const deposit = document.getElementById("depositAmount").value;
  const meetTime = getTimestampFromInput("meetTime");

  contract
    .deploy({
      data: data.bytecode,
      arguments: [web3.utils.toWei(deposit, "ether"), meetTime],
    })
    .send({ from: userAccount })
    .then((instance) => {
      contractInstance = instance;
      alert("部署成功，合约地址: " + instance.options.address);
    });
}

async function loadContract() {
  const res = await fetch("../contracts/trustmeet.json");
  const data = await res.json();
  const address = document.getElementById("contractAddress").value;
  contractInstance = new web3.eth.Contract(data.abi, address);
  alert("合约已加载");
}

function getTimestampFromInput(inputId) {
    const datetime = document.getElementById(inputId).value;
    return Math.floor(new Date(datetime).getTime() / 1000); // 转为秒级时间戳
}  

async function invite() {
  const invitee = document.getElementById("invitee").value;
  await contractInstance.methods.invite(invitee).send({ from: userAccount });
}

async function join() {
  const deposit = await contractInstance.methods.depositAmount().call();
  await contractInstance.methods.join().send({
    from: userAccount,
    value: deposit,
  });
}

async function confirmArrival() {
  await contractInstance.methods.confirmArrival().send({ from: userAccount });
}
