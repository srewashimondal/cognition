import './LessonAbstractItem.css';

type LessonAbstractItemProp = {
    itemName: string;
    content: string;
};

export default function LessonAbstractItem({ itemName, content }: LessonAbstractItemProp) {
    return (
        <div className="lesson-abstract-item">
            <div className="lesson-abstract-branch" />
            <div className="lesson-abstract-card">
                <p>{itemName}</p>
                <p>{content}</p>
            </div>
        </div>
    );
}