Translated, your task description for implementing an ERC721 token project would be:

---

# ERC721 Token Implementation Task

## Overview

This project involves the implementation of an ERC721 token with specific functionalities. There are two distinct minting functions, along with certain constraints on token minting and ownership.

### Functions

- `payableMint`: A payable function directly callable by users to mint tokens. The cost per token should be defined.

- `signedMint`: A non-`payable` minting function also callable by users. However, this function requires a signature from a backend service to authorize the minting. It is crucial to ensure that each signature can only be used once to prevent duplicate mints.

- `mintSet`: A payable function that allows users to mint a set of six tokens at once. The price for minting a set differs from individual token minting. This function must emit an event that the backend can use to identify the IDs of the tokens comprising the set. Each address can mint only one set.

### Constraints

- Token Supply Limit: The total supply of tokens is capped at 1,000.
  
- Minting Limit: Users can mint a maximum of three tokens in a single transaction.

- No Burn Functionality: Tokens cannot be burned once minted.


---

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
```
