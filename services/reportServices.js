const {
    Alchemy,
    Network
} = require('alchemy-sdk');
const {
    createClient
} = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

let count_of_data_entry = 0;

const getTransactions = async () => {
    try {

        const config = {
            apiKey: process.env.ALCHEMY_API_KEY,
            network: Network.ETH_MAINNET,
        };
        const alchemy = new Alchemy(config);

        // Address we want get NFT mints from
        const toAddress = process.env.TO_ADDRESS;

        const res = await alchemy.core.getAssetTransfers({
            toAddress: toAddress,
            excludeZeroValue: true,
            category: ["external", "internal", "erc20", "erc721", "erc1155", "specialnft"],
            order: "desc"
        });

        let result = []
        for (data of res.transfers) {
            const stored_data = await supabase
            .from('transaction')
            .select()
            .eq('transactionHash',data.hash)
            if(stored_data.data.length!=0) continue;
            result.push(await getTransactionByHash(data));
        }
        // get data
        return await get_data_from_table();

    } catch (e) {
        console.error(e);
    }
}

const getTransactionByHash = async (data) => {
    const settings = {
        apiKey: process.env.ALCHEMY_API_KEY,
        network: Network.ETH_MAINNET,
    };
    const alchemy = new Alchemy(settings);
    let res = await alchemy.core
        .getTransaction(
            data.hash
        )

    // add inside postgres
    await insertInDb(res, data.rawContract.address)
    count_of_data_entry++;
    console.log(count_of_data_entry); 
    return res;
}

const insertInDb = async (transaction, address) => {
    try {

        let {
            data,
            error
        } = await supabase.from('transaction').insert([{
            // "id": 1,
            "transactionHash": transaction.hash,
            "value": transaction.value._hex,
            "blockNum": transaction.blockNumber,
            "from": transaction.from,
            "address": address
        }])
        if (error) {
            console.error('Error inserting data:', error.message);
            return;
        }
    } catch (error) {
        console.log(error);
    }
}

const get_data_from_table = async () => {
    const table_result = await supabase
        .from('transaction')
        .select(`*`)

    let largest_val = 0;
    let largets_hash = ''
    const hashCounts = new Map();
    for (trans of table_result.data) {
        let num = await covert_hex(trans.value)
        if (num > largest_val){
            largest_val = num
            largets_hash = trans.transactionHash
        } 

        if (hashCounts.has(trans.from)) {
            hashCounts.set(trans.from, hashCounts.get(trans.from) + 1);
        } else {
            hashCounts.set(trans.from, 1);
        }
    }

    return {
        "max_value_txn_hash": largets_hash,
        "max_txns_with_address": await findMaxTransactionCount(hashCounts),
        "date_max_txns": "DATE-ON-WHICH-MAX-TRANSACTIONS-HAVE-BEEN-DONE",
    }
}

const findMaxTransactionCount = async (hashCounts) => {
    let maxCount = 0;
    let maxKey = null;

    // Iterate through the map to find the maximum count
    hashCounts.forEach((count,key) => {
        if (count > maxCount) {
            maxCount = count;
            maxKey = key;
        }
    });

    return maxKey;
}

const covert_hex = async (value) => {
    return parseInt(value, 16)
}

module.exports = {
    getTransactions
}