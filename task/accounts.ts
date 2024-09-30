import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types"
import chalk from "chalk"
import Table from "cli-table3"
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

task('createPrivateKey', 'create private key')
    .addOptionalPositionalParam('amount')
    .setAction(async (taskArgs: { amount: number }, env: HardhatRuntimeEnvironment) => {
        const amount = taskArgs?.amount ?? 1
        for (let index = 0; index < amount; index++) {
            const account = env.ethers.Wallet.createRandom()
            console.log(account.address, account.privateKey)
        }
    })


task("createMnemonic", "Create a mnemonic phrase and display the first 10 or(more) addresses")
    .addOptionalPositionalParam('customAmount', 'Custom quantity')
    .setAction(async (taskArgs, hre) => {
        const { customAmount } = taskArgs
        const showAmount = Number(customAmount ?? '1')
        const ethers = hre.ethers
        const randomWallet = ethers.Wallet.createRandom()
        const phrase = randomWallet.mnemonic?.phrase
        if (!phrase) {
            throw new Error(`phrase invalid`)
        }
        console.log(`----------------------------------- mnemonic -----------------------------------`)
        console.log(`${phrase}`)
        console.log(`--------------------------------------------------------------------------------`)
        // BIP44 (m / purpose' / coin_type' / account' / change / address_index)
        // default: m/44'/60'/0'/0/0
        const basePath = randomWallet?.path ?? "m/44'/60'/0'/0/"
        for (let index = 0; index < showAmount; index++) {
            const nextPath = `${basePath}${index}`
            const wallet = ethers.HDNodeWallet.fromPhrase(phrase, undefined, nextPath)
            console.log(wallet.address, wallet.privateKey)
        }
    });

task("showMnemonicAddress", "show mnemonic address, the first 10 are displayed by default")
    .addOptionalPositionalParam('mnemonic', 'mnemonic (length: 12)')
    .addOptionalPositionalParam('addressAmount', 'show address amount')
    .setAction(async (taskArgs, hre) => {
        const { mnemonic, addressAmount } = taskArgs
        const showAmount = Number(addressAmount ?? '10')
        const ethers = hre.ethers
        const randomWallet = ethers.Wallet.createRandom()
        const phrase = String(mnemonic).trim()
        if (!phrase) {
            throw new Error(`phrase invalid`)
        }
        console.log(`----------------------------------- mnemonic -----------------------------------`)
        console.log(`${phrase}`)
        console.log(`--------------------------------------------------------------------------------`)
        // BIP44 (m / purpose' / coin_type' / account' / change / address_index)
        // default: m/44'/60'/0'/0/0
        const basePath = "m/44'/60'/0'/0/"
        for (let index = 0; index < showAmount; index++) {
            const nextPath = `${basePath}${index}`
            const wallet = ethers.HDNodeWallet.fromPhrase(phrase, undefined, nextPath)
            console.log(wallet.address, wallet.privateKey)
        }
    });



task('accounts', 'Output list of available accounts')
    .setAction(async function (args, hre: HardhatRuntimeEnvironment) {
        const { provider } = hre.network;
        const { ethers } = hre

        const accounts = await ethers.getSigners();
        const balances: bigint[] = await Promise.all(accounts.map(
            account => ethers.provider.getBalance(account.address)
        ));

        const chainId = await provider.send('eth_chainId');
        const blockNumber = await provider.send('eth_blockNumber');
        const { timestamp } = await provider.send('eth_getBlockByNumber', [blockNumber, false]);

        const padding = 2;

        const table = new Table({
            // set width of first column dynamically
            colWidths: [padding * 2 + accounts.length.toString().length],
            style: { head: [], border: [], 'padding-left': padding, 'padding-right': padding },
            chars: {
                mid: '·',
                'top-mid': '|',
                'left-mid': ' ·',
                'mid-mid': '|',
                'right-mid': '·',
                left: ' |',
                'top-left': ' ·',
                'top-right': '·',
                'bottom-left': ' ·',
                'bottom-right': '·',
                middle: '·',
                top: '-',
                bottom: '-',
                'bottom-mid': '|',
            },
        }) as any;

        table.push([
            {
                hAlign: 'center',
                colSpan: 2,
                content: chalk.gray(`Network: ${hre.network.name}`),
            },
            {
                hAlign: 'center',
                content: chalk.gray(`Chain ID: ${parseInt(chainId)}`),
            },
            {
                hAlign: 'center',
                content: chalk.gray(`Block Number: ${parseInt(blockNumber)}`)
            },
            {
                hAlign: 'center',
                content: chalk.gray(`Timestamp: ${parseInt(timestamp)}`)
            }
        ]);

        table.push([
            {
                colSpan: 4,
                content: chalk.bold('Account'),
            },
            {
                content: chalk.bold('Native Balance (Ether)'),
            }
        ]);

        const formatAccount = (account: SignerWithAddress) => {
            // if ethers library is present, checksum address
            // if not, who cares?
            return account.address;
        }

        const formatBalance = (balance: bigint) => {
            const decimals = 18;

            // const padded = BigInt(balance).toString().padStart(decimals, '0');
            const padded = balance == 0n ? '0' : ethers.formatEther(balance);

            let integer = padded.slice(0, padded.length - decimals);
            let decimal = padded.slice(padded.length - decimals);

            if (integer.length == 0) {
                decimal = decimal.replace(/^(0*)(?=.)/, '');
            }

            return `${(integer)}${chalk.gray(decimal)}`;
        }

        for (let i = 0; i < accounts.length; i++) {
            table.push([
                {
                    hAlign: 'right',
                    content: chalk.gray(i.toString()),
                },
                {
                    colSpan: 3,
                    content: formatAccount(accounts[i]),
                },
                {
                    hAlign: 'right',
                    content: formatBalance(balances[i]),
                },
            ]);
        }

        console.log(table.toString());
    });
