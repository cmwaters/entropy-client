import React from "react";
import { Button, Menu, Popover } from "antd";
import { useWallet } from "../utils/wallet";
import { AccountInfo } from "./accountInfo";
import { Link, useHistory, useLocation } from "react-router-dom";

export const AppBar = (props: { left?: JSX.Element; right?: JSX.Element }) => {
  const { connected, wallet } = useWallet();
  const location = useLocation();
  const history = useHistory();

  const TopBar = (
    <div className="App-Bar">
      <div className="App-Bar-left">
        <div className="App-logo" />
        <Menu mode="horizontal" selectedKeys={[location.pathname]}>
          <Menu.Item key="/swap">
            <Link
              to={{
                pathname: "/swap/trade",
              }}
            >
              Swap
            </Link>
          </Menu.Item>
          <Menu.Item key="/margin">
            <Link
              to={{
                pathname: "/margin/open",
              }}
            >
              Margin
            </Link>
          </Menu.Item>
          <Menu.Item key="/lend">
            <Link
              to={{
                pathname: "/lend/deposit",
              }}
            >
              Lend
            </Link>
          </Menu.Item>
          <Menu.Item key="/info">
            <Link
              to={{
                pathname: "/info",
              }}
            >
              Charts
            </Link>
          </Menu.Item>
          <Menu.Item key="trade">
            <a
              href={"https://dex.projectserum.com"}
              target="_blank"
              rel="noopener noreferrer"
            >
              DEX
            </a>
          </Menu.Item>
        </Menu>
        {props.left}
      </div>
      <div className="App-Bar-right">
        <AccountInfo />
        {connected && (
          <Button
            type="text"
            size="large"
            onClick={() => history.push({ pathname: "/overview" })}
          >
            Overview
          </Button>
        )}
        <div>
          {!connected && (
            <Button
              type="text"
              size="large"
              onClick={connected ? wallet.disconnect : wallet.connect}
            >
              Connect
            </Button>
          )}
          {connected && (
            <Popover
              placement="bottomRight"
              title="Wallet public key"
              trigger="click"
            ></Popover>
          )}
        </div>
        {props.right}
      </div>
    </div>
  );

  return TopBar;
};
