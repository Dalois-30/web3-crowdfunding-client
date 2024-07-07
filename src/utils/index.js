export const daysLeft = (deadline) => {
  const difference = new Date(deadline).getTime() * 1000 - Date.now();
  console.log("every difference", difference, new Date(deadline).getTime() * 1000, Date.now())
  if (difference <= 0) {
    return 'Expired';
  }

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} left`;
  } else if (hours > 0) {
    return `${hours % 24} hour${hours % 24 > 1 ? 's' : ''} left`;
  } else if (minutes > 0) {
    return `${minutes % 60} minute${minutes % 60 > 1 ? 's' : ''} left`;
  } else {
    return `${seconds % 60} second${seconds % 60 > 1 ? 's' : ''} left`;
  }
};


export const calculateBarPercentage = (goal, raisedAmount) => {
  const percentage = Math.round((raisedAmount * 100) / goal);

  return percentage;
};

export const checkIfImage = (url, callback) => {
  const img = new Image();
  img.src = url;

  if (img.complete) callback(true);

  img.onload = () => callback(true);
  img.onerror = () => callback(false);
};
