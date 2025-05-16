import { JSX } from "react";

interface TranslationProps {
    children?: React.ReactNode;
}

function Translation({children}: TranslationProps): JSX.Element {
    return (
        <p className="text-2xl text-center text-yellow-300 font-bold">
                {children}
        </p>
    )
}

export {Translation}