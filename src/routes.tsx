import { HashRouter, Route } from "react-router-dom";
import React from "react";
import { ChartsView } from "./components/charts";

import { WalletProvider } from "./utils/wallet";
import { ConnectionProvider } from "./utils/connection";
import { AccountsProvider } from "./utils/accounts";
import { CurrencyPairProvider } from "./utils/currencyPair";
import { MarketProvider } from "./contexts/market";
import { LendingProvider } from "./contexts/lending";
import { PoolOverview } from "./components/pool/view";
import { ExchangeView } from "./components/exchange";
import { MarginView } from "./components/margin"

export function Routes() {
  return (
    <>
      <HashRouter basename={"/"}>
        <ConnectionProvider>
          <WalletProvider>
            <AccountsProvider>
              <MarketProvider>
                <CurrencyPairProvider>
                  <Route exact path="/" component={ExchangeView} />
                  <Route exact path="/add" component={ExchangeView} />
                  <Route exact path="/info" component={() => <ChartsView />} />
                  <Route
                    exact
                    path="/pool"
                    component={() => <PoolOverview />}
                  />
                  <Route exact path="/margin" component={MarginView} />
                  <Route exact path="/close" component={MarginView} />
                </CurrencyPairProvider>
                <LendingProvider>
                  <Route exact path="/lend" component={ExchangeView} />
                  <Route exact path="/withdraw" component={ExchangeView} />
                </LendingProvider>
              </MarketProvider>
            </AccountsProvider>
          </WalletProvider>
        </ConnectionProvider>
      </HashRouter>
    </>
  );
}
