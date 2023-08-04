const fs = require('fs');
const path = require('path');
const reader = require('xlsx');

// Function to process a single file
function processFile(filePath) {
  const file = reader.readFile(filePath);
  const sheet = file.Sheets['Sheet1'];
  const jsonSheet = reader.utils.sheet_to_json(sheet);

  const columnNames = Object.keys(jsonSheet[0]).filter(column => column !== '__EMPTY');

  const removedIntents = new Set();
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
        if (removedIntents.has(originalUtterance) && removedIntents.has(column)) {
          // Do something with conflicting intents
        } else if (removedIntents.has(originalUtterance) || removedIntents.has(column)) {
          // One is present, ignore
        } else {
          // None present, add any one to removedIntents
          if (Math.random() > 0.5) {
            removedIntents.add(originalUtterance);
          } else {
            removedIntents.add(column);
          }
        }
      }
    });
  });

  return Array.from(removedIntents);
}

// Function to process all files in a directory
function processFilesInDirectory(directoryPath) {
  const intentResults = [];

  fs.readdirSync(directoryPath).forEach(file => {
    if (file.endsWith('.csv')) {
      const filePath = path.join(directoryPath, file);
      const intentName = path.basename(file, '.csv');
      const intentsRemoved = processFile(filePath);
      const allIntents = getAllIntents(filePath);
      const intentsKept = allIntents.filter(intent => !intentsRemoved.includes(intent));
      intentResults.push({
        intentName,
        fileName: file,
        intentsKept,
        intentsRemoved,
      });
    }
  });

  return intentResults;
}

// Function to get all intents from a file
function getAllIntents(filePath) {
  const file = reader.readFile(filePath);
  const sheet = file.Sheets['Sheet1'];
  const jsonSheet = reader.utils.sheet_to_json(sheet);

  const columnNames = Object.keys(jsonSheet[0]).filter(column => column !== '__EMPTY');
  return columnNames;
}

const directoryPath = './distance csv files'; // Update this with your directory path
const results = processFilesInDirectory(directoryPath);
console.log(results);
