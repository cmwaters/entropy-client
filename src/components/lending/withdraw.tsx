import React from "react";
import { useLendingReserve } from "../../contexts/lending";
import { useParams } from "react-router-dom";
import "./withdraw.less";

export const WithdrawReserve = () => {
  // const { id } = useParams<{ id: string }>();
  // const lendingReserve = useLendingReserve(id);
  // const reserve = lendingReserve?.info;

  // if (!reserve || !lendingReserve) {
  //   return null;
  // }

  return (
    <div className="deposit-reserve">
      <p>You have no reserves to withdraw from</p>
      {/* <DepositInfoLine
        className="deposit-reserve-item"
        reserve={reserve}
        address={lendingReserve.pubkey}
      />
      <div className="deposit-reserve-container">
        <WithdrawInput
          className="deposit-reserve-item deposit-reserve-item-left"
          reserve={reserve}
          address={lendingReserve.pubkey}
        />
        <SideReserveOverview
          className="deposit-reserve-item deposit-reserve-item-right"
          reserve={lendingReserve}
          mode={SideReserveOverviewMode.Deposit}
        />
      </div> */}
    </div>
  );
};

