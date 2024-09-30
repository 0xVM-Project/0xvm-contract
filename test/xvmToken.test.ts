import {
    time,
    loadFixture
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { MockXvmTokenV2__factory, MockXvmTokenV3__factory, XvmToken, XvmToken__factory } from "../typechain-types";
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

describe('XvmToken Contract', () => {
    let xvmToken: XvmToken
    const initTotalSupply = ethers.parseEther('10000000000')
    let [owner, bob, joy, cc]: HardhatEthersSigner[] = []

    async function deployContractFixture() {
        const [owner] = await ethers.getSigners()
        const logic = await ethers.deployContract('XvmToken')
        const logicAddress = await logic.getAddress()
        const data = logic.interface.encodeFunctionData('initialize', ['Xtest Token', 'XTT', initTotalSupply])
        const proxyContract = await ethers.deployContract('UUPSProxy', [logicAddress, data])
        const proxyAddress = await proxyContract.getAddress()
        xvmToken = XvmToken__factory.connect(proxyAddress, proxyContract.runner)
        return { xvmToken }
    }

    before(async () => {
        [owner, bob, joy, cc] = await ethers.getSigners()
        console.log(`before`)
    })

    beforeEach(async () => {
        const fixture = await loadFixture(deployContractFixture)
        xvmToken = fixture.xvmToken
    })

    describe('Proxy Upgrade', () => {
        it('The data is correct after the upgrade', async () => {
            const v2Logic = await ethers.deployContract("MockXvmTokenV2")
            await xvmToken.transfer(bob.address, 1000)
            await xvmToken.upgradeToAndCall(await v2Logic.getAddress(), '0x')
            let newProxy = MockXvmTokenV2__factory.connect(await xvmToken.getAddress(), owner)
            expect(await newProxy.ver()).to.equal('v0.2.0')
            expect(await xvmToken.totalSupply()).to.equal(initTotalSupply)
            await xvmToken.transfer(joy.address, 2000)
            expect(await xvmToken.balanceOf(owner.address)).to.equal(initTotalSupply - 1000n - 2000n)
            expect(await xvmToken.balanceOf(bob.address)).to.equal(1000)
            expect(await xvmToken.balanceOf(joy.address)).to.equal(2000)
        })

        it('Only initialize once', async () => {
            await expect(xvmToken.initialize('New Token', 'NT', 900)).to.rejectedWith(`InvalidInitialization()`)
            await expect(xvmToken.connect(bob).initialize('New Token', 'NT', 900)).to.rejectedWith(`InvalidInitialization()`)
            expect(await xvmToken.symbol()).to.equal('XTT')
            expect(await xvmToken.balanceOf(bob.address)).to.equal(0)
            expect(await xvmToken.owner()).to.equal(owner.address)
        })

        it('Only administrators can upgrade', async () => {
            const v2Logic = await ethers.deployContract("MockXvmTokenV2")
            await expect(xvmToken.connect(bob).upgradeToAndCall(await v2Logic.getAddress(), '0x')).to.rejectedWith(`OwnableUnauthorizedAccount("${bob.address}")`)
            let newProxy = MockXvmTokenV2__factory.connect(await xvmToken.getAddress(), owner)
            await expect(newProxy.ver()).to.rejectedWith(`function selector was not recognized and there's no fallback function`)
            expect(await xvmToken.totalSupply()).to.equal(initTotalSupply)
        })

        it('Multiple upgrades', async () => {
            // v2
            const v2Logic = await ethers.deployContract("MockXvmTokenV2")
            await xvmToken.upgradeToAndCall(await v2Logic.getAddress(), '0x')
            let newProxy = MockXvmTokenV2__factory.connect(await xvmToken.getAddress(), owner)
            await newProxy.addUpgradeCount()
            expect(await newProxy.ver()).to.equal('v0.2.0')
            expect(await xvmToken.totalSupply()).to.equal(initTotalSupply)
            expect(await newProxy.upgradeCount()).to.equal(1)
            // v3
            const v3Logic = await ethers.deployContract("MockXvmTokenV3")
            await xvmToken.upgradeToAndCall(await v3Logic.getAddress(), '0x')
            newProxy = MockXvmTokenV3__factory.connect(await newProxy.getAddress(), owner)
            await newProxy.addUpgradeCount()
            expect(await newProxy.ver()).to.equal('v0.3.0')
            expect(await xvmToken.totalSupply()).to.equal(initTotalSupply)
            expect(await newProxy.upgradeCount()).to.equal(2)
        })
    })

    describe('XVM Token Contract', () => {
        it('token info', async () => {
            const namme = await xvmToken.name()
            const symbol = await xvmToken.symbol()
            const decimal = await xvmToken.decimals()
            expect(namme).to.equal('Xtest Token')
            expect(symbol).to.equal('XTT')
            expect(decimal).to.equal(18)
        })

        it('transfer', async () => {
            expect(await xvmToken.balanceOf(owner.address)).to.equal(initTotalSupply)
            expect(await xvmToken.balanceOf(bob.address)).to.equal(0)
            await xvmToken.transfer(bob.address, ethers.parseEther('99'))
            expect(await xvmToken.balanceOf(bob.address)).to.equal(ethers.parseEther('99'))
            expect(await xvmToken.balanceOf(owner.address)).to.equal(initTotalSupply - ethers.parseEther('99'))
            expect(await xvmToken.totalSupply()).to.equal(initTotalSupply)
        })

        it('transferFrom', async () => {
            expect(await xvmToken.balanceOf(bob.address)).to.equal(0)
            await expect(xvmToken.connect(bob).transferFrom(owner.address, bob.address, 900)).to.rejectedWith(`ERC20InsufficientAllowance("${bob.address}", 0, 900)`)
            expect(await xvmToken.balanceOf(owner.address)).to.equal(initTotalSupply)
            expect(await xvmToken.balanceOf(bob.address)).to.equal(0)
            await xvmToken.approve(bob.address, 99)
            expect(await xvmToken.allowance(owner.address, bob.address)).to.equal(99)
            await expect(xvmToken.connect(bob).transferFrom(owner.address, bob.address, 100)).to.rejectedWith(`ERC20InsufficientAllowance("${bob.address}", 99, 100)`)
            expect(await xvmToken.balanceOf(owner.address)).to.equal(initTotalSupply)
            await xvmToken.connect(bob).transferFrom(owner.address, bob.address, 99)
            expect(await xvmToken.balanceOf(owner.address)).to.equal(initTotalSupply - 99n)
            expect(await xvmToken.balanceOf(bob.address)).to.equal(99)
            expect(await xvmToken.allowance(owner.address, bob.address)).to.equal(0)
        })
    })
})