import { ethers, network, config } from "hardhat";

export async function scriptsHook(callback: () => Promise<void>) {
    const [owner] = await ethers.getSigners()
    let balance: bigint = 0n
    let balanceDeployAfter: bigint = 0n
    try {
        balance = await ethers.provider.getBalance(owner.address)
        balanceDeployAfter = balance
        const feeData = await ethers.provider.getFeeData()
        const gasPrice = feeData.gasPrice
        if (!gasPrice) {
            throw new Error(`get gasPrice fail.`)
        }
        console.log(`Network Name: ${network.name}`)
        console.log(`Chain ID: ${network.config.chainId}`)
        console.log(`Gas Price: ${ethers.formatUnits(gasPrice, 'gwei')} Gwei`)
        console.log(`Owner Address: ${owner.address}`)
        console.log(`Owner Balance: ${ethers.formatEther(balance)}`)
        console.log(`-------------------------------------------------------------------------------`)
        await callback()
        balanceDeployAfter = await ethers.provider.getBalance(owner.address)
        console.log(`-------------------------------------------------------------------------------`)
        console.log(`Script Cost GAS: ${ethers.formatEther(balance - balanceDeployAfter)}`)
        console.log(`Script end`)
    } catch (error) {
        console.error(error)
        console.log(`-------------------------------------------------------------------------------`)
        balanceDeployAfter = await ethers.provider.getBalance(owner.address)
        console.log(`Script fail`)
        console.log(`Script Cost GAS: ${ethers.formatEther(balance - balanceDeployAfter)}`)
    }
}