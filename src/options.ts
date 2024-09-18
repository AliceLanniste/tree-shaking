type inputOption =Record<string,string>;

export interface InputOptions {
    input?: inputOption;
}

export interface OutputOptions {

}


export interface rainbowOptions extends InputOptions {
    output?: OutputOptions;
}