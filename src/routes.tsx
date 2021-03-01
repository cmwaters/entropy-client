import { HashRouter, Route } from "react-router-dom";
import React from "react";
import { ChartsView } from "./components/charts";

import { WalletProvider } from "./utils/wallet";
import { ConnectionProvider } from "./contexts/connection";
import { AccountsProvider } from "./contexts/accounts";
import { CurrencyPairProvider } from "./contexts/currencyPair";
import { MarketProvider } from "./contexts/market";
import { LendingProvider } from "./contexts/lending"
import { PoolOverview } from "./components/pool/view";
import { ExchangeView } from "./views/exchange";
import { MarginView } from "./views/margin"
import { LendingView } from "./views/lending"

export function Routes() {
  return (
    <>
      <HashRouter basename={"/"}>
        <ConnectionProvider>
          <WalletProvider>
            <AccountsProvider>
              <MarketProvider>
                <CurrencyPairProvider>
                  {/* default to swap page (in the future we may want to add a dashboard) */}
                  <Route exact path="/" component={ExchangeView} />
                  <Route exact path="/swap/trade" component={ExchangeView} />
                  <Route exact path="/swap/pool" component={ExchangeView} />
                  <Route exact path="/info" component={() => <ChartsView />} />
                  <Route exact path="/pool" component={() => <PoolOverview />} />
                  <Route exact path="/margin/open" component={MarginView} />
                  <Route exact path="/margin/close" component={MarginView} />
                </CurrencyPairProvider>
                <LendingProvider>
                  <Route exact path="/lend/deposit" component={LendingView} />
                  <Route exact path="/lend/withdraw" component={LendingView} />
                </LendingProvider>
              </MarketProvider>
            </AccountsProvider>
          </WalletProvider>
        </ConnectionProvider>
      </HashRouter>
    </>
  );
}
