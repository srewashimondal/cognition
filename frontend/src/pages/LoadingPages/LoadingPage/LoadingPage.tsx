import './LoadingPage.css';
import { useEffect, useState } from "react";
import blueSlab from '../../../assets/branding/cognition-blue-slab.svg';
import orangeSlab from '../../../assets/branding/cognition-orange-slab.svg';

export default function LoadingPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const start = Date.now();
        const fetchData = async () => {
        await new Promise((res) => setTimeout(res, 200)); 
        const elapsed = Date.now() - start;
        const remaining = Math.max(1000 - elapsed, 0);

        setTimeout(() => {
            setLoading(false);
        }, remaining);
        };

        fetchData();
    }, []);

    return (
        <main className="loading-page">
            <div className="loading-slabs">
                <img className="orange-slab" src={orangeSlab} />
                <img className="blue-slab" src={blueSlab} />
            
            </div>
        </main>
    );
}