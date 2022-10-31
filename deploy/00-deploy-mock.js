const { network } = require("hardhat")
const DECIMAL = 8
const INITIAL_ANSWER = 200000000
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const ChainID = network.config.chainId

    await deploy("MockV3Aggregator", {
        from: deployer,
        log: true,
        args: [DECIMAL, INITIAL_ANSWER],
    })
}

module.exports.tags = ["all", "mock"]
