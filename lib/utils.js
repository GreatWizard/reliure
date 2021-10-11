// Following https://yaml.org/type/bool.html
module.exports.parseBool = (value) => {
  switch (value) {
    case true:
    case 'y':
    case 'Y':
    case 'yes':
    case 'Yes':
    case 'YES':
    case 'true':
    case 'True':
    case 'TRUE':
    case 'on':
    case 'On':
    case 'ON':
      return true
    case false:
    case 'n':
    case 'N':
    case 'no':
    case 'No':
    case 'NO':
    case 'false':
    case 'False':
    case 'FALSE':
    case 'off':
    case 'Off':
    case 'OFF':
      return false
    default:
      return undefined
  }
}
