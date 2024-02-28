const { Web3 } = require('web3');

// Initialize web3 with the provider
const web3Base = new Web3('https://base-sepolia.g.alchemy.com/v2/DyOXSqDxeGPhXIq71dOFsVq-gniGnKJG');

// Initialize web3 with the provider
const web3Cronos = new Web3('https://evm-t3.cronos.org/');

const poolContractABI = require('../constants/poolAbi.json');

const routerContractABI = require('../constants/routerAbi.json');

// const from = 0;

const pool = require('../database');

const path = require('path');

const { iterateCronosRouter, iterateCronosPool } = require('./cronosIterator');

const { readJsonFile, writeJsonFile } = require('../helper/readAndWriteBlocks');

// Contract address
const basePoolcontractAddress = '0xf75e544fFb50acB36C7565cd03388eEcb036A33A';

const baseRouterContractAddress = '0x6615ac4903b03c35f05b57e110cb1820014737c4';

const cronosPoolContractAddress = '0xFBdD2c6Dadb70A48b5574970851177568721203C';

const cronosRouterContractAddress = '0x404835EcB83d7A99d26A4C91369375Be71A8612C';

// Contract instance
const basePoolContract = new web3Base.eth.Contract(poolContractABI, basePoolcontractAddress);

// Contract instance
const baseRouterContract = new web3Base.eth.Contract(routerContractABI, baseRouterContractAddress);

// Contract instance
const cronosPoolContract = new web3Cronos.eth.Contract(poolContractABI, cronosPoolContractAddress);

// Contract instance
const cronosRouterContract = new web3Cronos.eth.Contract(routerContractABI, cronosRouterContractAddress);


module.exports.getLatestTxs = async function () {

    // const fromBlock = await getTransactionBlockNumber();
    // const fromBlock = ;

    const [fromBlockBase, fromBlockCronos] = await getTransactionBlockNumber();
    // const cronosFromBlockMock = 18876192 - 2000;

    const cronosFromBlockMock = await readJsonFile(path.resolve(__dirname, '../constants/blocks.json'));
    const allPoolEventsBase = await getPoolContractTransactionsInBase(fromBlockBase);
    const allRouterEventsBase = await getRouterContractTransactionsInBase(fromBlockBase);
    console.log("allPoolEventsBase.length, allRouterEventsBase.length ", allPoolEventsBase.length, allRouterEventsBase.length);
    const allEventsBase = (allPoolEventsBase.length === 0 && allRouterEventsBase.length > 0)
        ? [...allRouterEventsBase]
        : (allPoolEventsBase.length > 0 && allRouterEventsBase.length === 0)
            ? [...allPoolEventsBase]
            : [...allPoolEventsBase, ...allRouterEventsBase];

    console.log("lllllllllllaaaaaaaaaaaaaaaaast ",cronosFromBlockMock, cronosFromBlockMock.cronos);
    const allPoolEventsCronos = await getPoolContractTransactionsInCronos(cronosFromBlockMock.cronos);
    const allRouterEventsCronos = await getRouterContractTransactionsInCronos(cronosFromBlockMock.cronos);
    console.log("allPoolEventsCronos.length, allRouterEventsCronos.length ", allPoolEventsCronos, allRouterEventsCronos);
    const allEventsCronos = (allPoolEventsCronos.length === 0 && allRouterEventsCronos.length > 0)
        ? [...allRouterEventsCronos]
        : (allPoolEventsCronos.length > 0 && allRouterEventsCronos.length === 0)
            ? [...allPoolEventsCronos]
            : [...allPoolEventsCronos, ...allRouterEventsCronos];

    const sortedAllEventsBase = await allEventsBase.sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber));

    console.log("here before sorting");
    const sortedAllEventsCronos = await allEventsCronos.sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber));
    console.log("\n\n\nhere after sorting\n\n\n", sortedAllEventsCronos);
    return [sortedAllEventsBase, sortedAllEventsCronos];

    // Function to get transactions made to the contract for specific methods
    async function getPoolContractTransactionsInBase(_from) {
        try {
            // Get past events for specific methods: deposit, borrow, repay
            const depositEvents = await basePoolContract.getPastEvents('Deposit', {
                fromBlock: _from,
                toBlock: 'latest'
            });

            const borrowEvents = await basePoolContract.getPastEvents('Borrow', {
                fromBlock: _from,
                toBlock: 'latest'
            });

            const repayEvents = await basePoolContract.getPastEvents('Repay', {
                fromBlock: _from,
                toBlock: 'latest'
            });

            // Concatenate all events into one array
            const allEvents = [...depositEvents, ...borrowEvents, ...repayEvents];


            // await allEvents.sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber));

            // Log each event
            allEvents.forEach(event => {
                console.log('Transaction Hash:', event.transactionHash);
                console.log('Event:', event.event);
                console.log('Event Data:', event.returnValues);
                console.log('Block Number:', event.blockNumber);
                console.log('-----------------------------------');
            });

            console.log('\n\n\n\n');

            console.log('allEvents ', allEvents.length);

            console.log('\n\n\n\n');

            return allEvents;

        } catch (error) {
            console.error('Error fetching basePoolContract transactions:', error);
        }
    }


    // Function to get transactions made to the contract for specific methods
    async function getRouterContractTransactionsInBase(_from) {

        try {
            // Get past events for specific methods: deposit, borrow, repay
            const addLiquidityEvents = await baseRouterContract.getPastEvents('AddLiquidity', {
                fromBlock: _from,
                toBlock: 'latest'
            });


            // Concatenate all events into one array
            const allEvents = [...addLiquidityEvents];

            console.log('\n\n\n\n');

            console.log('allEvents', allEvents.length);

            console.log('\n\n\n\n');
            // Log each event
            allEvents.forEach(event => {
                console.log('Transaction Hash:', event.transactionHash);
                console.log('Event:', event.event);
                console.log('Event Data:', event.returnValues);
                console.log('Block Number:', event.blockNumber);
                console.log('-----------------------------------');
            });

            console.log('latest block', allEvents.length);

            return allEvents;
        } catch (error) {
            console.error('Error fetching baseRouterContract transactions:', error);
        }
    }

    // Function to get transactions made to the contract for specific methods
    async function getRouterContractTransactionsInCronos(_from) {

        let _to = await web3Cronos.eth.getBlockNumber();

        try {

            _from = Number(_from);

            _to = Number(_to);

            const batchSize = 2000;

            const batches = Math.ceil((_to - _from + 1) / batchSize);

            let allEvents = [];

            console.log("\n\n\n\n\n Cronosssssssss routeerrrrr ", _from, _to);

            for (let i = 0; i < batches; i++) {

                const fromBlock = _from + i * batchSize;

                const toBlock = Math.min(_from + (i + 1) * batchSize - 1, _to);

                console.log("fromBlock ", fromBlock, "toBlock", toBlock);

                const addLiquidityEvents = await cronosRouterContract.getPastEvents('AddLiquidity', {
                    fromBlock: fromBlock,
                    toBlock: toBlock
                });

                // Concatenate events for this batch into the overall events array
                allEvents = allEvents.concat(addLiquidityEvents);

                if (i >= batches) {
                    return allEvents;
                }

            }

            // // Concatenate all events into one array
            // const allEvents = [...addLiquidityEvents];

            console.log('\n\n\n\n');

            console.log('allEvents', allEvents.length);

            console.log('\n\n\n\n');

            // Log each event
            allEvents.forEach(event => {
                console.log('Transaction Hash:', event.transactionHash);
                console.log('Event:', event.event);
                console.log('Event Data:', event.returnValues);
                console.log('Block Number:', event.blockNumber);
                console.log('-----------------------------------');
            });

            console.log('latest block', allEvents.length);

            const filePath = path.resolve(__dirname, '../constants/blocks.json');
            const jsonData = await readJsonFile(filePath);

            if (jsonData.cronos < _to) {
                jsonData.cronos = _to;
                // Write the updated object back to the JSON file
                await writeJsonFile(filePath, jsonData);
                console.log('Latest Block updated successfully.');
            }
            console.log("here checking length ", allEvents.length);

            return allEvents;
        } catch (error) {
            console.error('Error fetching cronosRouterContract transactions:', error);
        }
    }

    async function getPoolContractTransactionsInCronos(_from) {

        let _to = await web3Cronos.eth.getBlockNumber();

        try {

            _from = Number(_from);

            _to = Number(_to);

            const batchSize = 2000;

            const batches = Math.ceil((_to - _from + 1) / batchSize);

            let allEvents = [];

            console.log("\n\n\n\n\n Cronosssssssss poollllllllll ", _from, _to);

            for (let i = 0; i < batches; i++) {

                const fromBlock = _from + i * batchSize;

                const toBlock = Math.min(_from + (i + 1) * batchSize - 1, _to);

                console.log("fromBlock ", fromBlock, "toBlock", toBlock);

                const depositEvents = await cronosPoolContract.getPastEvents('Deposit', {
                    fromBlock: fromBlock,
                    toBlock: toBlock
                });

                const borrowEvents = await cronosPoolContract.getPastEvents('Borrow', {
                    fromBlock: fromBlock,
                    toBlock: toBlock
                });

                const repayEvents = await cronosPoolContract.getPastEvents('Repay', {
                    fromBlock: fromBlock,
                    toBlock: toBlock
                });

                // Concatenate events for this batch into the overall events array
                allEvents = allEvents.concat(depositEvents, borrowEvents, repayEvents);

            }
            console.log("allPoolEvents ", allEvents);
            // Log each event
            allEvents.forEach(event => {
                console.log('Transaction Hash:', event.transactionHash);
                console.log('Event:', event.event);
                console.log('Event Data:', event.returnValues);
                console.log('Block Number:', event.blockNumber);
                console.log('-----------------------------------');
            });

            console.log('\n\n\n\n');

            console.log('allPoolEvents ', allEvents.length);

            console.log('\n\n\n\n');

            const filePath = path.resolve(__dirname, '../constants/blocks.json');
            const jsonData = await readJsonFile(filePath);

            if (jsonData.cronos < _to) {
                jsonData.cronos = _to;
                // Write the updated object back to the JSON file
                await writeJsonFile(filePath, jsonData);
                console.log('Latest Block updated successfully.');
            }
            console.log("here checking length ", allEvents.length);

            return allEvents;

        } catch (error) {
            console.error('Error fetching cronosPoolContract transactions:', error);
        }
    }

    // Function to get block number of a transaction
    async function getTransactionBlockNumber() {
        try {

            //get last rewarded tx
            const baseLatestTx = await getLatestRewardedTxBase();

            const cronosLatestTx = await getLatestRewardedTxCronos();

            console.log("baseLatestTx: ", baseLatestTx, "cronosLatestTx: ", cronosLatestTx);

            if (baseLatestTx != 0 && cronosLatestTx != 18194864) {
                const transactionBase = await web3Base.eth.getTransaction(baseLatestTx);
                const transactionCronos = await web3Base.eth.getTransaction(baseLatestTx);
                if (!transactionBase || !transactionCronos) {
                    console.error('Transaction not found');
                    return;
                }
                const blockNumberBase = transactionBase.blockNumber;
                const blockNumberCronos = transactionCronos.blockNumber;

                return [blockNumberBase, blockNumberCronos];

            }
            else if (baseLatestTx == 0 && cronosLatestTx == 18194864) {
                return [0, 18194864];
            }
            else if (baseLatestTx != 0 && cronosLatestTx == 18194864) {
                // Get transaction details
                const transaction = await web3Base.eth.getTransaction(baseLatestTx);

                // Check if transaction exists
                if (!transaction) {
                    console.error('Transaction not found');
                    return;
                }

                // Get block number
                const blockNumber = transaction.blockNumber;

                // Log block number
                console.log('Block Number:', Number(blockNumber) + 1, blockNumber);

                return [blockNumber, 18194864];
            }
            else if (baseLatestTx == 0 && cronosLatestTx != 18194864) {
                // Get transaction details
                const transaction = await web3Cronos.eth.getTransaction(cronosLatestTx);

                // Check if transaction exists
                if (!transaction) {
                    console.error('Transaction not found');
                    return;
                }

                // Get block number
                const blockNumber = transaction.blockNumber;

                // Log block number
                console.log('Block Number:', Number(blockNumber) + 1, blockNumber);

                return [0, blockNumber];
            }
            else {
                throw Error('failed to get block numbers');
            }

        } catch (error) {
            console.error('Error fetching transaction block number:', error);
        }
    }

    async function getLatestRewardedTxBase() {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT id, tx_id
            FROM transactions
            WHERE id = (
                SELECT MAX(id) AS last_id
                FROM sakhafinance.transactions
                WHERE chainId = 84532
            );`

            pool.query(sqlQuery, (err, result) => {
                if (err) {
                    reject(err);
                }

                console.log("result[0].tx_id", result);

                resolve((result.length == 0) ? 0 : result[0].tx_id);

            });
        });
    }

    async function getLatestRewardedTxCronos() {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT id, tx_id
            FROM transactions
            WHERE id = (
                SELECT MAX(id) AS last_id
                FROM sakhafinance.transactions
                WHERE chainId = 338
            );`

            pool.query(sqlQuery, (err, result) => {
                if (err) {
                    reject(err);
                }

                console.log("result[0].tx_id", result);

                resolve((result.length == 0) ? 18194864 : result[0].tx_id);

            });
        });
    }

}
