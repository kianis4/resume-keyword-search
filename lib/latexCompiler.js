import latex from 'node-latex';
import fs from 'fs';
import path from 'path';

export async function compileLatexToPdf(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    // Create read and write streams
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    // Define latex options if needed
    const options = {
      inputs: [path.dirname(inputPath)], // Directory containing the .tex file
      cmd: 'pdflatex', // Command to run (default is pdflatex)
      args: ['-halt-on-error'], // Arguments passed to the command
      passes: 1, // Number of times to run the command
    };

    // Compile the LaTeX document
    const pdf = latex(input, options);

    // Pipe the output to the write stream
    pdf.pipe(output);
    pdf.on('error', (err) => {
      console.error('LaTeX compilation error:', err);
      reject(err);
    });
    pdf.on('finish', () => {
      console.log('PDF generated!');
      resolve();
    });
  });
}
