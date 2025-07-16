
/*export const useWalletBalance = () => {
  const { activeWallet } = useContext(WalletContext);

  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const fetchBalance = async () => {
      if (activeWallet) {
        const result = await window.ic?.plug?.requestBalance();
        setBalance(result?.icp?.amount || 0);
      }
    };
    
    fetchBalance();
    const interval = setInterval(fetchBalance, 15000);
    return () => clearInterval(interval);
  }, [activeWallet]);

  return balance;
};*/