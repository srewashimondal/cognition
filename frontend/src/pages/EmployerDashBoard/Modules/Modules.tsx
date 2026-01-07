import "./Modules.css";
import ModuleCard from '../../../cards/ModuleCard/ModuleCard.tsx';
import add_cta from '../../../assets/icons/add-cta.svg';

type Module = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  hours: string;
  lessons: string;
  deployed?: boolean;
};

const modules: Module[] = [
  {
    id: 1,
    title: "Store Orientation and Navigation",
    subtitle: "Color Styles",
    description: "Let’s learn about colors, color contrast and color styles.",
    hours: "1:30hrs",
    lessons: "03 Lessons",
    deployed: true
  },
  {
    id: 2,
    title: "Product Knowledge & Inventory",
    subtitle: "Color Styles",
    description: "Let’s learn about colors, color contrast and color styles.",
    hours: "1:30hrs",
    lessons: "03 Lessons",
  },
  {
    id: 3,
    title: "Customer Interaction & Communication",
    subtitle: "Color Styles",
    description: "Let’s learn about colors, color contrast and color styles.",
    hours: "1:30hrs",
    lessons: "03 Lessons",
  },
  {
    id: 4,
    title: "Checkout, POS, & Transactions",
    subtitle: "Color Styles",
    description: "Let’s learn about colors, color contrast and color styles.",
    hours: "1:30hrs",
    lessons: "03 Lessons",
  },
  {
    id: 5,
    title: "Safety, Compliance, & Store Policy",
    subtitle: "Color Styles",
    description: "Let’s learn about colors, color contrast and color styles.",
    hours: "1:30hrs",
    lessons: "03 Lessons",
  },
  {
    id: 6,
    title: "Multitasking & Real World Pressure",
    subtitle: "Color Styles",
    description: "Let’s learn about colors, color contrast and color styles.",
    hours: "1:30hrs",
    lessons: "03 Lessons",
  },
];

export default function Modules() {
  return (
    <div className="modules-page">
      {/* Header */}
      <div className="modules-header">
        <div>
          <h1>Modules Catalog</h1>
          <p>Access and review past training sessions</p>
        </div>

      </div>

      {/* Grid */}
      <div className="modules-grid">
        {modules.map((m) => (<ModuleCard moduleInfo={m} />))}
      </div>

      {/* Pagination */} {/* Note: maybe make a pagination component laterr */}
      <div className="pagination">
        <button disabled>{"<"}</button>
        <button className="active">1</button>
        <button>{">"}</button>
      </div>

      {/* Floating Add Button */}
      <button className="fab">
        <img src={add_cta}/>
      </button>
    </div>
  );
}
