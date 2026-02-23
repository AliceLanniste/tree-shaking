import Module from '../Module';

function guessIndentString(code: string) {
    const lines = code.split('\n');
    const tabbed = lines.filter(line => /^\t+/.test(line));
    const spaced = lines.filter(line => /^ {2,}/.test(line));

    if (tabbed.length === 0 && spaced.length === 0) return null;

    if(tabbed.length >= spaced.length) return '\t';

    const min = spaced.reduce((previous,current) => {
        const numSpaces = /^ +/.exec(current)[0].length;
        return Math.min(numSpaces, previous);
    },Infinity);

    return new Array(min + 1).join(' ');
}

export default function getIndentString(modules: Module[], options: {indent?: boolean}) {
    if (options.indent !== true) return options.indent || '';

    for(let i = 0; i < modules.length; i++) {
        let indent = guessIndentString(modules[i].code);
        if (indent) return indent;
    }

    return '\t';
}