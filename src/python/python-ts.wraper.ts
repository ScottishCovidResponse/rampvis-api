import { PythonShell } from 'python-shell';
import path from "path";

import { logger } from "../utils/logger";
import { ComputeTypeEnum } from "./compute-type.enum";

function PythonTSWrapper(input: any[], type: ComputeTypeEnum) : Promise<any[]> {

    return new Promise((resolve: any) => {
        const pythonScriptPath = path.resolve(__dirname, './');
        logger.debug(`PythonTSWrapper: execute: ${type}.py, input: ${input}`);

        let options: any = {
            mode: 'json',
            // pythonPath: '/usr/bin/python',   // set python interpreter path
            pythonOptions: ['-u'],              // get print results in real-time
            scriptPath: pythonScriptPath,
        };

        let pyshell = new PythonShell(type+'.py', options);

        pyshell.send(JSON.stringify(input));

        pyshell.on('message', (result) => {
            // received a message from the Python script
            logger.debug('PythonTSWrapper: result: ', result);
            resolve(result);
        });

        // end the input stream and allow the process to exit
        pyshell.end(function (err, code, signal) {
            // TODO // Handle it properly with error code
            if (err) throw err;

            logger.debug('PythonTSWrapper: exit code : ', code, ', signal : ', signal, ', status: finished...');
        });
    });

}


export { PythonTSWrapper }
