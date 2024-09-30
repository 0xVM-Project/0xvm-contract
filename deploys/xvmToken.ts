import { ethers, network } from "hardhat"
import { deployHook } from "../utils/deployHook"
import { XvmToken__factory } from "../typechain-types"

deployHook(async () => {
    const name = '0xVM Token'
    const symbol = 'XVM'
    const initTotalSupply = ethers.parseEther('1000000000')
    const logic = await ethers.deployContract('XvmToken')
    const logicAddress = await logic.getAddress()
    const data = logic.interface.encodeFunctionData('initialize', [name, symbol, initTotalSupply])
    const proxy = await ethers.deployContract('UUPSProxy', [logicAddress, data])
    const proxyAddress = await proxy.getAddress()
    const proxyContract = XvmToken__factory.connect(proxyAddress, proxy.runner)
    const decimals = await proxyContract.decimals()
    const totalSupply = await proxyContract.totalSupply()
    console.log(`Contract Info:`)
    console.log(JSON.stringify({
        name: await proxyContract.name(),
        symbol: await proxyContract.symbol(),
        supply: ethers.formatUnits(totalSupply.toString(), decimals)
    }, null, 2))
    console.log(`logic Contract XvmToken is ${logicAddress}`)
    console.log(`proxy Contract XvmToken is ${proxyAddress}`)
})