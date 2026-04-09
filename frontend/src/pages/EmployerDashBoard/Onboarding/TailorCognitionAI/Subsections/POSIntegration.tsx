import '../TailorCognition.css';
import { useState, useEffect } from 'react';
import Question from "../../Question/Question";
import lightspeed_logo from '../../../../../assets/illustrations/lightspeed_logo.svg';
import info_icon from '../../../../../assets/icons/black-info-icon.svg';
import { Tooltip } from '@radix-ui/themes';
import shopify_logo from '../../../../../assets/illustrations/shopifypos_logo.png';
import type { OnboardingSubsection } from "../../../../../types/Onboarding/OnboardingSubsection";

export default function POSIntegration({ data, updateData, registerFormId, onNext }: OnboardingSubsection) {
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

    return (
        <div className="posi-div">
            <form id={formId} onSubmit={handleSubmit}>

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
                <button onClick={handlePOSConnect}>Connect</button>
            </div>

            <Question question={"Advanced Settings"} input_type={"checkbox"} 
            value={data.selectedSettings} onChange={(v) => updateData({ selectedSettings: v})} 
            options={["Sync Inventory", "Sync Products"]} />

            </form>
        </div>
    );
}