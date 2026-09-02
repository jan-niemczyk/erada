function fileToExport(data) {
  const pug = require('pug');
  const compiledFunction = pug.compileFile('Utils/Templates/voting-result.pug');

  data.countYes = data.result.filter(v=> v.result === "za").length;
  data.countNo = data.result.filter(v=> v.result === "przeciw").length;
  data.countHold = data.result.filter(v=> v.result === "wstrzymuję się").length;

  return compiledFunction({
    data: data,
    votingResults: data.result,
    votesLength: data.result.length,
    presence_number: data.sitting.presence_number
  });
}



module.exports = fileToExport;
