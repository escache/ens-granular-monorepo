# Transaction Logging

This document explains how to capture and view chain transactions from test executions.

## Where Transaction Data is Stored

Transaction logs are saved to: **`reports/test-results/`**

After running tests, you'll find:
- `transactions-{timestamp}.json` - Full transaction data in JSON format
- `transactions-{timestamp}.csv` - Transaction data in CSV format for easy viewing

## Current Status

The test suite now includes automatic transaction logging. When you run tests, all transactions are automatically captured and saved.

## Running Tests with Transaction Logging

### Basic Test Run
```bash
npm test
```

Transactions are automatically logged to `reports/test-results/`

### View Transaction Logs

After running tests, check the reports directory:

```bash
ls -lh reports/test-results/transactions-*.json
```

### View Latest Transactions

```bash
# View latest JSON file
cat reports/test-results/transactions-*.json | tail -1

# View as CSV in spreadsheet
open reports/test-results/transactions-*.csv
```

## Transaction Data Captured

Each transaction log includes:

- **hash** - Transaction hash
- **from** - Sender address
- **to** - Recipient address
- **value** - ETH value transferred
- **gasLimit** - Gas limit set
- **gasUsed** - Actual gas used
- **status** - "success" or "failed"
- **blockNumber** - Block number
- **blockHash** - Block hash
- **transactionIndex** - Transaction index in block
- **timestamp** - When transaction was executed
- **function** - Contract function called (if available)
- **test** - Test name that generated the transaction (if available)

## Example Transaction Log

```json
{
  "generated": "2025-11-01T02:00:00.000Z",
  "totalTransactions": 150,
  "totalGasUsed": "12500000",
  "transactions": [
    {
      "hash": "0x1234...",
      "from": "0xabc...",
      "to": "0xdef...",
      "value": "0",
      "gasLimit": "100000",
      "gasUsed": "85432",
      "status": "success",
      "blockNumber": "12345",
      "function": "addDelegate",
      "test": "Should complete full delegation workflow",
      "timestamp": "2025-11-01T02:00:00.000Z"
    }
  ]
}
```

## Gas Reporting

For detailed gas analysis, use the gas reporter:

```bash
npm run gas-report
```

This generates a gas usage report showing gas costs for each function.

## Viewing Transactions

### JSON Format
```bash
cat reports/test-results/transactions-*.json | jq '.transactions[0]'
```

### CSV Format
Open in Excel, Google Sheets, or any CSV viewer:
```bash
open reports/test-results/transactions-*.csv
```

### Filter Transactions
```bash
# Find all addDelegate transactions
cat reports/test-results/transactions-*.json | jq '.transactions[] | select(.function == "addDelegate")'

# Find failed transactions
cat reports/test-results/transactions-*.json | jq '.transactions[] | select(.status == "failed")'

# Calculate total gas used
cat reports/test-results/transactions-*.json | jq '.totalGasUsed'
```

## Integration with Fork Testing

When running tests with mainnet fork (`npm run test:fork`), transactions are still logged, but note:

- Transactions execute on the forked network
- Transaction hashes are unique to the fork
- Gas costs reflect current mainnet gas prices

## Transaction Logger API

The transaction logger is available in tests:

```javascript
const txLogger = require("./TransactionLogger");

// Log a transaction
const tx = await contract.function();
const receipt = await tx.wait();
await txLogger.logTransaction(tx, receipt, {
  function: "functionName",
  test: "Test Name"
});

// Get summary
const summary = txLogger.getSummary();
console.log(`Total transactions: ${summary.total}`);
console.log(`Total gas: ${summary.totalGas}`);

// Save all transactions
await txLogger.save();
```

## Troubleshooting

### No Transaction Files Created

If no transaction files are created:
1. Ensure tests actually execute transactions (not just view calls)
2. Check that `reports/test-results/` directory exists
3. Verify test completes successfully (transactions saved in `after` hook)

### Missing Transaction Data

If some transactions are missing:
- Only transactions explicitly logged with `txLogger.logTransaction()` are captured
- View calls (read-only) don't generate transactions
- Reverted transactions are still logged (status: "failed")

## Future Enhancements

Potential improvements:
- Automatic transaction logging for all contract calls
- Integration with block explorers for transaction links
- Gas optimization suggestions based on transaction data
- Transaction replay capability




