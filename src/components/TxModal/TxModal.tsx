import { TxModalType, TxResultComponentType } from "../../types";
import GenericModal from "../GenericModal/genericModal";
import { LoadingComponent } from "../miscItems/miscItems";
import lib from "../../lib/lib";
import styles from "./TxModal.module.css";

export function TxModal2({
  isOpen,
  onClose,
  onClickHandler,
  fromIcon,
  tokenToTransfer,
  transferTxResult,
  methodCallTxResult,
}: TxModalType) {
  const [from, to] = fromIcon ? ["ICON", "BSC"] : ["BSC", "ICON"];
  const state =
    transferTxResult == null && methodCallTxResult == null
      ? null
      : methodCallTxResult != null && transferTxResult == null
      ? methodCallTxResult.failure == null
        ? null
        : false
      : methodCallTxResult == null && transferTxResult != null
      ? transferTxResult.failure == null
        ? true
        : false
      : methodCallTxResult.failure != null || transferTxResult.failure != null
      ? false
      : true;

  console.log("tx status");
  console.log(transferTxResult);
  console.log(methodCallTxResult);
  return (
    <GenericModal isOpen={isOpen} onClose={onClose} useSmall={true}>
      <div className={styles.main}>
        <ImageHandler state={state} />
        {fromIcon ? (
          tokenToTransfer === lib.tokenNames.icx ? (
            <ul className={styles.ul}>
              <li>
                Transfering {tokenToTransfer} from {from} to {to} chain.{" "}
                {transferTxResult === null ? `In Progress..` : `Done`}
              </li>
              {transferTxResult == null ? (
                <></>
              ) : transferTxResult.failure == null ? (
                <li>Tx Hash: {transferTxResult.txHash}</li>
              ) : (
                <li>
                  Error response from chain:{" "}
                  {JSON.stringify({
                    code: transferTxResult.failure.code,
                    message: transferTxResult.failure.message,
                    txHash: transferTxResult.txHash,
                  })}
                </li>
              )}
            </ul>
          ) : lib.iconTokens.native.includes(tokenToTransfer!) ? (
            <ul className={styles.ul}>
              <li>
                Transfering {tokenToTransfer} to BTP smart contract.{" "}
                {methodCallTxResult === null ? `In Progress..` : `Done`}
              </li>
              {methodCallTxResult == null ? (
                <></>
              ) : methodCallTxResult.failure == null ? (
                <li>Tx Hash: {methodCallTxResult.txHash}</li>
              ) : (
                <li>
                  Error response from chain:{" "}
                  {JSON.stringify({
                    code: methodCallTxResult.failure.code,
                    message: methodCallTxResult.failure.message,
                    txHash: methodCallTxResult.txHash,
                  })}
                </li>
              )}
              <li>
                Transfering {tokenToTransfer} from {from} to {to} chain.{" "}
                {transferTxResult === null ? `Pending..` : `Done`}
              </li>
              {transferTxResult == null ? (
                <></>
              ) : transferTxResult.failure == null ? (
                <li>Tx Hash: {transferTxResult.txHash}</li>
              ) : (
                <li>
                  Error response from chain:{" "}
                  {JSON.stringify({
                    code: transferTxResult.failure.code,
                    message: transferTxResult.failure.message,
                    txHash: transferTxResult.txHash,
                  })}
                </li>
              )}
            </ul>
          ) : (
            <ul className={styles.ul}>
              <li>
                Approving BTP contract to transfer {tokenToTransfer} token.{" "}
                {methodCallTxResult === null ? `In Progress..` : `Done`}
                {methodCallTxResult == null ? (
                  <></>
                ) : methodCallTxResult.failure == null ? (
                  <li>Tx Hash: {methodCallTxResult.txHash}</li>
                ) : (
                  <li>
                    Error response from chain:{" "}
                    {JSON.stringify({
                      code: methodCallTxResult.failure.code,
                      message: methodCallTxResult.failure.message,
                      txHash: methodCallTxResult.txHash,
                    })}
                  </li>
                )}
              </li>
              <li>
                Transfering {tokenToTransfer} from {from} to {to} chain.{" "}
                {transferTxResult === null ? `Pending..` : `Done`}
              </li>
              {transferTxResult == null ? (
                <></>
              ) : transferTxResult.failure == null ? (
                <li>Tx Hash: {transferTxResult.txHash}</li>
              ) : (
                <li>
                  Error response from chain:{" "}
                  {JSON.stringify({
                    code: transferTxResult.failure.code,
                    message: transferTxResult.failure.message,
                    txHash: transferTxResult.txHash,
                  })}
                </li>
              )}
            </ul>
          )
        ) : tokenToTransfer === lib.tokenNames.bnb ? (
          <ul className={styles.ul}>
            <li>
              Transfering {tokenToTransfer} from {from} to {to} chain.{" "}
              {transferTxResult === null ? `In Progress..` : `Done`}
            </li>
          </ul>
        ) : (
          <ul className={styles.ul}>
            <li>
              Approving BTP contract to transfer {tokenToTransfer} token.{" "}
              {transferTxResult === null ? `In Progress..` : `Done`}
            </li>
            <li>
              Transfering {tokenToTransfer} from {from} to {to} chain.{" "}
              {transferTxResult === null ? `Pending..` : `Done`}
            </li>
          </ul>
        )}
        <button
          className={styles.closeBtn}
          onClick={() => onClickHandler(false)}
        >
          Close
        </button>
      </div>
    </GenericModal>
  );
}

type ImageHandlerType = {
  state: null | boolean;
};

function ImageHandler({ state }: ImageHandlerType) {
  return state == null ? (
    <div className={styles.imageHandlerContainer}>
      <LoadingComponent useBig={true} />
      <p>Waiting on wallet for transactions..</p>
    </div>
  ) : state === false ? (
    <div className={styles.imageHandlerContainer}>
      <div className={styles.imageContainer}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <path d="M22.5 29V10h3v19Zm0 9v-3h3v3Z" />
        </svg>
      </div>
      <p>Error during crosschain transaction!.</p>
    </div>
  ) : (
    <div className={styles.imageHandlerContainer}>
      <div className={styles.imageContainer}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <path d="M18.9 35.7 7.7 24.5l2.15-2.15 9.05 9.05 19.2-19.2 2.15 2.15Z" />
        </svg>
      </div>
      <p>Crosschain transaction complete!.</p>
    </div>
  );
}
