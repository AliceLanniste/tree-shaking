import readFileSync from 'node:fs';



function runSamples(sampleDirectory) {

    for (const fileName of readFileSync(sampleDirectory)
        .filter(name => name[0] !== '.')
		.sort()) {
         runTestsInDirecotry();
    }
}



function runTestsInDirecotry() {

}