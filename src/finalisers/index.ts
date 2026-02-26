import { Bundle as MagicStringBundle } from 'magic-string';

export type Finaliser = (
	magicString: MagicStringBundle,
	
) => MagicStringBundle;


function esm( magicString: MagicStringBundle) {
    return magicString.trim()
}

export default { esm } as {
    [format: string]: Finaliser
}