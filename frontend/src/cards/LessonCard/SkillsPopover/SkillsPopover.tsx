import './SkillsPopover.css';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage';
import SkillItem from '../SkillItem/SkillItem';
import grey_search from '../../../assets/icons/lesson-edit/grey-search.svg';

type SkillsPopoverProps = {
    actionType: "add" | "delete";
    onClick?: () => void;
    search? : string;
    setSearch?: (search: string) => void;
    addSkill?: (skill: string) => void;
    error?: string | null;
}

const allSkills: string[] = [
    "Spatial Reasoning",
    "Department Zones",
    "Store Layout Awareness",
    "Aisle Navigation",
    "Shortest Path Routing",
    "SKU Recognition",
    "Brand Familiarity",
    "Category Grouping",
    "Product Substitution",
    "Cross-Selling",
    "Upselling",
    "Greeting & Engagement",
    "Active Listening",
    "Clarifying Questions",
    "Tone",
    "Professional Communication",
    "Confidence Under Pressure",
    "Stock Awareness",
    "Out-of-Stock Handling",
    "Inventory Lookup",
    "Backroom Coordination",
    "Discontinued Item Handling",
    "POS Navigation",
    "Transaction Accuracy",
    "Payment Processing",
    "Returns & Exchanges",
    "Discount Application",
    "Hazard Identification",
    "Emergency Response",
    "Policy Compliance",
    "Loss Prevention Awareness",
    "Escalation Protocols",
    "Task Prioritization",
    "Multitasking",
    "Time Management",
    "Interrupt Handling",
    "Workload Balancing",
    "Decision Making",
    "Situational Awareness",
    "Critical Thinking",
    "Adaptability",
    "De-escalation",
    "Empathy",
    "Stress Management",
    "Customer De-escalation",
    "Handling Difficult Customers",
    "Policy Explanation",
    "Conflict Resolution",
    "Accuracy vs Speed Tradeoff"
];


export default function SkillsPopover({ actionType, onClick, search, setSearch, addSkill, error }: SkillsPopoverProps) {
    const handleSearch: () => void = () => {
        addSkill?.(search ?? "");
    };

    const normalizedSearch = (search ?? "").toLowerCase();

    const filteredSkills = allSkills.filter(skill =>
        skill.toLowerCase().includes(normalizedSearch)
    );
    
    switch (actionType) {
        case "add": 
            return (<div className={`skill-popover ${actionType}`} onClick={(e) => e.stopPropagation()}>
                <div className="skill-search-wrapper">
                    <input type="text" placeholder="Type to find a skill..." value={search} onChange={(e) => (setSearch?.(e.target.value))}
                    onKeyDown={(e) => {if (e.key === "Enter") {
                          e.preventDefault();
                          handleSearch();
                        }
                    }}/>
                    <span className="skill-search-icon" onClick={handleSearch}>
                        <img src={grey_search}/>
                    </span>
                </div>
                <ErrorMessage message={error ?? ""} />
                <div className="suggested-skills">
                    <p className="suggested-text">Suggested</p>
                    <div className="skills-grid">
                        {filteredSkills.map((s) => (<SkillItem skill={s} toAdd={true} onAdd={() => addSkill?.(s)} />))}
                    </div>
                </div>
            </div>);
        case "delete":
            return (<div className={`skill-popover ${actionType}`} onClick={onClick}>
                <span>Delete?</span>
            </div>);
    }
}