import React, { useState, useEffect } from 'react'
import  { useContext } from "react"

import { DisplayCampaigns } from '../components';
// import { useStateContext } from '../context';
import { TransactionContext } from "../context/TransactionContext"

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  // const { address, contract, getCampaigns } = useStateContext();
  const { currentAccount, getEtherumContract, getAllProjects } = useContext(TransactionContext);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const data = await getAllProjects();
    setCampaigns(data);
    setIsLoading(false);
  }

  useEffect(() => {
    if (getEtherumContract) fetchCampaigns();
  }, [currentAccount, getEtherumContract]);

  return (
    <DisplayCampaigns
      title="All Differents Campaigns"
      isLoading={isLoading}
      campaigns={campaigns}
    />
  )
}

export default Home