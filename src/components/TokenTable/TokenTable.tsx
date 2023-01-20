import { useState, useEffect } from "react";
import { TokenType, TokenTableType } from "../../types";
import { LoadingComponent } from "../miscItems/miscItems";
import styles from "./TokenTable.module.css";

function hexToDecimal(hex: string, decimals: number = 2) {
  const result = parseInt(hex, 16) / 10 ** 18;
  return result.toFixed(decimals);
}

export default function TokenTable({
  tableLabel,
  tokens,
  handleTokenToRefund
}: TokenTableType) {
  const tokensKeys = tokens.map(eachToken => {
    return crypto.randomUUID();
  });

  function handleOnClick(token: TokenType, refundable: string) {
    if (refundable != "0x0") {
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
                <td>{hexToDecimal(eachToken.balance.locked!)}</td>
                <td>{hexToDecimal(eachToken.balance.refundable!)}</td>
                <td>{hexToDecimal(eachToken.balance.usable!)}</td>
                <td>{hexToDecimal(eachToken.balance.userBalance!)}</td>
                <td>
                  <button
                    disabled={
                      eachToken.balance.refundable! === "0x0" ||
                      eachToken.claiming === true
                        ? true
                        : false
                    }
                    onClick={() =>
                      handleOnClick(eachToken, eachToken.balance.refundable!)
                    }
                  >
                    Refund
                  </button>
                </td>
                {eachToken.claiming ? <LoadingComponent /> : <></>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
