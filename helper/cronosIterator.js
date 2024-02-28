module.exports.iterateCronosRouter = async function (_from, _to, cronosRouterContract) {

    _from = Number(_from);

    _to = Number(_to);

    const batchSize = 2000;

    const batches = Math.ceil((_to - _from + 1) / batchSize);

    let allEvents = [];

    for (let i = 0; i < batches; i++) {

        const fromBlock = _from + i * batchSize;

        const toBlock = Math.min(_from + (i + 1) * batchSize - 1, _to);

        console.log("fromBlock ", fromBlock, "toBlock", toBlock);

        const addLiquidityEvents = await cronosRouterContract.getPastEvents('AddLiquidity', {
            fromBlock: fromBlock,
            toBlock: toBlock
        });

        console.log(addLiquidityEvents);

        // Concatenate events for this batch into the overall events array
        allEvents = allEvents.concat(addLiquidityEvents);

    }

    return allEvents;
}

module.exports.iterateCronosPool = async function (_from, _to, cronosPoolContract) {

    _from = Number(_from);

    _to = Number(_to);

    const batchSize = 2000;

    const batches = Math.ceil((_to - _from + 1) / batchSize);

    let allEvents = [];

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

        console.log(allEvents);

        console.log("i == batches ", i == batches);

        console.log("allEvents.length ", allEvents.length);

    }
    
    return allEvents;
}