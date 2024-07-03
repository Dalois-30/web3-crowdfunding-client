import React, { useContext, createContext, useState } from 'react';
import { ethers } from 'ethers';
const StateContext = createContext();

const { ethereum } = window;

const contract = async () => {
  // create provider
  const provider = new ethers.BrowserProvider(ethereum)

  // get connected account
  const signer = await provider.getSigner();

  // create a new transaction contract
  const transactionContract = new ethers.Contract(contractAddress, contractABI, signer)

  return transactionContract;
}


export const StateContextProvider = ({ children }) => {


  const [address, setAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
  const [transactions, setTransactions] = useState([])

  const connect = async () => {
    try {
      if (!ethereum) {
        return alert("Please install Metamask")
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setAddress(accounts[0]);
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object.")
    }
  }

  const publishCampaign = async (form) => {
    try {
      const data = await createCampaign([
        address, // owner
        form.title, // title
        form.description, // description
        form.target,
        new Date(form.deadline).getTime(), // deadline,
        form.image
      ])

      console.log("contract call success", data)
    } catch (error) {
      console.log("contract call failure", error)  
    }
  }

  const getCampaigns = async () => {
    try {
      if (!ethereum) {
        return alert("Please install Metamask");
      }
      const transactionContract = await contract();

      const campaigns = await transactionContract.getCampaigns();
      const parsedCampaings = campaigns.map((campaign, i) => ({
        owner: campaign.owner,
        title: campaign.title,
        description: campaign.description,
        target: ethers.utils.formatEther(campaign.target.toString()),
        deadline: campaign.deadline.toNumber(),
        amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
        image: campaign.image,
        pId: i
      }));

      return parsedCampaings;
    } catch (error) {

    }
  }

  const getUserCampaigns = async () => {
    try {
      if (!ethereum) {
        return alert("Please install Metamask");
      }
      const allCampaigns = await getCampaigns();

      const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);

      return filteredCampaigns;
    } catch (error) {

    }
  }

  const donate = async (pId, amount) => {
    try {
      if (!ethereum) {
        return alert("Please install Metamask");
      }
      const transactionContract = await contract();
      const parsedAmount = ethers.parseEther(amount);
      console.log(parsedAmount);

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: currentAccount,
          to: transactionContract.address,
          value: ethers.toBeHex(parsedAmount)
        }]
      })
      const transaction = await transactionContract.donateToCampaign(pId)
      console.log(`Loading - ${transaction.hash}`);
      await transaction.wait();
      setIsLoading(false);
      console.log("success", transaction);
      return transaction
    } catch (error) {

    }
  }

  const getDonations = async (pId) => {
    const donations = await contract.call('getDonators', pId);
    const numberOfDonations = donations[0].length;

    const parsedDonations = [];

    for (let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString())
      })
    }

    return parsedDonations;
  }


  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connect,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations
      }}
    >
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext);