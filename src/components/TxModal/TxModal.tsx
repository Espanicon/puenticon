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
  console.log("tx status");
  console.log(transferTxResult);
  console.log(methodCallTxResult);
  return (
    <GenericModal isOpen={isOpen} onClose={onClose} useSmall={true}>
      <div className={styles.main}>
        <ImageHandler state={transferTxResult} />
        {fromIcon ? (
          tokenToTransfer === lib.tokenNames.icx ? (
            <ul className={styles.ul}>
              <li>
                Transfering {tokenToTransfer} from {from} to {to} chain.{" "}
                {transferTxResult === null ? `In Progress..` : `Done`}
              </li>
            </ul>
          ) : lib.iconTokens.native.includes(tokenToTransfer!) ? (
            <ul className={styles.ul}>
              <li>
                Transfering {tokenToTransfer} to BTP smart contract.{" "}
                {transferTxResult === null ? `In Progress..` : `Done`}
              </li>
              <li>
                Transfering {tokenToTransfer} from {from} to {to} chain.{" "}
                {transferTxResult === null ? `Pending..` : `Done`}
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
                {transferTxResult === null ? `Peding..` : `Done`}
              </li>
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

export function TxModal({
  isOpen,
  onClose,
  onClickHandler,
  fromIcon,
  tokenToTransfer,
  transferTxResult,
  methodCallTxResult,
}: TxModalType) {
  const header = fromIcon ? "ICON -> BSC" : "BSC -> ICON";
  return (
    <GenericModal isOpen={isOpen} onClose={onClose} useSmall={true}>
      <h1>{header}</h1>
      {fromIcon ? (
        tokenToTransfer === lib.tokenNames.icx ? (
          <>
            <p>Transferring ICX from ICON to BSC</p>
            <TxResultComponent
              txResult={transferTxResult}
              fromIcon={fromIcon}
            />
          </>
        ) : lib.iconTokens.native.includes(tokenToTransfer!) ? (
          <>
            <p>Transferring ICON native token</p>
            <p>Pre approval transaction result:</p>
            <TxResultComponent
              txResult={methodCallTxResult}
              fromIcon={fromIcon}
            />
            <p>Main transaction result:</p>
            <TxResultComponent
              txResult={transferTxResult}
              fromIcon={fromIcon}
            />
          </>
        ) : (
          <>
            <p>transferring ICON wrapped token</p>
            <p>Pre approval transaction result:</p>
            <TxResultComponent
              txResult={methodCallTxResult}
              fromIcon={fromIcon}
            />
            <p>Main transaction result:</p>
            <TxResultComponent
              txResult={transferTxResult}
              fromIcon={fromIcon}
            />
          </>
        )
      ) : tokenToTransfer === lib.tokenNames.bnb ? (
        <>
          <p>transferring BNB from BSC to ICON</p>
          <TxResultComponent txResult={transferTxResult} fromIcon={fromIcon} />
        </>
      ) : (
        <>
          <p>transferring token from BSC to ICON</p>
          <p>Pre approval transaction result:</p>
          <TxResultComponent
            txResult={methodCallTxResult}
            fromIcon={fromIcon}
          />
          <p>Main transaction result:</p>
          <TxResultComponent txResult={transferTxResult} fromIcon={fromIcon} />
        </>
      )}

      <button onClick={() => onClickHandler(false)}>Close</button>
    </GenericModal>
  );
}

function TxResultComponent({ txResult, fromIcon }: TxResultComponentType) {
  let message = "ERROR";

  if (fromIcon) {
    if (txResult != null) {
      if (txResult.error != null || txResult.failure != null) {
        message =
          txResult.error == null
            ? `Error response from Chain: ${JSON.stringify(txResult.failure)}`
            : `Error making tx request: ${txResult.error}`;
      } else {
        message = `Tx hash result: ${JSON.stringify(txResult.txHash)}`;
      }
    }
  } else {
    if (txResult != null) {
      if (typeof txResult == "string") {
        message = `Tx hash result: ${JSON.stringify(txResult)}`;
      } else {
        if (txResult.result == null) {
          message = `Error response from chain: ${JSON.stringify({
            code: txResult.code,
            message: txResult.message,
          })}`;
        } else {
          message = `Tx hash result:${txResult.hash}`;
        }
      }
    }
  }

  return txResult === null ? <p>waiting...</p> : <p>{message}</p>;
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
  ) : state === true ? (
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
