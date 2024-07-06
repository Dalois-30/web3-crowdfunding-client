import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ethers } from "ethers"
import  { useContext } from "react"

import { crowdfundingAddress, tokenAddress, crowdABI, tokenABI, projABI } from '../utils/constants';
// import { contractABI, contractAddress } from '../../utils/constants';

export const TransactionContext = React.createContext();

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


export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState('');
    const [formData, setFormData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [setTransactionCount] = useState(localStorage.getItem("transactionCount"));
    const [transactions, setTransactions] = useState([]);

    const handleChange = (e, name) => {
        setFormData((prevState) => ({
            ...prevState, [name]: e.target.value
        }));
    };

    const connectWallet = async () => {
        try {
            if (!ethereum) {
                return alert("Please install Metamask");
            }
            const accounts = await ethereum.request({ method: "eth_accounts" });
            if (accounts.length) {
                setCurrentAccount(accounts[0]);
            } else {
                console.log("No account found");
            }
            console.log(accounts);
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.");
        }
    };

    // const connectWallet = async () => {
    //     try {
    //         if (!ethereum) {
    //             return alert("Please install Metamask");
    //         }
    //         const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    //         setCurrentAccount(accounts[0]);
    //         return true
    //     } catch (error) {
    //         console.log(error);
    //         // throw new Error("No ethereum object.");
    //         return false
    //     }
    // };

    const getAllProjects = async () => {
        try {
            if (!ethereum) {
                return alert("Please install Metamask");
            }
            setIsLoading(true);
            const contract = await getEtherumContract();
            console.log("ManagerContract", contract);
            const tx = await contract.getAllProjects();
            console.log(`Loading - ${tx.hash}`);
            await tx.wait();
            setIsLoading(false);
            console.log("success", tx);
            return tx;
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.");
        }
    };

    const getProjectDetails = async (projAddress) => {
        try {
            if (!ethereum) {
                return alert("Please install Metamask");
            }
            setIsLoading(true);
            const projectContract = await getProjectContract(projAddress);
            console.log("projectContract", projectContract);
            const tx = await projectContract.getProjectDetails();
            console.log(`Loading - ${tx.hash}`);
            await tx.wait();
            setIsLoading(false);
            console.log("success", tx);
            return tx;
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.");
        }
    };

    // const sendTransaction = async (assetSymb, amount, assetIdForMint) => {
    //     try {
    //         if (!ethereum) {
    //             return alert("Please install Metamask");
    //         }
    //         console.log("assetSymb", assetSymb);
    //         console.log("amount", amount);
    //         console.log("assetIdForMint", assetIdForMint);
    //         setIsLoading(true);
    //         const transactionContract = await getEtherumContract();
    //         console.log("transactionContract", transactionContract);
    //         const tx = await transactionContract.sendMintRequest('ASSER', ethers.parseEther(amount.toString()), assetIdForMint, currentAccount);
    //         console.log(`Loading - ${tx.hash}`);
    //         await tx.wait();
    //         setIsLoading(false);
    //         console.log("success", tx);

    //         window.location.reload();
    //     } catch (error) {
    //         console.log(error);
    //         throw new Error("No ethereum object.");
    //     }
    // };

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    return (
        <TransactionContext.Provider
            value={{
                connectWallet,
                currentAccount,
                formData,
                handleChange,
                // sendTransaction, 
                transactions,
                isLoading,
                getProjectDetails,
                getAllProjects,
                getEtherumContract
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
};

TransactionProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useStateContext = () => useContext(TransactionContext);
