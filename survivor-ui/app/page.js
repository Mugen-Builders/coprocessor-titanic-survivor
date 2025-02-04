"use client";

import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { createPublicClient, createWalletClient, http, parseAbi, custom } from "viem";
import { anvil } from "viem/chains";

const CONTRACT_ADDRESS = "0x1429859428C0aBc9C2C47C8Ee9FBaf82cFA0F20f";

// Lazy load window.ethereum to prevent SSR issues
const publicClient = createPublicClient({
  chain: anvil,
  transport: typeof window !== "undefined" && window.ethereum ? custom(window.ethereum) : http("http://127.0.0.1:8545"),
});

const abi = parseAbi([
  "function get() view returns (uint256)",
  "function runExecution(bytes input) external",
]);

export default function SurvivorDApp() {
  const [account, setAccount] = useState(null);
  const [walletClient, setWalletClient] = useState(null);
  const [age, setAge] = useState(10);
  const [sex, setSex] = useState("male");
  const [embarked, setEmbarked] = useState("C");
  const [gif, setGif] = useState(null);
  const [survivorStatus, setSurvivorStatus] = useState(null);

  useEffect(() => {
    async function fetchAccount() {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setWalletClient(createWalletClient({ transport: custom(window.ethereum), chain: anvil }));
        }
      }
    }

    fetchAccount();

    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", fetchAccount);
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener("accountsChanged", fetchAccount);
      }
    };
  }, []);

  const fetchSurvivorStatus = async () => {
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "get",
      });
      console.log("result: " + result)
      setSurvivorStatus(result);
      if (result == 0) {
        setGif("/drown.gif")
      } else {
        setGif("/chill.gif")
      }
    } catch (error) {
      console.error("Error fetching survivor status:", error);
    }
  };

  const submitData = async () => {
    if (!walletClient || !account) return;

    setGif("")

    const jsonData = JSON.stringify({ Age: age, Sex: sex, Embarked: embarked });
    const hexData = "0x" + Buffer.from(jsonData).toString("hex");

    try {
      await walletClient.writeContract({
        account,
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "runExecution",
        args: [hexData],
      });
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  if (!account) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-lg">
      <ConnectButton />
      <h1 className="text-xl font-bold mb-4">Titanic Survivor Prediction</h1>

      <div>
        <label className="block text-sm font-medium">Age: <span id="age-value">{age}</span></label>
        <input type="range" min="10" max="100" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full" />
      </div>

      <div>
        <label className="block text-sm font-medium">Gender</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input type="radio" value="male" checked={sex === "male"} onChange={() => setSex("male")} className="mr-2" /> Male
          </label>
          <label className="flex items-center">
            <input type="radio" value="female" checked={sex === "female"} onChange={() => setSex("female")} className="mr-2" /> Female
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Embarked From</label>
        <select value={embarked} onChange={(e) => setEmbarked(e.target.value)} className="w-full p-2 border rounded">
          <option value="C">Cherbourg</option>
          <option value="Q">Queenstown</option>
          <option value="S">Southampton</option>
        </select>
      </div>

      <div className="flex space-x-4 mt-4">
        <button onClick={submitData} className="bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
        <button onClick={fetchSurvivorStatus} className="bg-gray-500 text-white px-4 py-2 rounded">Check Status</button>
      </div>

      {gif && <img src={gif} alt="Result GIF" className="mt-4" />}
    </div>
  );
}