import { useState, useRef, useEffect } from 'react';

const MpesaBitcoinPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className=" w-3/5 md:w-[350px] h-auto fixed bottom-5 right-5 z-60">
      {/* Main Palette */}
      <div
        ref={paletteRef}
        className={`bg-gradient-to-br from-green-700 to-green-800 text-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 ease-in-out transform ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        
      >
        <div className="flex justify-between items-center p-4 bg-black bg-opacity-80">
          <h3 className="text-lg font-semibold">Buy Bitcoin via M-Pesa</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-2xl hover:scale-110 transition-transform focus:outline-none"
          >
            
          </button>
        </div>

        <div className="p-5">
          <ol className="list-decimal pl-5 space-y-2 mb-4">
            <li>Find a seller on Paxful/LocalBitcoins who accepts M-Pesa</li>
            <li>Initiate a trade and select "M-Pesa" as payment method</li>
            <li>Enter the Bitcoin address of  chain group that you'll see in your dashboard</li>
            <li>Specify the amount in KES or BTC</li>
            <li>You'll receive the seller's M-Pesa details</li>
            <li>Send payment via M-Pesa (Safaricom Paybill or Personal Number)</li>
            <li>Upload payment receipt as proof</li>
            <li>Seller releases Bitcoin to your wallet address</li>
            <li>Wait for blockchain confirmation (typically 10-30 minutes) and your payment will reflect here in our systems</li>
          </ol>

          <div className="bg-white bg-opacity-10 p-3 rounded-lg text-sm space-y-1">
            <p className="font-bold">Important Notes:</p>
            <p>• Only trade with verified sellers with good ratings</p>
            <p>• Never share your M-Pesa PIN with anyone</p>
            <p>• Transactions are irreversible - double-check details</p>
            <p>• Some platforms may require ID verification for larger amounts</p>
          </div>
        </div>
      </div>

      {/* Trigger Button */}
      <button
        onClick={(e:any) => {
          alert("guide clicked")
          return setIsOpen(true)
        }}
        className=" cursor-pointer mt-4 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-full p-2 md:px-6 md:py-4 w-20 h-20 md:w-auto md:h-auto flex items-end justify-end shadow-lg hover:scale-110 transition-all focus:outline-none"
      >
        <span className="text-sm md:text-2xl font-medium text-center">M-Pesa Guide</span>
      </button>
    </div>
  );
};

export default MpesaBitcoinPalette;