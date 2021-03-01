import { Button, Card, Popover, Spin, Typography } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import {
  useConnection,
  useConnectionConfig,
  useSlippageConfig,
} from "../../contexts/connection";
import { useWallet } from "../../utils/wallet";
import { CurrencyInput } from "../currencyInput";
import { LoadingOutlined } from "@ant-design/icons";
import {
  swap,
  usePoolForBasket,
  PoolOperation,
  LIQUIDITY_PROVIDER_FEE,
} from "../../utils/pools";
import { notify } from "../../utils/notifications";
import { generateActionLabel, POOL_NOT_AVAILABLE, SWAP_LABEL } from "../labels";
import "./close.less";
import { colorWarning, getTokenName } from "../../utils/utils";
import { AdressesPopover } from "../pool/address";
import { close, getMarginPositions } from "../../utils/margin"
import { useMarkets } from "../../contexts/market"
import { TokenIcon } from "../tokenIcon"
import { CaretUpOutlined } from "@ant-design/icons";

const { Text } = Typography;

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

// was previously trade.tsx
export const ClosePosition = () => {
  const { wallet, connected } = useWallet();
  const positions = getMarginPositions()
  const { midPriceInUSD, marketByMint } = useMarkets()

  let mint = "So11111111111111111111111111111111111111112"
  let market = marketByMint.get(mint)
  // alert(mint)

  const handleClosePosition = () => {
    // This needs to be implemented when we close a position
    close()
  }

  return (
    <>
      <div className="input-card">
        <p>Current Positions:</p>
        <MarginPositionDisplay
          amount={400}
          name="SOL"
          mintAddress={mint}
          diff="0.45%"
          loan={3003.15}
        />
      </div>
    </>
  );
};


// NOTE: This is all hard coded. We need to set up a provider to keep track of the margin positions that a user holds
export const MarginPositionDisplay = (props: { 
  mintAddress: string
  name: string
  amount: number
  diff: string
  loan: number
}) => {
  return (
    <Card style={{borderRadius: "10px", width: "100%"}}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="margin-box">
          <div className="margin-title">
            Amount
          </div>
          <span style={{marginRight: "10px"}}>{props.amount}</span>
          <TokenIcon mintAddress={props.mintAddress} />
          {props.name}
        </div>
        <div className="margin-box">
          <div className="margin-title">
            Change
          </div>
          <div style={{color:"green"}}>
            <span style={{ marginRight: "10px" }}>{props.diff}</span>
            <CaretUpOutlined />
          </div>
        </div>
        <Button style={{ marginLeft: "80px" }}>
          Close
        </Button>
      </div>
      
    </Card>
  )
}