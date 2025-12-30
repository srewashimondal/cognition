import './Question.css';

type QuestionProps = {
    question: string;
    input_type: "typed" | "select" | "radio" | "range" | "dropdown" | "upload";
    options?: Array<string>;
};

export default function Question({ question, input_type, options=[] }: QuestionProps) {
    return (
        <div>Question</div>
    );
}