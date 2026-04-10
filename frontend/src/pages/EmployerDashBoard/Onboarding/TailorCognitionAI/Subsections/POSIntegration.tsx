import '../TailorCognition.css';
import { useState, useEffect } from 'react';
import { db } from '../../../../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import Question from "../../Question/Question";
import lightspeed_logo from '../../../../../assets/illustrations/lightspeed_logo.svg';
import info_icon from '../../../../../assets/icons/black-info-icon.svg';
import { Tooltip } from '@radix-ui/themes';
import shopify_logo from '../../../../../assets/illustrations/shopifypos_logo.png';
import type { OnboardingSubsection } from "../../../../../types/Onboarding/OnboardingSubsection";
import type { WorkspaceType } from '../../../../../types/User/WorkspaceType';
import Check from '../../../../../assets/icons/green-check.svg';

export default function POSIntegration({ user, data, updateData, registerFormId, onNext }: OnboardingSubsection & { user: any}) {
    const formId = "pos-integration-form";
    const [shopURL, setShopURL] = useState("");

    useEffect(() => {
        registerFormId(formId);
        return () => registerFormId(""); 
    }, []);
    
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        onNext(); 
    }

    const handlePOSConnect = async () => {
        if (data.posProvider === "Lightspeed") {
          const res = await fetch("http://127.0.0.1:8000/integrations/lightspeed/connect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workspace_id: data.workspaceId,
              settings: data.selectedSettings
            })
          });
      
          const result = await res.json();
          window.open(result.auth_url, "_blank");
        }
      
        if (data.posProvider === "Shopify POS") {
          if (!shopURL) {
            alert("Enter your Shopify store name");
            return;
          }
      
          const fullShop = `${data.shopURL}.myshopify.com`;
      
          const res = await fetch("http://127.0.0.1:8000/integrations/shopify/connect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workspace_id: data.workspaceId, // note that this isnt defined yet...
              settings: data.selectedSettings,
              shop: fullShop
            })
          });
      
          const result = await res.json();
          window.open(result.auth_url, "_blank");
        }
    };

    const [connectedPOS, setConnectedPOS] = useState<string | null>(null);
    useEffect(() => {
        const checkPOS = async () => {
            if (!user?.uid) return;
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
    
            if (!userSnap.exists()) return;
    
            const workspaceRef = userSnap.data().workspaceID;
    
            if (!workspaceRef) return;
    
            const workspaceSnap = await getDoc(workspaceRef);
    
            if (workspaceSnap.exists()) {
                const data = workspaceSnap.data() as Omit<WorkspaceType, "id">;
                setConnectedPOS(data.posProvider || null);
            }
        };
    
        checkPOS();
    }, [user]);

    return (
        <div className="posi-div">
            <form id={formId} onSubmit={handleSubmit}>

            {connectedPOS ?
                <div className="view-pos-provider">
                    <div className="pos-provider-info-wrapper">
                        <label>Current Provider</label>
                        <div className="pos-provider-info">
                        <div className="strengths-check">
                            <img src={Check} />
                        </div>
                            <p>{connectedPOS}</p>
                            <div className="green-pill">
                                Connected
                            </div>
                        </div>
                        <p className="small-text">Your workspace is already connected <br /> to an inventory. You may change this later in <br /> your Workspace Settings if you wish.</p>
                    </div>
                </div>
                :
                <>
                <Question question={"Select your Point of Scale System Provider"} input_type={"image-buttons"} 
                value={data.posProvider} onChange={(v) => updateData({ posProvider: v})} 
                options={["Lightspeed", "Shopify POS"]} fileOptions={[lightspeed_logo, shopify_logo]}
                direction={"Select an option."} />

                {data.posProvider === "Shopify POS" && (
                <div className="shopify-shop-connect">
                    <label>Enter your Shopify Shop URL</label>
                    <div className="shopify-shop-connect-input">
                        <div className="choice-text-wrapper">
                            <input 
                            placeholder="my-shop-1"
                            value={shopURL}
                            onChange={(e) => setShopURL(e.target.value)}
                            />
                        </div>
                        <span>.myshopify.com</span>
                        <Tooltip content="Enter the part before .myshopify.com from your Shopify admin URL. For example, if your store is my-shop-1.myshopify.com, enter 'my-shop-1'.">
                        <img src={info_icon} />
                        </Tooltip>
                    </div>
                </div>
                )}
                
                <div className="connect-div">
                    <button className="jw-continue" onClick={handlePOSConnect}>Connect</button>
                </div>
                </>
            }
            <Question question={"Advanced Settings"} input_type={"checkbox"} 
            value={data.selectedSettings} onChange={(v) => updateData({ selectedSettings: v})} 
            options={["Sync Inventory", "Sync Products"]} />

            </form>
        </div>
    );
}