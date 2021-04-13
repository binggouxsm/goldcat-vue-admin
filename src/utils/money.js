const setting ={
  symbol: "¥",
  decimal: ".",
  thousand: ",",
  precision: 2,
  grouping: 4
}

const toFixed = function (value, precision = setting.precision) {
  let power = Math.pow(10, precision);
  // Multiply up by precision, round accurately, then divide and use native toFixed():
  return (Math.round(value * power) / power).toFixed(precision);
}

const formatPattern = function(grouping){
  if(grouping == 3)
    return /(\d{3})(?=\d)/g
  else if(grouping ==4)
    return /(\d{4})(?=\d)/g
  else
    throw new Error("error group setting")
}

const formatNumber  = function (number, precision = setting.precision, grouping= setting.grouping, decimal = setting.decimal, thousand = setting.thousand) {
  let negative = number < 0 ? "-" : "",
    base = parseInt(toFixed(Math.abs(number || 0), precision), 10) + "",
    mod = base.length > grouping ? base.length % grouping : 0,
    pattern = formatPattern(grouping);
  return negative + (mod ? base.substr(0, mod) + thousand : "") + base.substr(mod).replace(pattern, "$1" + thousand) + (precision ? decimal + toFixed(Math.abs(number), precision).split('.')[1] : "");
}

 export  {
  formatNumber
 }


