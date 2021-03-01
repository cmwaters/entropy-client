import React, { useMemo, useState } from "react";
import {
  addLiquidity,
  usePoolForBasket,
  PoolOperation,
} from "../../utils/pools";
import { Button, Card, Col, Dropdown, Popover, Radio, Row } from "antd";
import { useWallet } from "../../utils/wallet";
import {
  useConnection,
  useConnectionConfig,
  useSlippageConfig,
} from "../../context/connection";
import { Spin, Select } from "antd";
import { notify } from "../../utils/notifications";
import { SupplyOverview } from "../pool/supplyOverview";
import { CurrencyInput, TokenDisplay } from "../currencyInput";
import { PoolConfigCard } from "../pool/config";
import "./deposit.less";
import { CurveType, PoolInfo, TokenSwapLayout } from "../../models";
import { CurrencyContextState, useCurrencyPairState } from "../../context/currencyPair";
import {
  CREATE_POOL_LABEL,
  ADD_LIQUIDITY_LABEL,
  generateActionLabel,
  generateOpenPositionLabel,
  generateExactOneLabel,
  OPEN_POSITION_LABEL,
} from "../labels";
import { AdressesPopover } from "../pool/address";
import { formatPriceNumber, getPoolName } from "../../utils/utils";
import { useMint, useUserAccounts } from "../../context/accounts";
import { useEnrichedPools } from "../../context/market";
import { PoolIcon } from "../tokenIcon";
import { AppBar } from "../appBar";
import { Settings } from "../settings";
import { programIds } from "../../utils/ids";
import { open } from '../../utils/margin'
import {
  LoadingOutlined,
  SwapOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { UnderlyingTokenInput } from '../underlyingToken'

const { Option } = Select

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

// was previously add.tsx
export const DepositReserve = () => {
  const { wallet, connected } = useWallet();
  const connection = useConnection();
  const [pendingTx, setPendingTx] = useState(false);
  const {
    A,
    B,
    setLastTypedAccount,
    setPoolOperation,
    options,
    setOptions,
  } = useCurrencyPairState();
  const [depositToken, setDepositToken] = useState<string>(A.mintAddress);
  const pool = usePoolForBasket([A?.mintAddress, B?.mintAddress]);
  const { slippage } = useSlippageConfig();
  const { tokenMap } = useConnectionConfig();
  const isLatestLayout = programIds().swapLayout === TokenSwapLayout;
  const [ leverageRatio, setLeverageRatio ] = useState(1)

  // executes position on margin
  const executeAction = !connected
    ? wallet.connect
    : async (instance?: PoolInfo) => {
        // const currentDepositToken = getDepositToken();

        // perform transactions to open position
        open()
    };

  const hasSufficientBalance = A.sufficientBalance() && B.sufficientBalance();
  // const getDepositToken = () => {
  //   if (!depositToken) {
  //     return undefined;
  //   }
  //   return depositToken === A.mintAddress ? A : B;
  // };
  const createPoolButton = pool && (
    <Button
      className="add-button"
      type="primary"
      size="large"
      onClick={() => executeAction()}
      disabled={
        connected &&
        (pendingTx ||
          !A.account ||
          !B.account ||
          A.account === B.account ||
          !hasSufficientBalance)
      }
    >
      {generateActionLabel(CREATE_POOL_LABEL, connected, tokenMap, A, B)}
      {pendingTx && <Spin indicator={antIcon} className="add-spinner" />}
    </Button>
  );

  const executeMarginBuyButton = (
    <Button
      className="add-button"
      onClick={connected ? executeAction : wallet.connect}
      disabled={
        connected
      }
      type="primary"
      size="large"
    >
      {generateOpenPositionLabel(
        OPEN_POSITION_LABEL,
        connected,
        leverageRatio,
        tokenMap,
        A,
        B,
      )}
      {pendingTx && <Spin indicator={antIcon} className="add-spinner" />}
    </Button>
  );

  const calculateLoanAmount = (mint: CurrencyContextState, leverage: number): string => {
    let amount = parseFloat(mint.amount)
    if (amount !== 0 && leverage > 1) {
      return (amount * (leverage - 1)).toFixed(2)
    }
    return ""
  }

  return (
    <>
      <div className="input-card">
        <AdressesPopover pool={pool} />
        <Popover
          trigger="hover"
          content={
            <div style={{ width: 300 }}>
              Trading on margin leverages your current tokens, using them as collateral, to take out a loan
              in another denomination and thereby increase the amount of tokens you hold. 
            </div>
          }
        >
          <Button type="text">Read more about trading on margin.</Button>
        </Popover>
        <>
          <CurrencyInput
            title="Collateral"
            onInputChange={(val: any) => {
              setPoolOperation(PoolOperation.Add);
              if (A.amount !== val) {
                setLastTypedAccount(A.mintAddress);
              }
              A.setAmount(val);
            }}
            amount={A.amount}
            mint={A.mintAddress}
            onMintChange={(item) => {
              A.setMint(item);
            }}
          />
          <LeverageRatio
            currentLeverage = {leverageRatio}
          // TODO: We hard code the possible leverage ratios. In the future we should calculate it
          // based on volatility and liquidity of the underlying reserve
            possibleLeverages = {[1.5, 2, 3, 5]}
            onSelect = {(leverage: number) => {
              setLeverageRatio(leverage)
            }}
          />
          <UnderlyingTokenInput
            onInputChange={(val: any) => {
              setPoolOperation(PoolOperation.Add);
              if (B.amount !== val) {
                setLastTypedAccount(A.mintAddress);
              }
              B.setAmount(val);
            }}
            amount={calculateLoanAmount(B, leverageRatio)}
            mint={B.mintAddress}
            onMintChange={(item) => {
              B.setMint(item);
            }}
          />
        </>
        {executeMarginBuyButton}
      </div>
    </>
  );
};

const LeverageRatio = (props: { 
  currentLeverage: number,
  possibleLeverages: number[],
  onSelect: (val: number) => void,
}) => {

  return (
    <>
      <div className="leverageContainer">
        Leverage Ratio
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          { props.possibleLeverages.map((leverage) => {
            return (
              <LeverageButton
                active={props.currentLeverage === leverage}
                value={leverage}
                onClick={() => {
                  props.onSelect(leverage)
                }}
              />
            )
          })}
        </div>
      </div>
    </>
  );
}

const LeverageButton = (props: {
  active: boolean
  value: number,
  onClick: () => void
}) => {
  let border = "1px solid #333"
  if (props.active) {
    border = "1px solid #666"
  }
  return (
    <>
      <div className="leverageButton" onClick={props.onClick} style={{ border: border }} >
        {props.value}x
      </div>
    </>
  );
}

