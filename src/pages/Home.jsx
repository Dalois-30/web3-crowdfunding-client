import React, { useState, useEffect } from 'react'
import  { useContext } from "react"

import { DisplayCampaigns } from '../components';
import { useStateContext } from '../context';
// import { TransactionContext } from "../context/TransactionContext"

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const { address, getEtherumContract, getAllProjects } = useStateContext();
  // const { currentAccount, getEtherumContract, getAllProjects } = useContext(TransactionContext);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const data = await getAllProjects();
    console.log("data getted", data);

    setCampaigns(data);
    setIsLoading(false);
  }

  useEffect(() => {
    if (getEtherumContract) fetchCampaigns();
  }, [address, getEtherumContract]);

  return (
    <DisplayCampaigns
      title="All Differents Campaigns"
      isLoading={isLoading}
      campaigns={campaigns}
    />
  )
}

export default Home
