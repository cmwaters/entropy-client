import React from "react";
import { Select } from "antd";
import { ENDPOINTS, useConnectionConfig } from "../contexts/connection";
import { useWallet, WALLET_PROVIDERS } from "../utils/wallet";
import { Slippage } from "./slippage";
import { GithubFilled } from "@ant-design/icons"

export const Settings = () => {
  const { providerUrl, setProvider } = useWallet();
  const { endpoint, setEndpoint } = useConnectionConfig();

  return (
    <>
      <div>
        Transactions: Settings:
        <div>
          Slippage:
          <Slippage />
        </div>
      </div>
      <div style={{ display: "grid", margin: "20px 0px" }}>
        Network:{" "}
        <Select
          onSelect={setEndpoint}
          value={endpoint}
          style={{ marginRight: 8 }}
        >
          {ENDPOINTS.map(({ name, endpoint }) => (
            <Select.Option value={endpoint} key={endpoint}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </div>
      <div style={{ display: "grid", margin: "20px 0px" }}>
        Wallet:{" "}
        <Select onSelect={setProvider} value={providerUrl}>
          {WALLET_PROVIDERS.map(({ name, url }) => (
            <Select.Option value={url} key={url}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </div>
      <div>
        <a
          href={"https://github.com/marbar3778/Entropy"}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GithubFilled />
          <span style={{marginLeft: "10px"}}>Github</span>
        </a>
      </div>
    </>
  );
};
