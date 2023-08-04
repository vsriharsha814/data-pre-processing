const reader = require('xlsx');
const filePath = './distance csv files/shift.csv';

const file = reader.readFile(filePath);
const sheet = file.Sheets['Sheet1'];
const jsonSheet = reader.utils.sheet_to_json(sheet);

const columnNames = Object.keys(jsonSheet[0]).filter(column => column !== '__EMPTY');

const set = new Set();
const checkedPairs = new Set(); // Keep track of checked row-column pairs

jsonSheet.forEach((row, rowIndex) => {
  columnNames.forEach((column, columnIndex) => {
    if (
      rowIndex === columnIndex ||
      rowIndex < 0 || columnIndex < 0 ||
      checkedPairs.has(`${rowIndex}-${columnIndex}`)
    ) {
      return; // Skip this iteration
    }

    checkedPairs.add(`${rowIndex}-${columnIndex}`); // Mark this pair as checked

    const distance = parseFloat(row[column]);
    const originalUtterance = row['__EMPTY'];
    
    if (distance < 0.1) {
      console.log(`Identified low blow: ${originalUtterance} VS ${column} with a distance ${distance}`);

      if (set.has(originalUtterance) && set.has(column)) {
        console.log("TWO CONFLICTING UTTERANCES ALREADY IN SET, NOT IDEAL");
      } else if (set.has(originalUtterance) || set.has(column)) {
        // One is present, ignore
      } else {
        // None present, add any one to set
        if (Math.random() > 0.5) {
          set.add(originalUtterance);
        } else {
          set.add(column);
        }
      }
    }
  });
});

console.log(set);
