const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const ChainID = network.config.chainId
    let ethUsdPriceFeedAddress
    if (ChainID == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[ChainID]["ethUsdPriceFeed"]
    }
    const fundME = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
    })
    if (!developmentChains.includes(network.name) && process.env.API_KEY) {
        await verify(fundME.address, [ethUsdPriceFeedAddress])
    }
}
module.exports.tags = ["all", "fund"]
