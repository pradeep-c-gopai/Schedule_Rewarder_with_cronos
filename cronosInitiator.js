const { Web3 } = require('web3');

const web3Cronos = new Web3('https://evm-t3.cronos.org/');

const poolContractABI = require('./constants/poolAbi.json');

const routerContractABI = require('./constants/routerAbi.json');

const cronosPoolContractAddress = '0xFBdD2c6Dadb70A48b5574970851177568721203C';

const cronosRouterContractAddress = '0x404835EcB83d7A99d26A4C91369375Be71A8612C';

// Contract instance
const cronosPoolContract = new web3Cronos.eth.Contract(poolContractABI, cronosPoolContractAddress);

// Contract instance
const cronosRouterContract = new web3Cronos.eth.Contract(routerContractABI, cronosRouterContractAddress);

const { iterateCronosPool, iterateCronosRouter } = require('./helper/cronosIterator');

const getMethodNameBase = require('./controller/validation');

async function getPoolContractTransactionsInCronos() {

  const latestBlockCronos = await web3Cronos.eth.getBlockNumber();
   
  try {

    _from = 18194864;

    // _to = 18507855;
    _to = Number(latestBlockCronos);

    // Execute both functions concurrently with Promise.all() and destructuring assignment
    const [allRouterEvents, allPoolEvents] = await Promise.all([
      iterateCronosPool(_from, _to, cronosPoolContract),
      iterateCronosRouter(_from, _to, cronosRouterContract)
    ]);

    const allEvents = [...allPoolEvents, ...allRouterEvents].sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber));

    console.log(allEvents)

    allEvents.forEach(async event => {
      console.log("event.blockNumber ", event.blockNumber);
      await getMethodNameBase(event.transactionHash, 338);
    });

  } catch (error) {
    console.error('Error fetching cronosPoolContract transactions:', error);
  }
}

getPoolContractTransactionsInCronos();
