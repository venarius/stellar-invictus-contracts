const { Sequelize, DataTypes, Op } = require('sequelize');
const moment = require('moment');
const Web3 = require('web3')
const TOKEN_ABI = require('./abi/tryon.json')

const IS_TESTNET = true

const PROVIDER_URL = IS_TESTNET ? 'https://data-seed-prebsc-1-s1.binance.org:8545/' : 'https://bsc-dataseed.binance.org/'
const CONTRACT_ADDRESS = IS_TESTNET ? '0xb32E710a1E507Ed4f9a01D76700027A2a493D9Fd' : '0x050f65BEf6bd15De57462cf75d06BafEB2A59118'

const client = new Web3(PROVIDER_URL)
client.eth.accounts.wallet.add(process.env.KEY)

async function run() {
  const sequelize = new Sequelize(process.env.DATABASE_URL)

  const TryonDestructionLog = sequelize.define('TryonDestructionLog', {
    amount: {
      type: DataTypes.FLOAT
    },
    date: {
      type: DataTypes.DATE
    }
  }, {})

  const logs = await TryonDestructionLog.findAll({
    where: {
      date: {
        [Op.gte]: moment().subtract(1, 'months').toDate()
      }
    }
  })

  const amountToBurn = logs.reduce((a, b) => a + b.amount, 0)

  const contract = new client.eth.Contract(TOKEN_ABI, CONTRACT_ADDRESS)
  contract.methods.burn(client.utils.toHex(client.utils.toWei((Math.round(amountToBurn * 1000000) / 1000000).toString(), 'ether'))).send({ from: process.env.SENDER, gasPrice: '20000000000', gas: '2000000' })
}

run()
