const { assert, expect } = require("chai")
const { deployments, ethers } = require("hardhat")

describe("Testing FundMe Contract", async function () {
    let deployer
    let fundme
    let mockV3aggregator
    const sendValue = ethers.utils.parseEther("1.5")
    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundme = await ethers.getContract("FundMe", deployer)
        mockV3aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    describe("Constructor", () => {
        it("comparing pricefeed", async () => {
            const response = await fundme.priceFeed()
            assert.equal(response, mockV3aggregator.address)
        })
    })
    describe("fund", async () => {
        it("entering fund without balance", async () => {
            await expect(fundme.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
        it("adding funder to array of funders", async () => {
            await fundme.fund({ value: sendValue })
            const response = await fundme.funders(0)
            assert.equal(deployer, response)
        })
    })
    describe("withdraw", async () => {
        beforeEach(async () => {
            await fundme.fund({ value: sendValue })
        })

        it("verifying the balance on both sides after withdrawal", async () => {
            const startingFundBalance = await fundme.provider.getBalance(
                fundme.address
            )
            const startingDeployerBalance = await fundme.provider.getBalance(
                deployer
            )
            const transaction = await fundme.withdraw()
            const transactionReceipt = await transaction.wait()
            const { effectiveGasPrice, gasUsed } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundBalance = await fundme.provider.getBalance(
                fundme.address
            )
            const endDeployerBalance = await fundme.provider.getBalance(
                deployer
            )
            assert.equal(endingFundBalance, 0)
            assert.equal(
                endDeployerBalance.add(gasCost).toString(),
                startingDeployerBalance.add(startingFundBalance).toString()
            )
        })
        it("only owner should withdraw", async () => {
            const account = await ethers.getSigners()
            const fundmeconnectedcontract = await fundme.connect(account[1])
            await expect(fundmeconnectedcontract.withdraw()).to.be.revertedWith(
                "NotOwner"
            )
        })
    })
})
