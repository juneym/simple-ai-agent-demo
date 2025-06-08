// Add your utility functions here
function parseInput(input: string): { zip: string; city: string } {
    const [zip, ...cityParts] = input.split(',');
    return { zip: zip.trim(), city: cityParts.join(',').trim() };
}

export { parseInput };