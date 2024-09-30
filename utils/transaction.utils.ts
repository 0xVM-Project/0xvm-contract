import { ContractTransactionResponse } from "ethers";

export async function getTransactionFees(transaction: ContractTransactionResponse) {
    const tx = await transaction.wait()
    if (!tx) return 0n
    const { cumulativeGasUsed, gasPrice } = tx
    return cumulativeGasUsed * gasPrice
}