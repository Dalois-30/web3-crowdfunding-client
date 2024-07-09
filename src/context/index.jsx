import React, { useContext, useEffect, createContext, useState } from 'react';

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
        return alert("Please install MetaMask");
      }

      // Request access to the user's accounts
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      // The selected account is the first one in the array
      const selectedAccount = accounts[0];
      setAddress(selectedAccount);

      // You might want to store this account or use it for future calls
      console.log("Connected account:", selectedAccount);

      const projects = await getAllProjects();
      console.log("projects", projects);

    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      throw new Error("No ethereum object or user rejected the request.");
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length) {
        setAddress(accounts[0]);
        return accounts[0];
      }
      return false;
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  const createCampaign = async (form) => {
    try {
      if (!ethereum) {
        return alert('Please install Metamask');
      }
      setIsLoading(true);
      // Get the Manager project instance
      const { crowdfundingContract } = await getEtherumContract();
      const dateTimestamp = new Date(form.deadline).getTime() / 1000;
      // start a new project
      const newProject = await crowdfundingContract.createProject(
        form.title,
        form.description,
        form.image,
        form.target,
        dateTimestamp, // deadline,
      );
      console.log(`Loading - ${newProject.hash}`);
      await newProject.wait();
      setIsLoading(false);
      console.log('newProject:', newProject);
      return newProject;
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      throw new Error('No ethereum object.');
    }
  };
  
  
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
        adminAddress: adminAddress,
        projAddress: projAddress
      };
      console.log('Project Detail Informations:', projectDetails);

      return projectDetails;
    } catch (error) {
      console.log(error);
      throw new Error('No ethereum object.');
    }
  };  
  
  
  const getAllBackers = async (projAddress) => {
    try {
      if (!ethereum) {
        return alert('Please install Metamask');
      }
      setIsLoading(true);
      const projectContract = await getProjectContract(projAddress);
      const backerAddresses = await projectContract.getAllBackers();
      console.log('Backers addresses:', backerAddresses);

      const backerDetails = await Promise.all(
        backerAddresses.map(async (address) => {
          const details = await getBackerDetails(projAddress, address);
          return {
            address,
            ...details,
          };
        })
      );

      // setProjects(projectDetails);
      setIsLoading(false);
      console.log('Backers:', backerDetails);
      return backerDetails;
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      throw new Error('No ethereum object.');
    }
  };

  const getBackerDetails = async (projAddress, backerAddress) => {
    try {
      if (!ethereum) {
        return alert('Please install Metamask');
      }
      const projectContract = await getProjectContract(projAddress);
      const tx = await projectContract.getBacker(backerAddress);
      const backerDetails = {
        contribution: parseInt(tx[0]),
        timestamp: parseInt(tx[1]),
        refunded: tx[2]
      };
      console.log('Backer Detail Informations:', backerDetails);

      return backerDetails;
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


  const donate = async (projAddress, amount) => {
    try {
      if (!ethereum) {
        return alert("Please install Metamask");
      }
      await checkIfWalletIsConnected();
      const { crowdfundingContract } = await getEtherumContract();
      const parsedAmount = ethers.parseEther(amount);
      console.log(parsedAmount);

      const transaction = await crowdfundingContract.backProject(projAddress, {
        value: parsedAmount
      });

      console.log(`Loading - ${transaction.hash}`);
      await transaction.wait();
      setIsLoading(false);
      console.log("success", transaction);
      return transaction;
    } catch (error) {
      console.error("Error in donate function:", error);
      setIsLoading(false);
      alert("An error occurred while processing your donation.");
    }
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
        createCampaign,
        donate,
        getAllBackers,
        createCampaign
      }}
    >
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext);