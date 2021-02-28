
// open performs the following sequence of transactions:
// 1. Create account if none is already created
// 2. Deposits collateral from the users account and initializes obligation
// 3. Takes out a loan on margin and transfers the loan into the margin account as
//    a new position
// 4. Uses the swap mechanism to buy currency of the same denomination as the collateral.
//    The funds are then locked back in the margin account
export const open = async () => {

}

// close performs the following sequence of transactions:
// 1. Calculate the total repayment sum in the underlying loan currency and use the swap
//    mechanism to transfer part or all of the position into a loan repayment sum
// 2. Repays the loan
// 3. If there are funds still leftover in the obligation account it flushed this back to the
//    margin account
// 4. Finally withdraws any profit back to the users wallet
export const close = async () => {

}

