import { buildReact } from 'luao-rollup';
import { Command } from 'commander'
const program = new Command();
const handleFileCmd = () => { 
    program
    .option('-w,--w','watch code running...')
    .action((name) => {
        buildReact(name)
    }
).parse(process.argv)
return Promise.resolve('done')
}

handleFileCmd();