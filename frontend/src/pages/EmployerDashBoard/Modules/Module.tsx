import './Modules.css';

type ModuleProp = {
    moduleInfo: Record<string, any>;
};

export default function Module({ moduleInfo }: ModuleProp) {
    return (
        <div key={moduleInfo.id} className="module-card">
            <div className="card-top">
              <div className="thumbnail" />
              <button className="edit-btn">✎ Edit</button>
            </div>

            <div className="card-content">
              <span className="subtitle">{moduleInfo.subtitle}</span>
              <p className="desc">{moduleInfo.description}</p>
              <h3>{moduleInfo.title}</h3>

              <div className="meta">
                <span>{moduleInfo.hours}</span>
                <span>{moduleInfo.lessons}</span>
              </div>

              <button className="deploy-btn">🚀 Deploy</button>
            </div>
        </div>
    );
}