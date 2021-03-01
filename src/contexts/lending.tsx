import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LENDING_PROGRAM_ID } from "../utils/ids"
import { 
  cache, 
  useMint, 
  useAccountByMint, 
  MintParser, 
  ParsedAccount, 
  getMultipleAccounts,
 } from "./accounts";
import { MintInfo } from "@solana/spl-token";
import { useConnection, useConnectionConfig } from "./connection";
import {
  CurveType,
  PoolConfig,
  TokenAccount,
  DEFAULT_DENOMINATOR,
} from "../models";
import { 
  convert, 
  getTokenIcon, 
  getTokenName, 
  KnownToken, 
  getTokenByName, 
} from "../utils/utils";
import bs58 from "bs58";
import { PublicKey, AccountInfo } from "@solana/web3.js";
import {
  LendingMarketParser,
  isLendingReserve,
  isLendingMarket,
  LendingReserveParser,
  LendingReserve,
  isLendingObligation,
  LendingObligationParser,
} from "../models/lending";
import { usePrecacheMarket } from "./market";


export interface LendingContextState {}

const LendingContext = React.createContext<LendingContextState | null>(null);

const convertAmount = (amount: string, mint?: MintInfo) => {
  return parseFloat(amount) * Math.pow(10, mint?.decimals || 0);
};

export const useCurrencyLeg = (config: PoolConfig, defaultMint?: string) => {
  const { tokenMap } = useConnectionConfig();
  const [amount, setAmount] = useState("");
  const [mintAddress, setMintAddress] = useState(defaultMint || "");
  const account = useAccountByMint(mintAddress);
  const mint = useMint(mintAddress);

  return useMemo(
    () => ({
      mintAddress: mintAddress,
      account: account,
      mint: mint,
      amount: amount,
      name: getTokenName(tokenMap, mintAddress),
      icon: getTokenIcon(tokenMap, mintAddress),
      setAmount: setAmount,
      setMint: setMintAddress,
      convertAmount: () => convertAmount(amount, mint),
      sufficientBalance: () =>
        account !== undefined &&
        (convert(account, mint) >= parseFloat(amount) ||
          config.curveType === CurveType.ConstantProductWithOffset),
    }),
    [
      mintAddress,
      account,
      mint,
      amount,
      tokenMap,
      setAmount,
      setMintAddress,
      config,
    ]
  );
};

export function LendingProvider({ children = null as any }) {
  let { accounts } = useLending()

  return (
    <LendingContext.Provider
      value={{
        accounts
      }}
    >
      {children}
    </LendingContext.Provider>
  );
}

export const useLending = () => {
  const connection = useConnection();
  const [lendingAccounts, setLendingAccounts] = useState<any[]>([]);
  const { reserveAccounts } = useLendingReserves();
  const precacheMarkets = usePrecacheMarket();

  // TODO: query for all the dex from reserves

  const processAccount = useCallback(
    (item: { pubkey: PublicKey; account: AccountInfo<Buffer> }) => {
      if (isLendingReserve(item.account)) {
        return cache.add(
          item.pubkey.toBase58(),
          item.account,
          LendingReserveParser
        );
      } else if (isLendingMarket(item.account)) {
        return cache.add(
          item.pubkey.toBase58(),
          item.account,
          LendingMarketParser
        );
      } else if (isLendingObligation(item.account)) {
        return cache.add(
          item.pubkey.toBase58(),
          item.account,
          LendingObligationParser
        );
      }
    },
    []
  );

  useEffect(() => {
    if (reserveAccounts.length > 0) {
      precacheMarkets(
        reserveAccounts.map((reserve) => reserve.info.liquidityMint.toBase58())
      );
    }
  }, [reserveAccounts, precacheMarkets]);

  // initial query
  useEffect(() => {
    setLendingAccounts([]);

    const queryLendingAccounts = async () => {
      const programAccounts = await connection.getProgramAccounts(
        LENDING_PROGRAM_ID
      );

      const accounts = programAccounts
        .map(processAccount)
        .filter((item) => item !== undefined);

      const lendingReserves = accounts
        .filter(
          (acc) => (acc?.info as LendingReserve).lendingMarket !== undefined
        )
        .map((acc) => acc as ParsedAccount<LendingReserve>);

      const toQuery = [
        ...lendingReserves.map((acc) => {
          const result = [
            cache.registerParser(
              acc?.info.collateralMint.toBase58(),
              MintParser
            ),
            cache.registerParser(
              acc?.info.liquidityMint.toBase58(),
              MintParser
            ),
            // ignore dex if its not set
            // cache.registerParser(
            //   acc?.info.dexMarketOption ? acc?.info.dexMarket.toBase58() : "",
            //   DexMarketParser
            // ),
          ].filter((_) => _);
          return result;
        }),
      ].flat() as string[];

      // This will pre-cache all accounts used by pools
      // All those accounts are updated whenever there is a change
      await getMultipleAccounts(connection, toQuery, "single").then(
        ({ keys, array }) => {
          return array.map((obj, index) => {
            const address = keys[index];
            cache.add(address, obj);
            return obj;
          }) as any[];
        }
      );

      // HACK: fix, force account refresh
      programAccounts.map(processAccount).filter((item) => item !== undefined);

      return accounts;
    };

    Promise.all([queryLendingAccounts()]).then((all) => {
      setLendingAccounts(all.flat());
    });
  }, [connection, processAccount]);

  useEffect(() => {
    const subID = connection.onProgramAccountChange(
      LENDING_PROGRAM_ID,
      async (info) => {
        const id = (info.accountId as unknown) as string;
        const item = {
          pubkey: new PublicKey(id),
          account: info.accountInfo,
        };
        processAccount(item);
      },
      "singleGossip"
    );

    return () => {
      connection.removeProgramAccountChangeListener(subID);
    };
  }, [connection, lendingAccounts, processAccount]);

  return { accounts: lendingAccounts };
};

export function useLendingReserve(address?: string | PublicKey) {
  const { tokenMap } = useConnectionConfig();
  const { reserveAccounts } = useLendingReserves();
  let addressName = address;
  if (typeof address === "string") {
    const token: KnownToken | null = getTokenByName(tokenMap, address);
    if (token) {
      const account = reserveAccounts.filter(
        (acc) => acc.info.liquidityMint.toBase58() === token.mintAddress
      )[0];
      if (account) {
        addressName = account.pubkey;
      }
    }
  }
  const id = useMemo(
    () =>
      typeof addressName === "string" ? addressName : addressName?.toBase58(),
    [addressName]
  );

  const [reserveAccount, setReserveAccount] = useState<
    ParsedAccount<LendingReserve>
  >(cache.get(id || "") as ParsedAccount<LendingReserve>);

  useEffect(() => {
    const dispose = cache.emitter.onCache((args) => {
      if (args.id === id) {
        setReserveAccount(cache.get(id) as ParsedAccount<LendingReserve>);
      }
    });

    return () => {
      dispose();
    };
  }, [id, setReserveAccount]);

  return reserveAccount;
}

export const getLendingReserves = () => {
  return cache
    .byParser(LendingReserveParser)
    .map((id) => cache.get(id))
    .filter((acc) => acc !== undefined) as ParsedAccount<LendingReserve>[];
};

export function useLendingReserves() {
  const [reserveAccounts, setReserveAccounts] = useState<
    ParsedAccount<LendingReserve>[]
  >(getLendingReserves());

  useEffect(() => {
    const dispose = cache.emitter.onCache((args) => {
      if (args.parser === LendingReserveParser) {
        setReserveAccounts(getLendingReserves());
      }
    });

    return () => {
      dispose();
    };
  }, [setReserveAccounts]);

  return {
    reserveAccounts,
  };
}
