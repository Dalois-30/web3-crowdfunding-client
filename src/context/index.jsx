import React, { useContext, createContext, useState } from 'react';
import { ethers } from 'ethers';

import { crowdfundingAddress, tokenAddress, crowdABI, tokenABI, projABI } from '../utils/constants';

const StateContext = createContext();

const { ethereum } = window;


const getEtherumContract = async () => {
  // create provider
  const provider = new ethers.BrowserProvider(ethereum)

  // get connected account
  const signer = await provider.getSigner();

  // create a new transaction contract
  const crowdfundingContract = new ethers.Contract(crowdfundingAddress, crowdABI, signer)
  const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer)

  return { crowdfundingContract, tokenContract };
}

const getProjectContract = async (projAddress) => {
  // create provider
  const provider = new ethers.BrowserProvider(ethereum)

  // get connected account
  const signer = await provider.getSigner();

  // create a new transaction contract
  const contractContract = new ethers.Contract(projAddress, projABI, signer)

  return contractContract;
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
      const accounts = await ethereum.request({ method: "eth_accounts" });
      setAddress(accounts[0]);
      const projects = await getAllProjects();
      console.log("projects", projects);
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object.")
    }
  }


  const getAllProjects = async () => {
    try {
      if (!ethereum) {
        return alert('Please install Metamask');
      }
      setIsLoading(true);
      const { crowdfundingContract } = await getEtherumContract();
      console.log('ManagerContract', crowdfundingContract);

      const projectAddresses = await crowdfundingContract.getAllProjects();
      console.log('Project addresses:', projectAddresses);

      const projectDetails = await Promise.all(
        projectAddresses.map(async (address) => {
          const details = await getProjectDetails(address);
          return {
            address,
            ...details,
          };
        })
      );

      // setProjects(projectDetails);
      setIsLoading(false);
      console.log('Projects:', projectDetails);
      return projectDetails;
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      throw new Error('No ethereum object.');
    }
  };

  const getProjectDetails = async (projAddress) => {
    try {
      if (!ethereum) {
        return alert('Please install Metamask');
      }
      const projectContract = await getProjectContract(projAddress);
      console.log('projectContractGet', projectContract);
      const tx = await projectContract.getProjectDetails();
      const adminAddress = await getAdminOwner(projAddress)
      const projectDetails = {
        title: tx[0],
        description: tx[1],
        imageUrl: tx[2],
        targetAmount: parseInt(tx[3]),
        amountRaised: parseInt(tx[4]),
        startTime: parseInt(tx[5]),
        endTime: parseInt(tx[6]),
        isActive: tx[7],
        tax: parseInt(tx[8]),
        status: parseInt(tx[9]),
        adminAddress: adminAddress
      };
      console.log('Project Detail Informations:', projectDetails);
  
      return projectDetails;
    } catch (error) {
      console.log(error);
      throw new Error('No ethereum object.');
    }
  };

  const getAdminOwner = async (projAddress) => {
    try {
      if (!ethereum) {
        return alert('Please install Metamask');
      }
      const projectContract = await getProjectContract(projAddress);
      const tx = await projectContract.getAdminOwner();
      console.log('getAdminOwner', tx);
  
      return tx;
    } catch (error) {
      console.log(error);
      throw new Error('No ethereum object.');
    }
  };
  
  

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
        // getAdminOwner,
        getEtherumContract,
        getProjectContract,
        connect,
        getAllProjects,
        getProjectDetails,
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