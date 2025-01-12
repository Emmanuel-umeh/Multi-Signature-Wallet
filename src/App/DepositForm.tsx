import React, { useState } from "react";
import Web3 from "web3";
import BigNumber from "@celo/connect/node_modules/bignumber.js";
import { Button, Form } from "semantic-ui-react";
import { useWeb3Context } from "../contexts/Web3";
import useAsync from "../components/useAsync";
import { deposit } from "../api/multi-sig-wallet";
const ERC20_DECIMALS = 18
interface Props {}

interface DepositParams {
  web3: Web3;
  account: string;
  amount: BigNumber;
}

const DepositForm: React.FC<Props> = () => {
  const {
    state: { web3, account },
  } = useWeb3Context();

  const [input, setInput] = useState("");
  const { pending, call } = useAsync<DepositParams, void>(
    ({ web3, account, amount }) => deposit(web3, account, { amount })
  );

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
  }

  async function onSubmit(_e: React.FormEvent<HTMLFormElement>) {
    if (pending) {
      return;
    }

    if (!web3) {
      alert("No web3");
      return;
    }

    const amount = new BigNumber(input).shiftedBy(ERC20_DECIMALS);
    const zero = new BigNumber(0).shiftedBy(ERC20_DECIMALS);
    
    if (amount.gt(zero)) {
      const { error } = await call({
        web3,
        account,
        amount,
      });

      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        setInput("");
      }
    }
  }

  return (
    <Form onSubmit={onSubmit}>
      <Form.Field>
        <Form.Input
          placeholder="Amount to deposit in cUSD"
          type="number"
          min={0}
          value={input}
          onChange={onChange}
        />
      </Form.Field>
      <Button color="green" disabled={pending} loading={pending}>
        Deposit
      </Button>
    </Form>
  );
};

export default DepositForm;
