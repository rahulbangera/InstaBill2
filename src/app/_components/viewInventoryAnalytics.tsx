import { useState, useEffect, useRef } from "react";

const ViewInventoryAnalytics = ({ shopId }: { shopId: string }) => {
    interface InventoryData {
        date: string;
        inventory: number;
    }
    
    const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);
    
    const dummyInventoryData = [
        { date: "01", inventory: 100 },
        { date: "02", inventory: 150 },
        { date: "03", inventory: 200 },
        { date: "04", inventory: 250 },
        { date: "05", inventory: 300 },
        { date: "06", inventory: 350 },
        { date: "07", inventory: 400 },
    ];
    
    const [inventoryData1] = useState(dummyInventoryData);
    
    return (
        <div>
       <h2 className="text-center">Coming Soon</h2>
        </div>
    );
    }

export default ViewInventoryAnalytics;
