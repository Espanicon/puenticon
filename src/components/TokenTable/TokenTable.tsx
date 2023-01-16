import { useState, useEffect } from "react";
import styles from "./TokenTable.module.css";

type TokenType = {
  token: string;
  balance: {
    [key: string]: number;
  };
};

type TokenTableType = {
  tableLabel: any;
  tokens: Array<TokenType>;
  handleTokenToRefund: any;
};

export default function TokenTable({
  tableLabel,
  tokens,
  handleTokenToRefund
}: TokenTableType) {
  const tokensKeys = tokens.map(() => {
    return crypto.randomUUID();
  });

  function handleOnClick(token: string, refundable: number) {
    if (refundable > 0) {
      handleTokenToRefund(token);
    }
  }

  return (
    <div className={styles.main}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Token</th>
            <th>Locked</th>
            <th>Refundable</th>
            <th>Usable</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((eachToken, index) => {
            return (
              <tr className={styles.tableRow} key={tokensKeys[index]}>
                <td>{eachToken.token}</td>
                <td>{eachToken.balance.locked}</td>
                <td>{eachToken.balance.refundable}</td>
                <td>{eachToken.balance.usable}</td>
                <td>{eachToken.balance.userBalance}</td>
                <td>
                  <button
                    disabled={eachToken.balance.refundable! > 0 ? false : true}
                    onClick={() =>
                      handleOnClick(eachToken, eachToken.balance.refundable!)
                    }
                  >
                    Refund
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
