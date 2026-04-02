import './GenerationLoadingPage.css';
import { useState, useEffect } from "react";

const simSteps = [
    { t: 0,    msg: "Stocking the shelves" },
    { t: 1800, msg: "Setting up the register" },
    { t: 2800, msg: "Sending in your customer" },
];

const modSteps = [
    { t: 0,    msg: "Designing the store layout" },
    { t: 1800, msg: "Configuring customer scenarios" },
    { t: 2800, msg: "Setting difficulty & objectives" },
];

export default function GenerationLoadingPage({ type }: { type: "simulation" | "module"}) {
    const steps = type === "simulation" ? simSteps : modSteps;
    useEffect(() => {
        const sub = document.getElementById("sub");
        if (!sub) return;
    
        const timers = steps.map(({ t, msg }) =>
            setTimeout(() => {
                sub.style.opacity = "0";
                setTimeout(() => {
                    sub.textContent = msg;
                    sub.style.opacity = "1";
                }, 250);
            }, t)
        );
    
        return () => timers.forEach(clearTimeout);
      }, []);

      useEffect(() => {
        const sub = document.getElementById("sub");
        if (!sub) return;
      
        const totalDuration = 5000;
        let timers: ReturnType<typeof setTimeout>[] = [];
      
        const runLoop = () => {
            timers.forEach(clearTimeout);
            timers = [];
        
            steps.forEach(({ t, msg }) => {
            timers.push(
                setTimeout(() => {
                    sub.style.opacity = "0";
                    setTimeout(() => {
                        sub.textContent = msg;
                        sub.style.opacity = "1";
                    }, 250);
                }, t)
            );
        });
      
          timers.push(setTimeout(runLoop, totalDuration));
        };
      
        runLoop();
      
        return () => timers.forEach(clearTimeout);
      }, []);

    const [key, setKey] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeout(() => {
                setKey(k => k + 1);
            }, 1000); 
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
      <main className="generation-loading">
        <div className="store" key={key}>
            <div className="shelf-leg leg-l"></div>
            <div className="shelf-leg leg-r"></div>

            <div className="shelf shelf-1"></div>
            <div className="shelf shelf-2"></div>
            <div className="shelf shelf-3"></div>
            <div className="floor"></div>
  
            <div className="row1">
                <div className="item tall c-sky"   style={{ left: '18px',  animationDelay: '0.2s'  }}></div>
                <div className="item med  c-org"   style={{ left: '40px',  animationDelay: '0.35s' }}></div>
                <div className="item tall c-sky2"  style={{ left: '60px',  animationDelay: '0.5s'  }}></div>
                <div className="item med  c-muted" style={{ left: '82px',  animationDelay: '0.65s' }}></div>
                <div className="item short c-org2" style={{ left: '103px', animationDelay: '0.8s'  }}></div>
                <div className="item tall c-sky"   style={{ left: '127px', animationDelay: '0.95s' }}></div>
            </div>
  
            <div className="row2">
                <div className="item med   c-org"   style={{ left: '18px',  animationDelay: '1.1s'  }}></div>
                <div className="item tall  c-sky2"  style={{ left: '38px',  animationDelay: '1.25s' }}></div>
                <div className="item short c-muted" style={{ left: '60px',  animationDelay: '1.4s'  }}></div>
                <div className="item tall  c-org2"  style={{ left: '84px',  animationDelay: '1.55s' }}></div>
                <div className="item med   c-sky"   style={{ left: '106px', animationDelay: '1.7s'  }}></div>
                <div className="item tall  c-org"   style={{ left: '127px', animationDelay: '1.85s' }}></div>
            </div>
  
            <div className="row3">
                <div className="item short c-sky"   style={{ left: '18px',  animationDelay: '2.0s'  }}></div>
                <div className="item med   c-org2"  style={{ left: '42px',  animationDelay: '2.15s' }}></div>
                <div className="item tall  c-sky2"  style={{ left: '62px',  animationDelay: '2.3s'  }}></div>
                <div className="item short c-muted" style={{ left: '84px',  animationDelay: '2.45s' }}></div>
                <div className="item med   c-org"   style={{ left: '108px', animationDelay: '2.6s'  }}></div>
            </div>
  
            <div className="counter">
                <div className="register">
                    <div className="register-screen"></div>
                </div>
            </div>
  
            <div className="figure">
                <div className="fig-head"></div>
                <div className="fig-body"></div>
            </div>
  
            <div className="speech">How can I help you?</div>
        </div>
  
        <div>
          <p className="main-msg">
            {type === "simulation" ? "Building your simulation" : "Creating module"}
            <span className="dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </p>
          <p className="sub" id="sub">Stocking the shelves</p>
        </div>
      </main>
    );
}