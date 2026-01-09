import './SkillItem.css';

export default function SkillItem({ skill }: {skill: string}) {
    return (
        <div className="skill-item">{skill}</div>
    );
}