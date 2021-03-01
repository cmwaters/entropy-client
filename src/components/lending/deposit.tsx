import React, { useMemo, useState } from "react";
import { Button, Card, Dropdown, Popover, Radio, Row } from "antd";
import "./deposit.less";
import { useLendingReserves } from "../../contexts/lending";
import { LoadingOutlined } from "@ant-design/icons";
import { LendingReserve, calculateUtilizationRatio, calculateBorrowAPY } from "../../models/lending";
import { TokenIcon } from "../../components/tokenIcon";
import { PublicKey } from "@solana/web3.js"
import { useConnectionConfig } from "../../contexts/connection"
import { useUserBalance } from "../../contexts/accounts"
import { Link } from "react-router-dom";
import { getTokenName, formatNumber, formatPct } from "../../utils/utils"

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

// was previously add.tsx
export const DepositReserve = () => {
  const { reserveAccounts } = useLendingReserves();
  return (
    <div className="flexColumn">
      <Card>
        <div className="deposit-item deposit-header">
          <div>Asset</div>
          <div>Your wallet balance</div>
          <div>Your balance in Oyster</div>
          <div>APY</div>
          <div></div>
        </div>
        {reserveAccounts.map((account) => (
          <ReserveItem
            key={account.pubkey.toBase58()}
            reserve={account.info}
            address={account.pubkey}
          />
        ))}
      </Card>
    </div>
  );
};

export const ReserveItem = (props: {
  reserve: LendingReserve;
  address: PublicKey;
}) => {
  const name = useTokenName(props.reserve.liquidityMint);
  const {
    balance: tokenBalance,
    balanceInUSD: tokenBalanceInUSD,
  } = useUserBalance(props.reserve.liquidityMint);

  const apy = calculateDepositAPY(props.reserve);

  return (
    <Link to={`/lend/deposit/${name}`}>
      <div className="deposit-item">
        <span style={{ display: "flex" }}>
          <TokenIcon mintAddress={props.reserve.liquidityMint} />
          {name}
        </span>
        <div>
          <div>
            <div>
              <em>{formatNumber.format(tokenBalance)}</em> {name}
            </div>
            <div className="dashboard-amount-quote">
              ${formatNumber.format(tokenBalanceInUSD)}
            </div>
          </div>
        </div>
        <div>{formatPct.format(apy)}</div>
        <div>
          <Button type="primary">
            <span>Hello World</span>
          </Button>
        </div>
      </div>
    </Link>
  );
};

export const calculateDepositAPY = (reserve: LendingReserve) => {
  const currentUtilization = calculateUtilizationRatio(reserve);

  const borrowAPY = calculateBorrowAPY(reserve);
  return currentUtilization * borrowAPY;
};

export function useTokenName(mintAddress?: string | PublicKey) {
  const { tokenMap } = useConnectionConfig();
  const address =
    typeof mintAddress === "string" ? mintAddress : mintAddress?.toBase58();
  return getTokenName(tokenMap, address);
}

